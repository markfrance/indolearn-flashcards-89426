'use strict';
const db = require('../config/db');
const { NotFoundError } = require('../utils/errors');

async function list() {
  const { rows } = await db.query('SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt" FROM categories ORDER BY name ASC');
  return rows;
}

async function getById(id) {
  const { rows } = await db.query('SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt" FROM categories WHERE id=$1 LIMIT 1', [id]);
  if (!rows[0]) throw new NotFoundError('Category not found');
  return rows[0];
}

async function create({ name, description }) {
  const { rows } = await db.query(
    'INSERT INTO categories (name, description) VALUES ($1,$2) RETURNING id',
    [name, description || null]
  );
  return getById(rows[0].id);
}

async function update(id, { name, description }) {
  const { rowCount } = await db.query(
    'UPDATE categories SET name=COALESCE($1,name), description=COALESCE($2,description), updated_at=NOW() WHERE id=$3',
    [name || null, description || null, id]
  );
  if (rowCount === 0) throw new NotFoundError('Category not found');
  return getById(id);
}

async function remove(id) {
  const { rowCount } = await db.query('DELETE FROM categories WHERE id=$1', [id]);
  if (rowCount === 0) throw new NotFoundError('Category not found');
  return { success: true };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
