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
  const { messages, system, stream } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Formato de solicitud inválido.' });
  }

  // ── Presupuesto de tokens ──────────────────────────────────────────────
  // El plan actual de Groq limita a 8.000 tokens por minuto POR ORGANIZACIÓN
  // (entrada + salida, compartidos entre todos los visitantes del sitio).
  // Como ~4 chars ≈ 1 token, los topes de abajo mantienen cada petición
  // alrededor de 6.000-7.000 tokens y dejan margen bajo el techo.
  //
  // No subir estos números sin subir también el plan: si la petición excede
  // el TPM, Groq responde 413 y el agente deja de contestar por completo.
  const MAX_OUTPUT_TOKENS   = 1200;
  const SYSTEM_CHAR_BUDGET  = 12000;  // ~3.000 tokens
  const HISTORY_MSG_LIMIT   = 8;
  const HISTORY_CHAR_BUDGET = 1500;   // por mensaje, ~375 tokens

  const safeMessages = messages
    .slice(-HISTORY_MSG_LIMIT)
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, HISTORY_CHAR_BUDGET)
    }));

  const groqMessages = system
    ? [{ role: 'system', content: String(system).slice(0, SYSTEM_CHAR_BUDGET) }, ...safeMessages]
    : safeMessages;

  // Headers de caché y seguridad (comunes a ambos modos)
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  const wantsStream = stream === true;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 0.2,
        max_tokens:  MAX_OUTPUT_TOKENS,
        stream:      wantsStream,
        messages:    groqMessages
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));

      // El mensaje del proveedor puede traer el ID de la organización, los
      // límites del plan y enlaces de facturación: se registra, no se muestra.
      console.error('[api/chat] groq %d: %s', groqRes.status, err.error?.message || '(sin detalle)');

      const friendly = {
        413: 'La consulta es demasiado extensa. Inicia una conversación nueva e inténtalo otra vez.',
        429: 'Hay muchas consultas en curso. Espera unos segundos y vuelve a intentarlo.',
        401: 'El servicio no está disponible en este momento. Escríbenos a contacto@shellti.com.',
        403: 'El servicio no está disponible en este momento. Escríbenos a contacto@shellti.com.'
      }[groqRes.status] || 'No se pudo procesar la consulta. Inténtalo nuevamente en unos segundos.';

      return res.status(groqRes.status).json({ error: friendly });
    }

    // ── Modo no-streaming (fallback) ──
    if (!wantsStream || !groqRes.body) {
      const data = await groqRes.json();
      const text = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({ text });
    }

    // ── Modo streaming: SSE con framing propio ──
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // evita el buffering de proxies
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const send = obj => res.write('data: ' + JSON.stringify(obj) + '\n\n');

    const reader  = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let emitted = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // la última puede venir incompleta

        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;

          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;

          let chunk;
          try { chunk = JSON.parse(payload); } catch { continue; }

          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) { emitted += delta.length; send({ delta }); }
        }
      }
    } catch (streamErr) {
      console.error('[api/chat] stream error:', streamErr.message);
      send({ error: 'La respuesta se interrumpió. Intenta nuevamente.' });
    }

    if (emitted === 0) send({ error: 'El agente no devolvió contenido.' });

    res.write('data: [DONE]\n\n');
    return res.end();

  } catch (err) {
    console.error('[api/chat] error:', err.message);
    if (res.headersSent) return res.end();
    return res.status(500).json({ error: 'Error al contactar el servicio. Intenta nuevamente.' });
  }
}
