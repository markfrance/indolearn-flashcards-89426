'use strict';
const db = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

const USER_PUBLIC_FIELDS = 'id, email, display_name as "displayName", role, created_at as "createdAt", updated_at as "updatedAt"';

async function findByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email=$1 LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(`SELECT ${USER_PUBLIC_FIELDS} FROM users WHERE id=$1 LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ email, passwordHash, displayName, role = 'user' }) {
  try {
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4) RETURNING ' + USER_PUBLIC_FIELDS,
      [email, passwordHash, displayName, role]
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      // unique_violation
      throw new ConflictError('Email already exists');
    }
    throw err;
  }
}

async function updateProfile(id, { displayName }) {
  const { rowCount, rows } = await db.query(
    'UPDATE users SET display_name = COALESCE($1, display_name), updated_at = NOW() WHERE id=$2 RETURNING ' + USER_PUBLIC_FIELDS,
    [displayName || null, id]
  );
  if (rowCount === 0) throw new NotFoundError('User not found');
  return rows[0];
}

module.exports = {
  findByEmail,
  findById,
  create,
  updateProfile,
};
