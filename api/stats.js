const path = require('path');
const QueryLogger = require('../services/queryLogger');

// Usa /tmp que es escribible en Vercel
const logsPath = '/tmp/shellti-logs';
const logger = new QueryLogger(logsPath, 7);

module.exports = function handler(req, res) {
  const { method, query, body } = req;

  try {
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
      const consultaId = logger.logQuery(body);
      return res.status(consultaId ? 200 : 500).json({
        consulta_id: consultaId,
        status: consultaId ? 'logged' : 'error'
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Stats Error]', error);
    res.status(500).json({ error: error.message });
  }
};
