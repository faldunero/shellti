// api/stats.js — Vercel Serverless Function
const path = require('path');
const QueryLogger = require(path.join(__dirname, '../services/queryLogger'));

const logger = new QueryLogger(path.join(__dirname, '../logs'), 7);

export default function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    const type = query.type || 'dashboard';
    const stats = logger.getStats();

    if (type === 'dashboard') {
      return res.status(stats ? 200 : 404).json(stats || { error: 'No hay datos' });
    }
    if (type === 'usuarios') {
      return res.status(stats ? 200 : 404).json({
        usuarios_activos: stats?.por_usuario || {},
        usuarios_inactivos: stats?.usuarios_inactivos || []
      });
    }
    if (type === 'agentes') {
      return res.status(stats ? 200 : 404).json(stats?.por_agente || {});
    }
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  if (method === 'POST') {
    try {
      const consultaId = logger.logQuery(body);
      return res.status(consultaId ? 200 : 500).json({
        consulta_id: consultaId,
        status: consultaId ? 'logged' : 'error'
      });
    } catch (error) {
      console.error('[Stats]', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
