const mongoose = require('mongoose');

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'comp3123_assignment1',
      serverSelectionTimeoutMS: 10000
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}

module.exports = connectDB;
