module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    env_vars: {
      turso_url: !!process.env.TURSO_DATABASE_URL,
      turso_token: !!process.env.TURSO_AUTH_TOKEN
    },
    timestamp: new Date().toISOString()
  });
};
