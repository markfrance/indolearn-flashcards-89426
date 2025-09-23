'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/register', schemas.authRegister, validate, ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', schemas.authLogin, validate, ctrl.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout (stateless)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', ctrl.logout);

/**
 * @swagger
 * /auth/oauth:
 *   get:
 *     summary: OAuth login (stub)
 *     tags: [Auth]
 *     responses:
 *       501:
 *         description: Not implemented
 */
router.get('/oauth', ctrl.oauthStub);

module.exports = router;
