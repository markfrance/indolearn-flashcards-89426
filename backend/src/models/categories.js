'use strict';
const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errors');

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function list() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description, created_at, updated_at')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(mapCategory);
}

async function getById(id) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error || !data) throw new NotFoundError('Category not found');
  return mapCategory(data);
}

async function create({ name, description }) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, description: description || null })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return getById(data.id);
}

async function update(id, { name, description }) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, description: description || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .single();
  if (error || !data) throw new NotFoundError('Category not found');
  return getById(id);
}

async function remove(id) {
  const { error, count } = await supabase.from('categories').delete({ count: 'exact' }).eq('id', id);
  if (error) throw new Error(error.message);
  if (!count) throw new NotFoundError('Category not found');
  return { success: true };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
