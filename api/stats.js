const QueryLoggerTurso = require('../services/queryLoggerTurso');

// Initialize logger once at module load
let logger;
let initError = null;

try {
  logger = new QueryLoggerTurso();
  console.log('[stats.js] Logger initialized successfully');
  console.log('[stats.js] TURSO_DATABASE_URL exists:', !!process.env.TURSO_DATABASE_URL);
  console.log('[stats.js] TURSO_AUTH_TOKEN exists:', !!process.env.TURSO_AUTH_TOKEN);
} catch (error) {
  console.error('[stats.js] Error initializing logger:', error.message);
  initError = error;
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if logger initialized properly
    if (!logger) {
      console.error('[stats.js] Logger not initialized');
      return res.status(500).json({
        error: 'Logger initialization failed',
        details: initError ? initError.message : 'Unknown error'
      });
    }

    // GET endpoints: /api/stats?type=dashboard|usuarios|agentes
    if (req.method === 'GET') {
      const type = req.query.type || 'dashboard';

      if (type === 'dashboard') {
        const stats = await logger.getStats();
        if (!stats) {
          return res.status(404).json({ error: 'No hay datos de logging' });
        }
        return res.status(200).json(stats);
      }

      if (type === 'usuarios') {
        const stats = await logger.getStats();
        if (!stats) {
          return res.status(404).json({ error: 'No hay datos' });
        }
        return res.status(200).json({
          usuarios_activos: stats.por_usuario,
          usuarios_inactivos: stats.usuarios_inactivos
        });
      }

      if (type === 'agentes') {
        const stats = await logger.getStats();
        if (!stats) {
          return res.status(404).json({ error: 'No hay datos' });
        }
        return res.status(200).json(stats.por_agente);
      }

      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    // POST /api/stats - Log a new query
    if (req.method === 'POST') {
      const consultaId = await logger.logQuery(req.body);
      if (!consultaId) {
        return res.status(500).json({ error: 'Error logging query' });
      }
      return res.status(200).json({ consulta_id: consultaId, status: 'logged' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[stats.js] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
