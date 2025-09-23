'use strict';
/**
 * Environment configuration loader.
 * Reads environment variables and exposes them in a typed way.
 * Note: Do not write the .env file directly; variables are expected to be provided by the environment.
 */

require('dotenv').config();

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET, // REQUIRED - must be provided by environment
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    // PostgreSQL connection through URL preferred; alternatively, use discrete vars.
    url: process.env.POSTGRES_URL || null,
    user: process.env.POSTGRES_USER || null,
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DB || null,
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : null,
    host: process.env.POSTGRES_HOST || 'localhost',
    ssl: (process.env.POSTGRES_SSL || 'false').toLowerCase() === 'true',
  },
};

if (!config.app.jwtSecret) {
  // eslint-disable-next-line no-console
  console.warn('WARNING: JWT_SECRET is not set. Authentication will not work properly.');
}

module.exports = config;
