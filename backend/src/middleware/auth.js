'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Verify JWT token from Authorization: Bearer <token>
 */
function authenticate(req, res, next) {
  const hdr = req.headers.authorization || '';
  const [scheme, token] = hdr.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }
  try {
    const payload = jwt.verify(token, config.app.jwtSecret);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

/**
 * Authorize by role (simple RBAC)
 * @param  {...string} roles 
 * @returns 
 */
function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user) return next(new UnauthorizedError());
    if (roles.length === 0) return next();
    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
