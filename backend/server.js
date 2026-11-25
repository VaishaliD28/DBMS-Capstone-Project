const app = require('./app');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n=============================================================');
  console.log(`   Job & Internship Management System - Backend Server`);
  console.log(`   Listening on: http://localhost:${PORT}`);
  console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log('=============================================================\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
