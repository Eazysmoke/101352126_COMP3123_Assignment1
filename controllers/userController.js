const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const log = require('../utils/logger');

async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });

    log('signup_success', { userId: user.id });
    res.status(201).json({
      status: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    log('login_attempt');

    const { username, email, password } = req.body;
    const user = await User.findOne(
      username ? { username } : { email }
    ).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      log('login_failed', { reason: 'Invalid credentials' });
      return res.status(401).json({
        status: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: user.id,
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    log('login_success', { userId: user.id });
    res.status(200).json({
      status: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login };
