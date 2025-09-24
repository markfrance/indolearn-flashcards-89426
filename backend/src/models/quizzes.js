'use strict';
const { supabase } = require('../config/supabase');

/**
 * Helper to random sample without replacement.
 */
function sample(array, n) {
  const copy = array.slice();
  const out = [];
  while (n-- > 0 && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * Generate a quiz: pick N flashcards, create MCQ choices.
 * direction: 'en_to_id' or 'id_to_en'
 */
async function generateQuiz(userId, { size = 10, categoryId = null, direction = 'en_to_id' }) {
  // Fetch candidate flashcards
  let query = supabase.from('flashcards').select('id, indonesian, english').order('id', { ascending: true });
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data: cards, error } = await query;
  if (error) throw new Error(error.message);

  const pool = sample(cards || [], size);

  // Build choices pool
  const questions = pool.map((card) => {
    const distractors = sample((cards || []).filter((c) => c.id !== card.id), 3);
    const options = sample([card, ...distractors], 4);
    if (direction === 'en_to_id') {
      return {
        cardId: card.id,
        prompt: card.english,
        answer: card.indonesian,
        choices: options.map((o) => o.indonesian),
      };
    }
    return {
      cardId: card.id,
      prompt: card.indonesian,
      answer: card.english,
      choices: options.map((o) => o.english),
    };
  });

  // Persist quiz metadata
  const { data: quiz, error: quizErr } = await supabase
    .from('quizzes')
    .insert({ user_id: userId, size: pool.length, category_id: categoryId, direction })
    .select('id, created_at')
    .single();
  if (quizErr) throw new Error(quizErr.message);

  // Persist attempts as pending
  const attemptRows = questions.map((q) => ({
    quiz_id: quiz.id,
    flashcard_id: q.cardId,
    prompt: q.prompt,
    answer: q.answer,
  }));
  if (attemptRows.length) {
    const { error: attErr } = await supabase.from('quiz_attempts').insert(attemptRows);
    if (attErr) throw new Error(attErr.message);
  }

  return { quizId: quiz.id, createdAt: quiz.created_at, direction, size: pool.length, questions };
}

async function submitQuiz(userId, quizId, { responses }) {
  // Ensure quiz ownership
  const { data: quiz, error: qErr } = await supabase.from('quizzes').select('id, user_id').eq('id', quizId).single();
  if (qErr || !quiz || quiz.user_id !== userId) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }

  let correctCount = 0;
  for (const r of responses) {
    const { data: attempt, error: aErr } = await supabase
      .from('quiz_attempts')
      .select('id, answer')
      .eq('quiz_id', quizId)
      .eq('flashcard_id', r.flashcardId)
      .single();
    if (aErr || !attempt) continue;

    const isCorrect = attempt.answer === r.selected;
    if (isCorrect) correctCount += 1;

    await supabase
      .from('quiz_attempts')
      .update({ selected: r.selected, correct: isCorrect, submitted_at: new Date().toISOString() })
      .eq('id', attempt.id);

    // Log review
    await supabase
      .from('review_logs')
      .insert({ user_id: userId, flashcard_id: r.flashcardId, quiz_id: quizId, correct: isCorrect });
  }

  await supabase
    .from('quizzes')
    .update({ completed_at: new Date().toISOString(), correct_count: correctCount })
    .eq('id', quizId);

  return { quizId, correctCount };
}

async function quizResults(userId, quizId) {
  const { data: quiz, error: qErr } = await supabase.from('quizzes')
    .select('id, user_id, size, direction, category_id, created_at, completed_at, correct_count')
    .eq('id', quizId)
    .single();
  if (qErr || !quiz || quiz.user_id !== userId) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }

  const { data: attempts, error: aErr } = await supabase
    .from('quiz_attempts')
    .select('id, flashcard_id, prompt, answer, selected, correct, submitted_at')
    .eq('quiz_id', quizId)
    .order('id', { ascending: true });

  if (aErr) throw new Error(aErr.message);

  return {
    quiz: {
      id: quiz.id,
      size: quiz.size,
      direction: quiz.direction,
      categoryId: quiz.category_id,
      createdAt: quiz.created_at,
      completedAt: quiz.completed_at,
      correctCount: quiz.correct_count,
    },
    attempts: (attempts || []).map((a) => ({
      id: a.id,
      flashcardId: a.flashcard_id,
      prompt: a.prompt,
      answer: a.answer,
      selected: a.selected,
      correct: a.correct,
      submittedAt: a.submitted_at,
    })),
  };
}

module.exports = {
  generateQuiz,
  submitQuiz,
  quizResults,
};
