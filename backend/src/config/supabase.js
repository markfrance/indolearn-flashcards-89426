'use strict';
/**
 * Supabase server client configuration.
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for admin-level operations.
 */
const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

/**
 * Create a safe stub client that prevents application crash when SUPABASE env vars are missing.
 * The stub mirrors the minimal surface used by our code and returns descriptive errors.
 */
function createStubClient() {
  const error = new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the backend.');
  return {
    auth: {
      async getUser() {
        return { data: null, error };
      },
      async signUp() {
        return { data: null, error };
      },
      async signInWithPassword() {
        return { data: null, error };
      },
    },
    from() {
      // Throw early when attempting to access DB without configuration
      throw error;
    },
  };
}

const isConfigured = Boolean(config.supabase?.url && config.supabase?.serviceRoleKey);
if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.warn('Supabase is not fully configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

// Initialize real client only when configuration exists; otherwise, use stub to avoid crashing the server.
const supabase = isConfigured
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createStubClient();

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
