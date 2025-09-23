'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quizzes');
const { authenticate } = require('../middleware/auth');
const schemas = require('../validation/schemas');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Create, submit and view results for quizzes
 */

/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create a quiz
 *     tags: [Quizzes]
 */
router.post('/', authenticate, schemas.quizCreate, validate, ctrl.createQuiz);

/**
 * @swagger
 * /quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz responses
 *     tags: [Quizzes]
 */
router.post('/:id/submit', authenticate, schemas.idParam.concat(schemas.quizSubmit), validate, ctrl.submitQuiz);

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get quiz results
 *     tags: [Quizzes]
 */
router.get('/:id', authenticate, schemas.idParam, validate, ctrl.getResults);

module.exports = router;
