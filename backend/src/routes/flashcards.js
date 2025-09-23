'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/flashcards');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

/**
 * @swagger
 * tags:
 *   name: Flashcards
 *   description: Flashcards CRUD and search
 */

/**
 * @swagger
 * /flashcards:
 *   get:
 *     summary: List/search flashcards
 *     tags: [Flashcards]
 */
router.get('/', authenticate, schemas.flashcardQuery, validate, ctrl.list);

/**
 * @swagger
 * /flashcards/{id}:
 *   get:
 *     summary: Get flashcard by id
 *     tags: [Flashcards]
 */
router.get('/:id', authenticate, schemas.idParam, validate, ctrl.getOne);

/**
 * @swagger
 * /flashcards:
 *   post:
 *     summary: Create flashcard
 *     tags: [Flashcards]
 */
router.post('/', authenticate, authorize('admin'), schemas.flashcardCreate, validate, ctrl.create);

/**
 * @swagger
 * /flashcards/{id}:
 *   put:
 *     summary: Update flashcard
 *     tags: [Flashcards]
 */
router.put('/:id', authenticate, authorize('admin'), schemas.idParam.concat(schemas.flashcardUpdate), validate, ctrl.update);

/**
 * @swagger
 * /flashcards/{id}:
 *   delete:
 *     summary: Delete flashcard
 *     tags: [Flashcards]
 */
router.delete('/:id', authenticate, authorize('admin'), schemas.idParam, validate, ctrl.remove);

module.exports = router;
