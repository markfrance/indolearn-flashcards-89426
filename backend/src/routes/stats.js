'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stats');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Review and progress statistics
 */

/**
 * @swagger
 * /stats/overview:
 *   get:
 *     summary: Get statistics overview
 *     tags: [Stats]
 */
router.get('/overview', authenticate, ctrl.overview);

module.exports = router;
