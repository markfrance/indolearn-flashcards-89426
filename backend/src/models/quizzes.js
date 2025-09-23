'use strict';
const db = require('../config/db');

/**
 * Generate a quiz: pick N flashcards (due ones preferred), create MCQ choices.
 * direction: 'en_to_id' or 'id_to_en'
 */
async function generateQuiz(userId, { size = 10, categoryId = null, direction = 'en_to_id' }) {
  // Prefer due flashcards from spaced repetition
  const params = [userId];
  let categoryClause = '';
  if (categoryId) {
    params.push(categoryId);
    categoryClause = ` AND f.category_id = $${params.length}`;
  }

  // 1) get due flashcards up to size
  const due = await db.query(
    `SELECT f.id, f.indonesian, f.english FROM user_flashcards uf
     JOIN flashcards f ON f.id = uf.flashcard_id
     WHERE uf.user_id=$1 AND uf.due_at <= NOW()${categoryClause}
     ORDER BY uf.due_at ASC
     LIMIT ${size}`,
    params
  );

  let needed = size - due.rows.length;
  let pool = due.rows;

  if (needed > 0) {
    // fill remaining with random flashcards in category (excluding ones in pool)
    const excludeIds = pool.map(r => r.id);
    const exclList = excludeIds.length ? `AND f.id NOT IN (${excludeIds.map((_, i) => `$${params.length + i + 1}`).join(',')})` : '';
    const extraParams = excludeIds;
    const randomFill = await db.query(
      `SELECT f.id, f.indonesian, f.english
       FROM flashcards f
       WHERE 1=1 ${categoryId ? `AND f.category_id=$${params.indexOf(categoryId) + 1}` : ''} ${exclList}
       ORDER BY random()
       LIMIT ${needed}`,
      params.concat(extraParams)
    );
    pool = pool.concat(randomFill.rows);
  }

  // Create a quiz record
  const quizIns = await db.query(
    'INSERT INTO quizzes (user_id, size, category_id, direction) VALUES ($1,$2,$3,$4) RETURNING id, created_at as "createdAt"',
    [userId, size, categoryId, direction]
  );
  const quizId = quizIns.rows[0].id;

  // Build questions with plausible distractors
  const ids = pool.map(p => p.id);
  const { rows: allChoices } = await db.query(
    `SELECT id, indonesian, english FROM flashcards
     WHERE id = ANY($1::int[]) OR (category_id ${categoryId ? '= $2' : 'IS NOT NULL'})`,
    categoryId ? [ids, categoryId] : [ids]
  );

  const questions = pool.map((card) => {
    const correct = card;
    // choose 3 distractors from allChoices (excluding correct)
    const optionsPool = allChoices.filter(c => c.id !== correct.id);
    const shuffled = optionsPool.sort(() => 0.5 - Math.random()).slice(0, 3);
    const choices = [correct, ...shuffled].sort(() => 0.5 - Math.random());
    if (direction === 'en_to_id') {
      return {
        cardId: correct.id,
        prompt: correct.english,
        answer: correct.indonesian,
        choices: choices.map(c => c.indonesian),
      };
    } else {
      return {
        cardId: correct.id,
        prompt: correct.indonesian,
        answer: correct.english,
        choices: choices.map(c => c.english),
      };
    }
  });

  // Persist questions in quiz_attempts as pending rows
  const insertValues = [];
  const paramsArr = [];
  let idx = 1;
  questions.forEach((q) => {
    insertValues.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    paramsArr.push(quizId, q.cardId, q.prompt, q.answer);
  });

  await db.query(
    `INSERT INTO quiz_attempts (quiz_id, flashcard_id, prompt, answer) VALUES ${insertValues.join(',')}`,
    paramsArr
  );

  return { quizId, createdAt: quizIns.rows[0].createdAt, direction, size, questions };
}

async function submitQuiz(userId, quizId, { responses }) {
  // Verify quiz ownership
  const { rows: quizzes } = await db.query('SELECT * FROM quizzes WHERE id=$1 AND user_id=$2', [quizId, userId]);
  if (!quizzes[0]) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }

  let correctCount = 0;

  for (const r of responses) {
    const { flashcardId, selected } = r;
    const { rows } = await db.query(
      'SELECT id, answer FROM quiz_attempts WHERE quiz_id=$1 AND flashcard_id=$2 LIMIT 1',
      [quizId, flashcardId]
    );
    if (!rows[0]) continue;
    const attemptId = rows[0].id;
    const isCorrect = rows[0].answer === selected;
    if (isCorrect) correctCount += 1;

    await db.query(
      'UPDATE quiz_attempts SET selected=$1, correct=$2, submitted_at=NOW() WHERE id=$3',
      [selected, isCorrect, attemptId]
    );

    // Log review to spaced repetition using simplified quality (5 correct, 2 incorrect)
    const quality = isCorrect ? 5 : 2;
    await db.query(
      'INSERT INTO review_logs (user_id, flashcard_id, quiz_id, correct) VALUES ($1,$2,$3,$4)',
      [userId, flashcardId, quizId, isCorrect]
    );
  }

  await db.query('UPDATE quizzes SET completed_at=NOW(), correct_count=$1 WHERE id=$2', [correctCount, quizId]);

  return { quizId, correctCount };
}

async function quizResults(userId, quizId) {
  const { rows: quizRows } = await db.query('SELECT * FROM quizzes WHERE id=$1 AND user_id=$2', [quizId, userId]);
  if (!quizRows[0]) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  const { rows: attempts } = await db.query(
    'SELECT id, flashcard_id as "flashcardId", prompt, answer, selected, correct, submitted_at as "submittedAt" FROM quiz_attempts WHERE quiz_id=$1 ORDER BY id ASC',
    [quizId]
  );

  return {
    quiz: {
      id: quizRows[0].id,
      size: quizRows[0].size,
      direction: quizRows[0].direction,
      categoryId: quizRows[0].category_id,
      createdAt: quizRows[0].created_at,
      completedAt: quizRows[0].completed_at,
      correctCount: quizRows[0].correct_count,
    },
    attempts,
  };
}

module.exports = {
  generateQuiz,
  submitQuiz,
  quizResults,
};
