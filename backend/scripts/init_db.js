const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function initDatabase() {
  console.log('\n=============================================================');
  console.log('   DBMS CAPSTONE: Job & Internship Database Initializer');
  console.log('=============================================================\n');

  let connection;

  try {
    console.log(`[1/5] Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port}...`);
    connection = await mysql.createConnection(dbConfig);
    console.log('  -> Connected successfully!');

    console.log('[2/5] Creating database "job_internship_db" if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS job_internship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.query('USE job_internship_db;');
    console.log('  -> Database selected.');

    // 1. Run Schema
    console.log('[3/6] Executing database/schema.sql (Tables, Constraints, Indexes, Views)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('  -> Tables and Views created successfully.');

    // 2. Run Sample Data (Seed before triggers to prevent duplicate audit logging)
    console.log('[4/6] Seeding initial data from database/sample_data.sql...');
    const sampleDataSql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'sample_data.sql'), 'utf8');
    await connection.query(sampleDataSql);
    console.log('  -> 16 Students, 6 Companies, 6 Recruiters, 25 Skills, 12 Opportunities & 28 Applications seeded!');

    // 3. Run Stored Procedures
    console.log('[5/6] Executing database/procedures.sql (Business Logic & Transactions)...');
    const proceduresSql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'procedures.sql'), 'utf8');
    
    // Split procedures by DELIMITER or execute blocks
    const procStatements = proceduresSql
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .split(/\$\$/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of procStatements) {
      if (stmt.toLowerCase().startsWith('use') || stmt.toLowerCase().startsWith('drop') || stmt.toLowerCase().startsWith('create')) {
        try {
          await connection.query(stmt);
        } catch (e) {
          console.warn('  -> Procedure notice:', e.message);
        }
      }
    }
    console.log('  -> Stored procedures registered successfully.');

    // 4. Run Triggers
    console.log('[6/6] Executing database/triggers.sql (Active Database Rules)...');
    const triggersSql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'triggers.sql'), 'utf8');
    const trigStatements = triggersSql
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .split(/\$\$/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of trigStatements) {
      if (stmt.toLowerCase().startsWith('use') || stmt.toLowerCase().startsWith('drop') || stmt.toLowerCase().startsWith('create')) {
        try {
          await connection.query(stmt);
        } catch (e) {
          console.warn('  -> Trigger notice:', e.message);
        }
      }
    }
    console.log('  -> Triggers installed successfully.');

    console.log('\n=============================================================');
    console.log('   DATABASE INITIALIZATION COMPLETE!');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('\n[Database Init Error]:', err.message);
    console.error('\nPlease verify that:');
    console.error(' 1. MySQL service is running on', `${dbConfig.host}:${dbConfig.port}`);
    console.error(' 2. The DB_USER and DB_PASSWORD in backend/.env are accurate.');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
