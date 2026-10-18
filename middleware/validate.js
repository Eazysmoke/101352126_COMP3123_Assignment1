const { validationResult } = require('express-validator');
const log = require('../utils/logger');

function validate(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((error) => ({
      field: error.path || 'body',
      message: error.msg
    }));

    log('validation_failed', { method: req.method, path: req.path });
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

function allowFields(fields) {
  return (req, res, next) => {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({
        status: false,
        message: 'Request body must be a JSON object'
      });
    }

    if (Object.keys(body).some((key) => !fields.includes(key))) {
      log('validation_failed', { reason: 'Unexpected body fields' });
      return res.status(400).json({
        status: false,
        message: 'Request contains unexpected fields'
      });
    }

    next();
  };
}

module.exports = { validate, allowFields };
