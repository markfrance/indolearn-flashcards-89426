'use strict';
const db = require('../config/db');

/**
 * Get or initialize user_flashcard record for a user-card pair.
 */
async function getOrCreateUserFlashcard(userId, cardId) {
  const { rows } = await db.query('SELECT * FROM user_flashcards WHERE user_id=$1 AND flashcard_id=$2 LIMIT 1', [userId, cardId]);
  if (rows[0]) return rows[0];
  const init = {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  };
  const ins = await db.query(
    `INSERT INTO user_flashcards (user_id, flashcard_id, ease_factor, interval, repetitions, due_at)
     VALUES ($1,$2,$3,$4,$5, NOW())
     RETURNING *`,
    [userId, cardId, init.easeFactor, init.interval, init.repetitions]
  );
  return ins.rows[0];
}

/**
 * Update the spaced repetition state using a simplified SM-2 algorithm variant.
 * quality: 0-5
 */
function nextSchedule(current, quality) {
  let { ease_factor: EF, interval: I, repetitions: R } = current;
  if (quality >= 3) {
    if (R === 0) {
      I = 1;
    } else if (R === 1) {
      I = 6;
    } else {
      I = Math.round(I * EF);
    }
    R += 1;
  } else {
    R = 0;
    I = 1;
  }

  EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (EF < 1.3) EF = 1.3;

  const dueAt = new Date(Date.now() + I * 24 * 60 * 60 * 1000);

  return { easeFactor: EF, interval: I, repetitions: R, dueAt };
}

async function applyReview(userId, flashcardId, quality) {
  const rec = await getOrCreateUserFlashcard(userId, flashcardId);
  const next = nextSchedule(rec, quality);
  const { rows } = await db.query(
    `UPDATE user_flashcards
     SET ease_factor=$1, interval=$2, repetitions=$3, due_at=$4, updated_at=NOW()
     WHERE id=$5 RETURNING *`,
    [next.easeFactor, next.interval, next.repetitions, next.dueAt, rec.id]
  );
  return rows[0];
}

async function getDueFlashcards(userId, { limit = 20, categoryId = null }) {
  const params = [userId];
  let where = 'uf.user_id=$1 AND uf.due_at <= NOW()';
  if (categoryId) {
    params.push(categoryId);
    where += ` AND f.category_id = $${params.length}`;
  }
  params.push(limit);
  const { rows } = await db.query(
    `SELECT f.*
     FROM user_flashcards uf
     JOIN flashcards f ON f.id = uf.flashcard_id
     WHERE ${where}
     ORDER BY uf.due_at ASC
     LIMIT $${params.length}`,
    params
  );
  return rows;
}

module.exports = {
  getOrCreateUserFlashcard,
  nextSchedule,
  applyReview,
  getDueFlashcards,
};
