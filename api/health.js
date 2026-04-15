module.exports = function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'ChatMb Media Server',
    timestamp: new Date().toISOString(),
  });
};
