const jwt = require('jsonwebtoken');
const User = require('../models/User');
const log = require('../utils/logger');

async function auth(req, res, next) {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer ([^\s]+)$/);

  if (!match) {
    log('authentication_failed', { reason: 'Missing bearer token' });
    return res.status(401).json({
      status: false,
      message: 'A Bearer token is required'
    });
  }

  let payload;

  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (
      typeof payload !== 'object' ||
      !/^[a-fA-F0-9]{24}$/.test(payload.sub || '')
    ) {
      throw new Error('Invalid token subject');
    }
  } catch (error) {
    log('authentication_failed', { reason: 'Invalid or expired token' });
    return res.status(401).json({
      status: false,
      message: error.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Invalid token'
    });
  }

  try {
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'User no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = auth;
