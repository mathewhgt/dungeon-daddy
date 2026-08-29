/**
 * Fuzzy Search Utility for Dungeon Daddy
 * Supports exact substring, multi-word matching, and typo tolerance (transpositions, insertions, deletions).
 */

export function damerauLevenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 999;
  const alen = a.length;
  const blen = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= alen; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= blen; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= alen; i++) {
    for (let j = 1; j <= blen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,        // deletion
        d[i][j - 1] + 1,        // insertion
        d[i - 1][j - 1] + cost  // substitution
      );

      // Transposition check (e.g. 'golbin' <-> 'goblin')
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[alen][blen];
}

/**
 * Checks if target text matches the search query using fuzzy matching.
 * 
 * @param target The entity property or full text to search in (e.g. "Goblin", "Humanoid (goblinoid)")
 * @param query The search term entered by the user (e.g. "golbin", "firebal")
 */
export function fuzzyMatch(target: string | undefined | null, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!target || !target.trim()) return false;

  const q = query.trim().toLowerCase();
  const t = target.trim().toLowerCase();

  // 1. Exact substring match
  if (t.includes(q)) return true;

  // 2. Multi-word search (all words in query must match target)
  const queryWords = q.split(/\s+/).filter(Boolean);
  if (queryWords.length > 1) {
    return queryWords.every((qw) => fuzzyMatch(t, qw));
  }

  // 3. Typo-tolerant word-by-word matching against target tokens
  const targetWords = t.split(/[\s,()/\-_:]+/).filter(Boolean);

  for (const qw of queryWords) {
    const matched = targetWords.some((tw) => {
      // Substring match inside a single word
      if (tw.includes(qw)) return true;

      // For very short queries (<= 3 chars), require exact substring
      if (qw.length <= 3) return false;

      // Allow 1 typo for 4-6 chars (transposition like 'golbin' -> 'goblin'), 2 typos for >= 7 chars
      const maxDistance = qw.length >= 7 ? 2 : 1;
      return damerauLevenshtein(qw, tw) <= maxDistance;
    });

    if (matched) return true;
  }

  return false;
}

/**
 * Searches across multiple fields on an entity
 */
export function fuzzyMatchMultiple(fields: (string | undefined | null)[], query: string): boolean {
  if (!query || !query.trim()) return true;
  return fields.some((f) => fuzzyMatch(f, query));
}
