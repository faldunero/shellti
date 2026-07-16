export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { responses, empresa, email } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY_SHELLTI;

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'API key no configurada' });
    }

    if (!responses) {
        return res.status(400).json({ error: 'Respuestas requeridas' });
    }

    try {
        // Construir prompt con las respuestas
        let prompt = `Analiza profundamente este cuestionario de cumplimiento de Ley 21.719 e ISO 27001:2022.

Empresa: ${empresa || 'N/A'}
Email: ${email || 'N/A'}

RESPUESTAS:
`;

        // responses es un objeto: { "q1": "Sí", "q2": "No", ... }
        Object.entries(responses).forEach(([key, answer]) => {
            prompt += `${key}: ${answer}\n`;
        });

        prompt += `
Genera un análisis COHERENTE que:
1. NO diga "satisfactorio" si hay brechas significativas
2. Sea específico a lo que falta
3. Tenga recomendaciones prioridades
4. Sea profesional y en español`;

        // Llamar a Groq
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres experto en compliance normativo. Hablas español. Genera análisis profundo, coherente y profesional.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2500
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Groq error:', error);
            return res.status(500).json({ error: 'Error al generar análisis' });
        }

        const data = await response.json();
        const analysis = data.choices?.[0]?.message?.content;

        if (!analysis) {
            return res.status(500).json({ error: 'No se generó análisis' });
        }

        res.status(200).json({ analysis });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error procesando solicitud' });
    }
}
