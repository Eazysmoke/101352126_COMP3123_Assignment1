require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const connectDB = require('./config/db');
const User = require('./models/User');
const Employee = require('./models/Employee');
const log = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');

app.use(helmet());

app.use((req, res, next) => {
  res.on('finish', () => {
    log('http_request', {
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });
  next();
});

const limitHandler = (req, res) => {
  log('rate_limit_exceeded', { method: req.method, path: req.path });
  res.status(429).json({
    status: false,
    message: 'Too many requests. Please try again later.'
  });
};

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: limitHandler
}));

app.use('/api/v1/user', rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: limitHandler
}));

app.use(express.json({ limit: '20kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Employee API is running',
    database: mongoose.connection.readyState === 1
      ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

let databaseReady;

async function initializeDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }

  await connectDB();
  await Promise.all([User.init(), Employee.init()]);
}

app.use('/api', async (req, res, next) => {
  try {
    if (!databaseReady) {
      databaseReady = initializeDatabase().catch((error) => {
        databaseReady = null;
        throw error;
      });
    }

    await databaseReady;
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/emp', require('./routes/employeeRoutes'));

app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

if (require.main === module) {
  initializeDatabase().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      log('server_started', { port, database: 'connected' });
    });
  }).catch((error) => {
    log('startup_failed', { errorType: error.name });
    console.error('Check MongoDB connectivity and environment configuration.');
    process.exit(1);
  });
}

module.exports = app;
