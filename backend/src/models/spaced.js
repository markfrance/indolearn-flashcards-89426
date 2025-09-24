'use strict';
const { supabase } = require('../config/supabase');

/**
 * Get or initialize user_flashcards record for a user-card pair.
 * Returns the full row.
 */
async function getOrCreateUserFlashcard(userId, cardId) {
  const { data, error } = await supabase
    .from('user_flashcards')
    .select('*')
    .eq('user_id', userId)
    .eq('flashcard_id', cardId)
    .limit(1)
    .maybeSingle();

  if (data && !error) return data;

  // initialize defaults
  const init = {
    user_id: userId,
    flashcard_id: cardId,
    ease_factor: 2.5,
    interval: 1,
    repetitions: 0,
    due_at: new Date().toISOString(),
  };
  const { data: ins, error: insErr } = await supabase
    .from('user_flashcards')
    .insert(init)
    .select('*')
    .single();
  if (insErr) throw new Error(insErr.message);
  return ins;
}

/**
 * PUBLIC_INTERFACE
 * Compute next spaced repetition schedule using a simplified SM-2 algorithm.
 * quality: 0-5
 */
function nextSchedule(current, quality) {
  /** Compute next scheduling values. */
  let EF = current.ease_factor ?? 2.5;
  let I = current.interval ?? 1;
  let R = current.repetitions ?? 0;

  if (quality >= 3) {
    if (R === 0) {
      I = 1;
    } else if (R === 1) {
      I = 6;
    } else {
      I = Math.round(I * EF);
    }
    R += 1;
  } else {
    R = 0;
    I = 1;
  }

  EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (EF < 1.3) EF = 1.3;

  const dueAt = new Date(Date.now() + I * 24 * 60 * 60 * 1000);

  return { easeFactor: EF, interval: I, repetitions: R, dueAt };
}

/**
 * PUBLIC_INTERFACE
 * Apply a review result to a user-card state and persist it.
 */
async function applyReview(userId, flashcardId, quality) {
  /** Update and store spaced repetition state for a review. */
  const rec = await getOrCreateUserFlashcard(userId, flashcardId);
  const next = nextSchedule(rec, quality);
  const { data, error } = await supabase
    .from('user_flashcards')
    .update({
      ease_factor: next.easeFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      due_at: next.dueAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', rec.id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * PUBLIC_INTERFACE
 * Get due flashcards for a user, optionally filtered by category.
 */
async function getDueFlashcards(userId, { limit = 20, categoryId = null }) {
  /** Return flashcards due for review, ordered by due date. */
  let query = supabase
    .from('user_flashcards')
    .select('id, due_at, flashcards(*)')
    .eq('user_id', userId)
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(limit);

  if (categoryId) {
    query = query.eq('flashcards.category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map((r) => r.flashcards).filter(Boolean);
}

module.exports = {
  getOrCreateUserFlashcard,
  nextSchedule,
  applyReview,
  getDueFlashcards,
};
