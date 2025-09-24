'use strict';
const { supabase } = require('../config/supabase');

/**
 * Count rows from a table with optional filters using head:true for efficiency.
 */
async function countTable(table, filters = []) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const f of filters) {
    // f = { op: 'eq'|'lte'|'gte'|'ilike'|..., column: string, value: any }
    if (typeof query[f.op] === 'function') {
      query = query[f.op](f.column, f.value);
    }
  }
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count || 0;
}

/**
 * PUBLIC_INTERFACE
 * Build stats overview with totals and per-category breakdown using Supabase.
 */
async function overview(userId) {
  /** Compose statistics for dashboards from Supabase tables. */
  const nowIso = new Date().toISOString();
  const [totalFlashcards, mastered, due, totalReviews, correctReviews] = await Promise.all([
    countTable('flashcards'),
    countTable('user_flashcards', [
      { op: 'eq', column: 'user_id', value: userId },
      { op: 'gte', column: 'repetitions', value: 3 },
    ]),
    countTable('user_flashcards', [
      { op: 'eq', column: 'user_id', value: userId },
      { op: 'lte', column: 'due_at', value: nowIso },
    ]),
    countTable('review_logs', [{ op: 'eq', column: 'user_id', value: userId }]),
    countTable('review_logs', [
      { op: 'eq', column: 'user_id', value: userId },
      { op: 'eq', column: 'correct', value: true },
    ]),
  ]);

  const accuracy = totalReviews ? Math.round((10000 * correctReviews) / totalReviews) / 100 : 0;

  // Per-category: fetch categories, then compute totals and mastered counts
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });
  if (catErr) throw new Error(catErr.message);

  // Preload all user_flashcards with repetitions >= 3 to compute mastered by category
  const { data: masteredUF, error: ufErr } = await supabase
    .from('user_flashcards')
    .select('id, flashcard_id')
    .eq('user_id', userId)
    .gte('repetitions', 3);
  if (ufErr) throw new Error(ufErr.message);

  const masteredIds = new Set((masteredUF || []).map((u) => u.flashcard_id));

  // Fetch all flashcards category mapping for efficient counting (could be optimized via RPC/view)
  const { data: allCards, error: cardsErr } = await supabase
    .from('flashcards')
    .select('id, category_id');
  if (cardsErr) throw new Error(cardsErr.message);

  const byCategory = (categories || []).map((c) => {
    const total = (allCards || []).filter((f) => f.category_id === c.id).length;
    const masteredCount = (allCards || []).filter((f) => f.category_id === c.id && masteredIds.has(f.id)).length;
    return {
      id: c.id,
      name: c.name,
      total,
      mastered: masteredCount,
    };
  });

  return {
    totals: {
      flashcards: totalFlashcards,
      mastered,
      due,
      accuracy,
    },
    byCategory,
  };
}

module.exports = {
  overview,
};
