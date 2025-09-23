'use strict';
const { validationResult } = require('express-validator');
const { UnprocessableEntityError } = require('../utils/errors');

/**
 * Validate request using express-validator middlewares.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new UnprocessableEntityError('Validation failed', errors.array()));
  }
  return next();
}

module.exports = validateRequest;
