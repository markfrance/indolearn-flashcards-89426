'use strict';
/**
 * Supabase server client configuration.
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for admin-level operations.
 */
const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

if (!config.supabase?.url || !config.supabase?.serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase is not fully configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * PUBLIC_INTERFACE
 * Resolve a Supabase user from a bearer access token.
 * @param {string} accessToken - Supabase access token from Authorization header.
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
async function getUserFromAccessToken(accessToken) {
  /** Resolve the Supabase user for provided access token using admin client. */
  if (!accessToken) return null;
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) return null;
  return data?.user || null;
}

module.exports = {
  supabase,
  getUserFromAccessToken,
};
