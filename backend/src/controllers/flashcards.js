'use strict';
const asyncHandler = require('../utils/asyncHandler');
const repo = require('../models/flashcards');

module.exports = {
  // PUBLIC_INTERFACE
  list: asyncHandler(async (req, res) => {
    /** List/search flashcards with optional filters. */
    const { q, categoryId, partOfSpeech, limit, offset } = req.query;
    const data = await repo.list({
      q: q || undefined,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      partOfSpeech: partOfSpeech || undefined,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    res.status(200).json({ items: data });
  }),

  // PUBLIC_INTERFACE
  getOne: asyncHandler(async (req, res) => {
    /** Get a single flashcard by ID. */
    const id = parseInt(req.params.id, 10);
    const data = await repo.getById(id);
    res.status(200).json(data);
  }),

  // PUBLIC_INTERFACE
  create: asyncHandler(async (req, res) => {
    /** Create a flashcard. */
    const created = await repo.create(req.body);
    res.status(201).json(created);
  }),

  // PUBLIC_INTERFACE
  update: asyncHandler(async (req, res) => {
    /** Update a flashcard. */
    const id = parseInt(req.params.id, 10);
    const updated = await repo.update(id, req.body);
    res.status(200).json(updated);
  }),

  // PUBLIC_INTERFACE
  remove: asyncHandler(async (req, res) => {
    /** Delete a flashcard. */
    const id = parseInt(req.params.id, 10);
    await repo.remove(id);
    res.status(204).send();
  }),
};
