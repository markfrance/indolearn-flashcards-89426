'use strict';
const asyncHandler = require('../utils/asyncHandler');
const quizzes = require('../models/quizzes');
const spaced = require('../models/spaced');

module.exports = {
  // PUBLIC_INTERFACE
  createQuiz: asyncHandler(async (req, res) => {
    /** Create a new quiz, preferring due flashcards; supports category filter and direction. */
    const userId = req.user.sub;
    const { size = 10, categoryId = null, direction = 'en_to_id' } = req.body || {};
    const quiz = await quizzes.generateQuiz(userId, {
      size: Math.min(Math.max(parseInt(size, 10) || 10, 1), 50),
      categoryId: categoryId ? parseInt(categoryId, 10) : null,
      direction,
    });
    res.status(201).json(quiz);
  }),

  // PUBLIC_INTERFACE
  submitQuiz: asyncHandler(async (req, res) => {
    /** Submit quiz answers and update spaced repetition. */
    const userId = req.user.sub;
    const quizId = parseInt(req.params.id, 10);
    const { responses = [] } = req.body || {};

    // Apply spaced repetition updates alongside submission
    for (const r of responses) {
      const quality = r.selected === r.answer ? 5 : 2; // trust frontend to send both; server recomputes in model anyway
      await spaced.applyReview(userId, r.flashcardId, quality);
    }
    const result = await quizzes.submitQuiz(userId, quizId, { responses });
    res.status(200).json(result);
  }),

  // PUBLIC_INTERFACE
  getResults: asyncHandler(async (req, res) => {
    /** Get quiz results with attempts. */
    const userId = req.user.sub;
    const quizId = parseInt(req.params.id, 10);
    const result = await quizzes.quizResults(userId, quizId);
    res.status(200).json(result);
  }),
};
