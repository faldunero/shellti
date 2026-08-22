// api/stats.js — Vercel Serverless Function
// Logging system: Registra consultas de usuarios y genera reportes

const QueryLogger = require('../services/queryLogger');

const logger = new QueryLogger('./logs', 7); // Rotación cada 7 días

export default function handler(req, res) {
  const { method, query, body } = req;

  // GET /api/stats?type=dashboard|usuarios|agentes
  if (method === 'GET') {
    const type = query.type || 'dashboard';

    if (type === 'dashboard') {
      const stats = logger.getStats();
      if (!stats) {
        return res.status(404).json({ error: 'No hay datos de logging' });
      }
      return res.status(200).json(stats);
    }

    if (type === 'usuarios') {
      const stats = logger.getStats();
      if (!stats) {
        return res.status(404).json({ error: 'No hay datos' });
      }
      return res.status(200).json({
        usuarios_activos: stats.por_usuario,
        usuarios_inactivos: stats.usuarios_inactivos
      });
    }

    if (type === 'agentes') {
      const stats = logger.getStats();
      if (!stats) {
        return res.status(404).json({ error: 'No hay datos' });
      }
      return res.status(200).json(stats.por_agente);
    }

    return res.status(400).json({ error: 'Tipo inválido. Use: dashboard, usuarios, agentes' });
  }

  // POST /api/stats — Registrar consulta
  if (method === 'POST') {
    try {
      const consultaId = logger.logQuery(body);
      if (!consultaId) {
        return res.status(500).json({ error: 'Error al registrar consulta' });
      }
      return res.status(200).json({ consulta_id: consultaId, status: 'logged' });
    } catch (error) {
      console.error('[Stats API] Error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // Método no permitido
  res.status(405).json({ error: 'Method not allowed' });
}
