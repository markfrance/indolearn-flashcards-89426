const healthService = require('../services/health');

/**
 * Controller for health/status.
 */
class HealthController {
  // PUBLIC_INTERFACE
  check(req, res) {
    /** Returns basic service health info. */
    const healthStatus = healthService.getStatus();
    return res.status(200).json(healthStatus);
  }
}

module.exports = new HealthController();
