/* =========================================================================
   VAN JAM VIRTUAL DIFFICULTY MAPPER
   Maps 6 user-facing labels → real JSON keys (some labels combine two lists).
   ========================================================================= */

export const VAN_JAM_DIFFICULTY_MAP = {
  'Casual - Prelim'      : ['Casual Speed Ladder'],
  'Casual - Top 16'      : ['Casual Speed Ladder - Top 16'],
  'Casual (Full)'        : ['Casual Speed Ladder', 'Casual Speed Ladder - Top 16'],
  'Competitive - Prelim' : ['Competitive Speed Ladder'],
  'Competitive - Top 16' : ['Competitive Speed Ladder - Top 16'],
  'Competitive (Full)'   : ['Competitive Speed Ladder', 'Competitive Speed Ladder - Top 16'],
};

export const VAN_JAM_VIRTUAL_DIFFICULTIES = Object.keys(VAN_JAM_DIFFICULTY_MAP);

export const isVanJam = (eventName) => eventName === 'Van Jam';

/**
 * Collect all tricks from `entries` (already year-filtered) for a given difficulty.
 * For Van Jam, translates virtual labels → real JSON keys.
 * Returns a deduplicated, sorted array.
 */
export function resolvePool(entries, difficulty, eventName) {
  const set = new Set();

  const addFromKeys = (entry, keys) =>
    keys.forEach(k => (entry.tricks[k] || []).forEach(t => set.add(t)));

  if (isVanJam(eventName)) {
    const keys = difficulty === 'All'
      ? Object.values(VAN_JAM_DIFFICULTY_MAP).flat()
      : (VAN_JAM_DIFFICULTY_MAP[difficulty] || []);
    entries.forEach(e => addFromKeys(e, keys));
  } else {
    entries.forEach(e => {
      Object.entries(e.tricks).forEach(([diff, list]) => {
        if (difficulty === 'All' || diff === difficulty)
          list.forEach(t => set.add(t));
      });
    });
  }

  return Array.from(set).sort();
}

/**
 * Returns which virtual difficulty labels are available for the given year-filtered entries.
 */
export function resolveVanJamDifficulties(entries) {
  const existingKeys = new Set(entries.flatMap(e => Object.keys(e.tricks)));
  const available = VAN_JAM_VIRTUAL_DIFFICULTIES.filter(vd =>
    VAN_JAM_DIFFICULTY_MAP[vd].some(k => existingKeys.has(k))
  );
  return ['All', ...available];
}
