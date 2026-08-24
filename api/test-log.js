module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const QueryLoggerTurso = require('../services/queryLoggerTurso');
    const logger = new QueryLoggerTurso();
    
    const testQuery = {
      usuario_id: 'test_usuario_123',
      nombre_usuario: 'Test User',
      email: 'test@example.com',
      agente: 'compliance',
      pregunta: 'Test question from logging test',
      respuesta: 'This is a test response from the test endpoint',
      tiempo_ms: 250,
      tokens: 45
    };
    
    const id = await logger.logQuery(testQuery);
    
    return res.status(200).json({
      status: 'logged',
      consulta_id: id,
      message: 'Test query logged successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
};
