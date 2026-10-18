const log = require('../utils/logger');

function errorHandler(error, req, res, next) {
  let status = 500;
  let message = 'Internal server error';

  if (error.code === 11000) {
    status = 409;
    message = 'Username or email already exists';
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON request body';
  } else if (error.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  } else if (
    error.name === 'ValidationError' ||
    error.name === 'CastError'
  ) {
    status = 400;
    message = 'Invalid request data';
  }

  log('request_error', {
    method: req.method,
    path: req.path,
    status,
    errorType: error.name
  });

  res.status(status).json({ status: false, message });
}

module.exports = errorHandler;
