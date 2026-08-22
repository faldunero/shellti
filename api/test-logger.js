module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const QueryLoggerTurso = require('../services/queryLoggerTurso');
    const logger = new QueryLoggerTurso();
    return res.status(200).json({
      status: 'logger_ok',
      logger_initialized: true
    });
  } catch (error) {
    return res.status(500).json({
      status: 'logger_error',
      error: error.message,
      stack: error.stack.split('\n').slice(0, 5)
    });
  }
};
