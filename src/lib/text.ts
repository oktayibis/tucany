/**
 * Text normalisation shared by closure matching and search.
 *
 * Two jobs. First, the search box: the data is written in properly accented
 * Turkish, but nobody reaches for the ı/ğ/ş keys mid-restaurant, so a query
 * typed "pazari" has to find "pazarı". Folding both sides makes that work in
 * either direction. Second, the same venue is named differently in different
 * sections ("Trattoria Sostanza" in a day, "Trattoria Sostanza (Firenze)" in
 * closures), and `weekday` values stay ASCII enums ("Carsamba") while their
 * display forms are accented.
 *
 * Everything that compares two human-written names goes through here.
 */

/** Turkish letters that do not decompose under NFD and need explicit mapping. */
const TURKISH_FOLD: Readonly<Record<string, string>> = {
  ı: 'i',
  İ: 'i',
  ğ: 'g',
  Ğ: 'g',
  ş: 's',
  Ş: 's',
};

/** Lowercase, strip diacritics, fold Turkish letters. Keeps punctuation. */
export function fold(input: string): string {
  return [...input]
    .map((char) => TURKISH_FOLD[char] ?? char)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/**
 * Aggressive normalisation for name equality: folds, drops parenthetical
 * qualifiers ("(Firenze)", "(Via Mazzini 10)"), removes punctuation and
 * collapses whitespace.
 */
export function normalizeName(input: string): string {
  return fold(input)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when `haystack` begins with `needle` at a word boundary. */
export function startsWithWord(haystack: string, needle: string): boolean {
  if (needle.length === 0 || !haystack.startsWith(needle)) return false;
  const next = haystack.charAt(needle.length);
  return next === '' || next === ' ';
}

/**
 * Do two human-written names refer to the same place? Deliberately
 * conservative: exact match after normalisation, or one being a
 * word-boundary prefix of the other. Never a bare substring test, which
 * would match "Duomo" against every Duomo in Tuscany.
 */
export function namesMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (left.length === 0 || right.length === 0) return false;
  return left === right || startsWithWord(left, right) || startsWithWord(right, left);
}

/** Substring search for the search screen — folded, so "cinghiale" finds it. */
export function matchesQuery(haystack: string, query: string): boolean {
  const needle = fold(query).trim();
  return needle.length === 0 || fold(haystack).includes(needle);
}
