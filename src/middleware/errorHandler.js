const logger = require('./logger');

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  logger.error({
    message: err.message,
    status,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Erro interno do servidor'
      : err.message;

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
