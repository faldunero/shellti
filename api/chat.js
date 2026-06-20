// api/chat.js — Vercel Serverless Function
// Proxy ShellTI → Groq API con rate limiting por IP

// Rate limit: max 20 requests por IP cada 60 segundos
const rateLimitMap = new Map();
const RATE_LIMIT = 20;
const WINDOW_MS  = 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

// Limpiar IPs antiguas cada 5 minutos (evita memory leak)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now - entry.start > WINDOW_MS * 2) rateLimitMap.delete(ip);
    }
  }, 5 * 60 * 1000);
}

export default async function handler(req, res) {

  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  const origin = req.headers.origin || '';
  const allowed = ['https://shellti.com', 'https://shellti.vercel.app', 'http://localhost:3000'];
  if (allowed.some(o => origin.startsWith(o)) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Rate limit por IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
          || req.headers['x-real-ip']
          || req.socket?.remoteAddress
          || 'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Límite de consultas alcanzado. Intenta nuevamente en un minuto.'
    });
  }

  // Validar key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Servicio no configurado correctamente.' });
  }

  // Validar body
  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Formato de solicitud inválido.' });
  }

  // Sanitizar: máximo 12 mensajes, máximo 2000 chars por mensaje
  const safeMessages = messages
    .slice(-12)
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 2000)
    }));

  // Construir payload Groq
  const groqMessages = system
    ? [{ role: 'system', content: String(system).slice(0, 8000) }, ...safeMessages]
    : safeMessages;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens:  1200,
        messages:    groqMessages
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return res.status(groqRes.status).json({
        error: err.error?.message || `Error al procesar la consulta (${groqRes.status})`
      });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Headers de caché y seguridad
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    return res.status(200).json({ text });

  } catch (err) {
    console.error('[api/chat] error:', err.message);
    return res.status(500).json({ error: 'Error al contactar el servicio. Intenta nuevamente.' });
  }
}
