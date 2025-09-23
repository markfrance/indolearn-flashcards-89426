'use strict';
const asyncHandler = require('../utils/asyncHandler');
const stats = require('../models/stats');

module.exports = {
  // PUBLIC_INTERFACE
  overview: asyncHandler(async (req, res) => {
    /** Get user stats overview including totals and per-category breakdown. */
    const data = await stats.overview(req.user.sub);
    res.status(200).json(data);
  }),
};
