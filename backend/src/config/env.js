'use strict';
/**
 * Environment configuration loader for Supabase-backed API.
 * Reads environment variables and exposes them in a typed way.
 * Note: Do not write the .env file directly; variables are expected to be provided by the environment.
 */

require('dotenv').config();

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3001', 10),
    // Optional site URL used for email redirect in Supabase signUp flows
    siteUrl: process.env.SITE_URL || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    // Optional: If you want to validate JWTs locally instead of calling Supabase
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  },
};

// Basic validation to surface misconfiguration early
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn('WARNING: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set. API will not be able to access data.');
}

module.exports = config;
