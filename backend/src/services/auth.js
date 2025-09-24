'use strict';
const config = require('../config/env');
const { supabase } = require('../config/supabase');
const usersRepo = require('../models/users');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

/**
 * PUBLIC_INTERFACE
 * Register using Supabase Auth and create/update a public.users profile.
 */
async function register({ email, password, displayName }) {
  // Create Supabase auth user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: config.app.siteUrl || undefined,
      data: { display_name: displayName || null },
    },
  });
  if (signUpError) throw new BadRequestError(signUpError.message);

  const authUser = signUpData?.user;
  if (!authUser) throw new BadRequestError('Failed to create user');

  // Upsert into public.users profile table
  await usersRepo.upsertProfile({
    id: authUser.id,
    email: authUser.email,
    displayName: displayName || null,
  });

  // Return session token if available (email confirmation may be required)
  const sessionToken = signUpData?.session?.access_token || null;
  const profile = await usersRepo.findById(authUser.id);

  return { user: profile, token: sessionToken };
}

/**
 * PUBLIC_INTERFACE
 * Login via Supabase Auth; ensure public.users profile exists.
 */
async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.session) throw new UnauthorizedError(error?.message || 'Invalid credentials');

  const sbUser = data.user;
  // Ensure profile exists
  const profile = (await usersRepo.findById(sbUser.id)) ||
    (await usersRepo.upsertProfile({ id: sbUser.id, email: sbUser.email, displayName: sbUser.user_metadata?.display_name || null }));

  return { user: profile, token: data.session.access_token };
}

module.exports = {
  register,
  login,
};
