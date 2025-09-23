'use strict';
const asyncHandler = require('../utils/asyncHandler');
const usersRepo = require('../models/users');

module.exports = {
  // PUBLIC_INTERFACE
  getProfile: asyncHandler(async (req, res) => {
    /** Get the authenticated user's profile. */
    const user = await usersRepo.findById(req.user.sub);
    res.status(200).json({ user });
  }),

  // PUBLIC_INTERFACE
  updateProfile: asyncHandler(async (req, res) => {
    /** Update the authenticated user's profile (displayName). */
    const updated = await usersRepo.updateProfile(req.user.sub, { displayName: req.body.displayName });
    res.status(200).json({ user: updated });
  }),
};
