'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/users');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas'); // reuse schema field

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get('/me', authenticate, ctrl.getProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update my profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Updated profile
 */
router.put('/me', authenticate, [schemas.displayName], validate, ctrl.updateProfile);

module.exports = router;
