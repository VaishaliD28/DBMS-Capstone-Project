const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isRemoteDb = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') && !process.env.DB_HOST.includes('127.0.0.1');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_internship_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  timezone: '+00:00',
  ...(process.env.DB_SSL === 'true' || isRemoteDb ? { ssl: { rejectUnauthorized: false } } : {})
};

let pool = null;
let isConnected = false;
let fallbackStore = null;

// Initialize MySQL pool
try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('[Database] Initial pool creation error:', err.message);
}

// Test connection
async function testConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();
    isConnected = true;
    return true;
  } catch (err) {
    isConnected = false;
    console.warn('\n================================================================');
    console.warn('[Database Notice] Could not connect to local MySQL server:');
    console.warn(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    console.warn(`  User: ${dbConfig.user}`);
    console.warn(`  Database: ${dbConfig.database}`);
    console.warn(`  Reason: ${err.message}`);
    console.warn('----------------------------------------------------------------');
    console.warn('  -> To connect to your MySQL:');
    console.warn('     1. Ensure MySQL / XAMPP / MariaDB service is started.');
    console.warn('     2. Verify credentials in backend/.env');
    console.warn('     3. Run "npm run db:init" to create tables and seed data.');
    console.warn('  -> [Active Fallback] Running with in-memory relational mock');
    console.warn('     All APIs, dashboards, analytics and workflows remain fully functional.');
    console.warn('================================================================\n');
    initFallbackStore();
    return false;
  }
}

// In-Memory Fallback Relational Store for zero-crash demo readiness
function initFallbackStore() {
  if (fallbackStore) return;
  const initialData = require('./fallbackData');
  fallbackStore = initialData;
}

// Query helper
async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('[Database Query Error]:', err.message, '\nSQL:', sql);
      throw err;
    }
  }

  // Fallback handler if MySQL is offline
  if (!fallbackStore) {
    initFallbackStore();
  }
  return executeFallbackQuery(sql, params);
}

// Transaction Connection helper
async function getConnection() {
  if (isConnected && pool) {
    return await pool.getConnection();
  }
  return {
    async query(sql, params) {
      return [await query(sql, params)];
    },
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {}
  };
}

// Helper for fallback in-memory query routing
function executeFallbackQuery(sql, params) {
  const handler = require('./fallbackEngine');
  return handler(sql, params, fallbackStore);
}

// Trigger test connection on startup
testConnection();

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
  getIsConnected: () => isConnected,
  getFallbackStore: () => fallbackStore,
  dbConfig
};
