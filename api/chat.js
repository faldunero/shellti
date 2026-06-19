// api/chat.js — Vercel Serverless Function
// Proxy entre agente.html y Groq API. La GROQ_API_KEY nunca llega al browser.

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — solo desde shellti.com y localhost
  const origin = req.headers.origin || '';
  const allowed = ['https://shellti.com', 'https://shellti.vercel.app', 'http://localhost:3000', 'http://127.0.0.1'];
  if (allowed.some(o => origin.startsWith(o)) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Validar key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY no configurada en Vercel' });
  }

  // Validar body
  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Campo messages requerido' });
  }

  // Construir payload para Groq
  const groqMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 1500,
        messages: groqMessages
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return res.status(groqRes.status).json({
        error: err.error?.message || `Groq error ${groqRes.status}`
      });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ text });

  } catch (err) {
    console.error('[api/chat] error:', err);
    return res.status(500).json({ error: 'Error interno del proxy' });
  }
}
