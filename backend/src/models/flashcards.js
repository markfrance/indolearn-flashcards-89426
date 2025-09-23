'use strict';
const db = require('../config/db');
const { NotFoundError } = require('../utils/errors');

const BASE_SELECT = `
SELECT 
  f.id, f.indonesian, f.english, f.part_of_speech as "partOfSpeech",
  f.example_sentence as "exampleSentence", f.difficulty, 
  f.category_id as "categoryId",
  c.name as "categoryName",
  f.created_at as "createdAt", f.updated_at as "updatedAt"
FROM flashcards f
LEFT JOIN categories c ON c.id = f.category_id
`;

async function list({ q, categoryId, partOfSpeech, limit = 50, offset = 0 }) {
  const params = [];
  const conds = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    conds.push('(LOWER(f.indonesian) LIKE $' + params.length + ' OR LOWER(f.english) LIKE $' + params.length + ')');
  }
  if (categoryId) {
    params.push(categoryId);
    conds.push('f.category_id = $' + params.length);
  }
  if (partOfSpeech) {
    params.push(partOfSpeech.toLowerCase());
    conds.push('LOWER(f.part_of_speech) = $' + params.length);
  }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  params.push(limit);
  params.push(offset);
  const sql = `${BASE_SELECT} ${where} ORDER BY f.id ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await db.query(sql, params);
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(`${BASE_SELECT} WHERE f.id=$1 LIMIT 1`, [id]);
  if (!rows[0]) throw new NotFoundError('Flashcard not found');
  return rows[0];
}

async function create({ indonesian, english, partOfSpeech, exampleSentence, difficulty = 1, categoryId = null }) {
  const { rows } = await db.query(
    `INSERT INTO flashcards (indonesian, english, part_of_speech, example_sentence, difficulty, category_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [indonesian, english, partOfSpeech, exampleSentence || null, difficulty, categoryId]
  );
  return getById(rows[0].id);
}

async function update(id, { indonesian, english, partOfSpeech, exampleSentence, difficulty, categoryId }) {
  const { rowCount } = await db.query(
    `UPDATE flashcards SET
      indonesian = COALESCE($1, indonesian),
      english = COALESCE($2, english),
      part_of_speech = COALESCE($3, part_of_speech),
      example_sentence = COALESCE($4, example_sentence),
      difficulty = COALESCE($5, difficulty),
      category_id = COALESCE($6, category_id),
      updated_at = NOW()
     WHERE id=$7`,
    [indonesian || null, english || null, partOfSpeech || null, exampleSentence || null, difficulty || null, categoryId || null, id]
  );
  if (rowCount === 0) throw new NotFoundError('Flashcard not found');
  return getById(id);
}

async function remove(id) {
  const { rowCount } = await db.query('DELETE FROM flashcards WHERE id=$1', [id]);
  if (rowCount === 0) throw new NotFoundError('Flashcard not found');
  return { success: true };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
