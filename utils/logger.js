const fs = require('fs');
const path = require('path');

const logDirectory = process.env.VERCEL
  ? path.join('/tmp', 'assignment1-logs')
  : path.join(__dirname, '..', 'logs');

function log(event, details = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...details
  });

  console.log(entry);

  try {
    fs.mkdirSync(logDirectory, { recursive: true });
    fs.appendFileSync(path.join(logDirectory, 'app.log'), entry + '\n');
  } catch {
    console.error('Unable to write application log');
  }
}

module.exports = log;
