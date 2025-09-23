'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categories');
const { authenticate, authorize } = require('../middleware/auth');
const schemas = require('../validation/schemas');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Manage categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List categories
 *     tags: [Categories]
 */
router.get('/', authenticate, ctrl.list);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category
 *     tags: [Categories]
 */
router.get('/:id', authenticate, schemas.idParam, validate, ctrl.getOne);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 */
router.post('/', authenticate, authorize('admin'), schemas.categoryCreate, validate, ctrl.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  // Combine single param validator with array of body validators
  [schemas.idParam, ...schemas.categoryUpdate],
  validate,
  ctrl.update
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 */
router.delete('/:id', authenticate, authorize('admin'), schemas.idParam, validate, ctrl.remove);

module.exports = router;
