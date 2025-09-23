'use strict';
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth');

/**
 * Authentication controller: register/login/logout and OAuth stub.
 */
module.exports = {
  // PUBLIC_INTERFACE
  register: asyncHandler(async (req, res) => {
    /** Register a user with email/password and return JWT + profile. */
    const { email, password, displayName } = req.body;
    const result = await authService.register({ email, password, displayName });
    res.status(201).json(result);
  }),

  // PUBLIC_INTERFACE
  login: asyncHandler(async (req, res) => {
    /** Login with email/password and return JWT + profile. */
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  }),

  // PUBLIC_INTERFACE
  logout: asyncHandler(async (req, res) => {
    /** Stateless JWT: client should discard token; respond success. */
    res.status(200).json({ success: true });
  }),

  // PUBLIC_INTERFACE
  oauthStub: asyncHandler(async (req, res) => {
    /** Placeholder for OAuth implementation - returns 501. */
    res.status(501).json({ message: 'OAuth not implemented yet' });
  }),
};
