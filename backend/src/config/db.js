'use strict';
const { Pool } = require('pg');
const config = require('./env');

/**
 * Database connection manager using pg Pool.
 * Reads connection from POSTGRES_URL primarily, else builds from discrete vars.
 */
let pool;

function createPool() {
  if (config.db.url) {
    return new Pool({
      connectionString: config.db.url,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return new Pool({
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port || 5432,
    host: config.db.host,
    ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool = createPool();

/**
 * Execute a parameterized query safely.
 * @param {string} text - SQL query text
 * @param {Array} params - Parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      // eslint-disable-next-line no-console
      console.warn(`Slow query (${duration}ms): ${text}`);
    }
    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('DB query error:', err.message, { text, params });
    throw err;
  }
}

/**
 * Graceful shutdown
 */
function close() {
  return pool.end();
}

module.exports = {
  pool,
  query,
  close,
};
