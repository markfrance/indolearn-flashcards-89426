'use strict';
const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errors');

const USER_PUBLIC_FIELDS = 'id, email, display_name, role, created_at, updated_at';

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name || null,
    role: row.role || 'user',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByEmail(email) {
  const { data, error } = await supabase.from('users').select(USER_PUBLIC_FIELDS).eq('email', email).limit(1).single();
  if (error && error.code !== 'PGRST116') return null;
  return mapUser(data);
}

async function findById(id) {
  const { data, error } = await supabase.from('users').select(USER_PUBLIC_FIELDS).eq('id', id).limit(1).single();
  if (error) return null;
  return mapUser(data);
}

async function upsertProfile({ id, email, displayName, role = 'user' }) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id,
        email,
        display_name: displayName || null,
        role,
      },
      { onConflict: 'id' }
    )
    .select(USER_PUBLIC_FIELDS)
    .single();
  if (error) throw new Error(error.message);
  return mapUser(data);
}

async function updateProfile(id, { displayName }) {
  const { data, error } = await supabase
    .from('users')
    .update({ display_name: displayName || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(USER_PUBLIC_FIELDS)
    .single();
  if (error || !data) throw new NotFoundError('User not found');
  return mapUser(data);
}

module.exports = {
  findByEmail,
  findById,
  upsertProfile,
  updateProfile,
};
