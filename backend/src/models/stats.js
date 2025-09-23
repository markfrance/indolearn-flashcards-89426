'use strict';
const db = require('../config/db');

async function overview(userId) {
  const [{ rows: totalCardsRows }, { rows: learnedRows }, { rows: reviewRows }, { rows: accuracyRows }] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM flashcards'),
    db.query('SELECT COUNT(*)::int AS count FROM user_flashcards WHERE user_id=$1 AND repetitions >= 3', [userId]),
    db.query('SELECT COUNT(*)::int AS count FROM user_flashcards WHERE user_id=$1 AND due_at <= NOW()', [userId]),
    db.query(
      `SELECT 
        COALESCE(ROUND(100.0*SUM(CASE WHEN rl.correct THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0),2),0) AS accuracy
       FROM review_logs rl
       WHERE rl.user_id=$1`,
      [userId]
    ),
  ]);

  const { rows: byCategory } = await db.query(
    `SELECT c.id, c.name, 
            COUNT(f.id)::int AS total, 
            COALESCE(SUM(CASE WHEN uf.repetitions >= 3 THEN 1 ELSE 0 END),0)::int AS mastered
     FROM categories c
     LEFT JOIN flashcards f ON f.category_id = c.id
     LEFT JOIN user_flashcards uf ON uf.flashcard_id = f.id AND uf.user_id=$1
     GROUP BY c.id, c.name
     ORDER BY c.name ASC`,
    [userId]
  );

  return {
    totals: {
      flashcards: totalCardsRows[0]?.count || 0,
      mastered: learnedRows[0]?.count || 0,
      due: reviewRows[0]?.count || 0,
      accuracy: parseFloat(accuracyRows[0]?.accuracy || 0),
    },
    byCategory,
  };
}

module.exports = {
  overview,
};
