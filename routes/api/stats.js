const express = require('express');
const router = express.Router();
const QueryLogger = require('../../services/queryLogger');

const logger = new QueryLogger('./logs', 7); // Rotación cada 7 días

// GET /api/stats/dashboard — Dashboard de uso
router.get('/dashboard', (req, res) => {
  const stats = logger.getStats();
  if (!stats) {
    return res.status(404).json({ error: 'No hay datos de logging' });
  }
  res.json(stats);
});

// GET /api/stats/usuarios — Listado de usuarios y su actividad
router.get('/usuarios', (req, res) => {
  const stats = logger.getStats();
  if (!stats) {
    return res.status(404).json({ error: 'No hay datos' });
  }
  res.json({
    usuarios_activos: stats.por_usuario,
    usuarios_inactivos: stats.usuarios_inactivos
  });
});

// GET /api/stats/agentes — Uso por agente
router.get('/agentes', (req, res) => {
  const stats = logger.getStats();
  if (!stats) {
    return res.status(404).json({ error: 'No hay datos' });
  }
  res.json(stats.por_agente);
});

// POST /api/stats/log — Registrar una consulta (middleware)
router.post('/log', (req, res) => {
  const consultaId = logger.logQuery(req.body);
  res.json({ consulta_id: consultaId, status: 'logged' });
});

module.exports = router;
