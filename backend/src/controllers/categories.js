'use strict';
const asyncHandler = require('../utils/asyncHandler');
const repo = require('../models/categories');

module.exports = {
  // PUBLIC_INTERFACE
  list: asyncHandler(async (req, res) => {
    /** List all categories. */
    const items = await repo.list();
    res.status(200).json({ items });
  }),

  // PUBLIC_INTERFACE
  getOne: asyncHandler(async (req, res) => {
    /** Get a category by id. */
    const id = parseInt(req.params.id, 10);
    const item = await repo.getById(id);
    res.status(200).json(item);
  }),

  // PUBLIC_INTERFACE
  create: asyncHandler(async (req, res) => {
    /** Create a category. */
    const item = await repo.create(req.body);
    res.status(201).json(item);
  }),

  // PUBLIC_INTERFACE
  update: asyncHandler(async (req, res) => {
    /** Update a category. */
    const id = parseInt(req.params.id, 10);
    const item = await repo.update(id, req.body);
    res.status(200).json(item);
  }),

  // PUBLIC_INTERFACE
  remove: asyncHandler(async (req, res) => {
    /** Delete a category. */
    const id = parseInt(req.params.id, 10);
    await repo.remove(id);
    res.status(204).send();
  }),
};
