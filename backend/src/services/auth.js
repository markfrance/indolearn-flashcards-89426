'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const usersRepo = require('../models/users');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

// PUBLIC_INTERFACE
function signToken(user) {
  /** Issues a JWT token for the provided user object (id, email, role). */
  const payload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, config.app.jwtSecret, { expiresIn: config.app.jwtExpiresIn });
}

async function register({ email, password, displayName }) {
  const existing = await usersRepo.findByEmail(email);
  if (existing) throw new BadRequestError('Email already registered');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await usersRepo.create({ email, passwordHash, displayName });
  const token = signToken(user);
  return { user, token };
}

async function login({ email, password }) {
  const existing = await usersRepo.findByEmail(email);
  if (!existing) throw new UnauthorizedError('Invalid credentials');
  const valid = await bcrypt.compare(password, existing.password_hash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');
  const user = await usersRepo.findById(existing.id);
  const token = signToken(user);
  return { user, token };
}

module.exports = {
  register,
  login,
  signToken,
};
