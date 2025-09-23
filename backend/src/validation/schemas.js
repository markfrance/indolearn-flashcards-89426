'use strict';
const { body, param, query } = require('express-validator');

const email = body('email').isEmail().withMessage('Valid email required');
const password = body('password').isLength({ min: 6 }).withMessage('Password min length 6');
const displayName = body('displayName').optional().isLength({ min: 1 }).withMessage('displayName cannot be empty');

const idParam = param('id').isInt().toInt();

const flashcardCreate = [
  body('indonesian').isString().notEmpty(),
  body('english').isString().notEmpty(),
  body('partOfSpeech').optional().isString(),
  body('exampleSentence').optional().isString(),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('categoryId').optional().isInt().toInt(),
];

const flashcardUpdate = [
  body('indonesian').optional().isString().notEmpty(),
  body('english').optional().isString().notEmpty(),
  body('partOfSpeech').optional().isString(),
  body('exampleSentence').optional().isString(),
  body('difficulty').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('categoryId').optional().isInt().toInt(),
];

const flashcardQuery = [
  query('q').optional().isString(),
  query('categoryId').optional().isInt().toInt(),
  query('partOfSpeech').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
];

const categoryCreate = [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
];

const categoryUpdate = [
  body('name').optional().isString().notEmpty(),
  body('description').optional().isString(),
];

const quizCreate = [
  body('size').optional().isInt({ min: 1, max: 50 }).toInt(),
  body('categoryId').optional().isInt().toInt(),
  body('direction').optional().isIn(['en_to_id', 'id_to_en']),
];

const quizSubmit = [
  body('responses').isArray({ min: 1 }),
  body('responses.*.flashcardId').isInt().toInt(),
  body('responses.*.selected').isString().notEmpty(),
  body('responses.*.answer').optional().isString(),
];

module.exports = {
  // export individual field validators when needed
  displayName,
  authRegister: [email, password, displayName],
  authLogin: [email, password],
  idParam,
  flashcardCreate,
  flashcardUpdate,
  flashcardQuery,
  categoryCreate,
  categoryUpdate,
  quizCreate,
  quizSubmit,
};
