'use strict';
const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errors');

function map(row) {
  if (!row) return null;
  return {
    id: row.id,
    indonesian: row.indonesian,
    english: row.english,
    partOfSpeech: row.part_of_speech || null,
    exampleSentence: row.example_sentence || null,
    difficulty: row.difficulty,
    categoryId: row.category_id || null,
    categoryName: row.categories?.name || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function list({ q, categoryId, partOfSpeech, limit = 50, offset = 0 }) {
  let query = supabase
    .from('flashcards')
    .select('id, indonesian, english, part_of_speech, example_sentence, difficulty, category_id, created_at, updated_at, categories(name)', { count: 'exact' });

  if (q) {
    // Search in either language
    query = query.or(`indonesian.ilike.%${q}%,english.ilike.%${q}%`);
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (partOfSpeech) {
    query = query.ilike('part_of_speech', partOfSpeech);
  }

  // Range pagination
  const from = offset;
  const to = offset + (limit || 50) - 1;
  const { data, error } = await query.order('id', { ascending: true }).range(from, to);
  if (error) throw new Error(error.message);
  return (data || []).map(map);
}

async function getById(id) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('id, indonesian, english, part_of_speech, example_sentence, difficulty, category_id, created_at, updated_at, categories(name)')
    .eq('id', id)
    .single();
  if (error || !data) throw new NotFoundError('Flashcard not found');
  return map(data);
}

async function create({ indonesian, english, partOfSpeech, exampleSentence, difficulty = 1, categoryId = null }) {
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      indonesian,
      english,
      part_of_speech: partOfSpeech || null,
      example_sentence: exampleSentence || null,
      difficulty,
      category_id: categoryId,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return getById(data.id);
}

async function update(id, { indonesian, english, partOfSpeech, exampleSentence, difficulty, categoryId }) {
  const patch = {
    indonesian,
    english,
    part_of_speech: partOfSpeech,
    example_sentence: exampleSentence,
    difficulty,
    category_id: categoryId,
    updated_at: new Date().toISOString(),
  };
  // Remove undefined keys
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

  const { data, error } = await supabase.from('flashcards').update(patch).eq('id', id).select('id').single();
  if (error || !data) throw new NotFoundError('Flashcard not found');
  return getById(id);
}

async function remove(id) {
  const { error, count } = await supabase.from('flashcards').delete({ count: 'exact' }).eq('id', id);
  if (error) throw new Error(error.message);
  if (!count) throw new NotFoundError('Flashcard not found');
  return { success: true };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
