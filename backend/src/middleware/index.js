/**
 * Middleware index - export shared middleware here for easy import.
 */
const validate = require('./validate');
const auth = require('./auth');

module.exports = {
  validate,
  ...auth,
};
