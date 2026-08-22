module.exports = function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    return res.status(200).json({
      test: 'success',
      message: 'Endpoint funcionando'
    });
  }

  if (method === 'POST') {
    return res.status(200).json({
      consulta_id: 'test_123',
      status: 'logged'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
