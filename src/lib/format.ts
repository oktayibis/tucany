/**
 * Money formatting. Turkish grouping conventions, signage-style — the minute
 * and duration formatter lives in `lib/dates.ts` (`formatDriving`) since it
 * already had to know about local time; no need for two copies.
 */

const GROUPED = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

/** "€1.770" — leading symbol, no cents. Prices in this trip are estimates. */
export function euro(amount: number): string {
  const rounded = Math.round(amount);
  return `€${GROUPED.format(Math.abs(rounded))}`;
}

/** "+€230" / "−€230" / "aynı" — a signed amount with a real minus sign. */
export function signedEuro(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'aynı';
  return `${rounded > 0 ? '+' : '−'}${euro(rounded)}`;
}

/**
 * "€230 daha az" / "€120 daha fazla" / "aynı" — a delta phrased the way the
 * family would read it, rather than a bare signed number. `delta` is
 * "candidate minus current": negative means the candidate mode is cheaper.
 */
export function deltaPhrase(delta: number): string {
  const rounded = Math.round(delta);
  if (rounded === 0) return 'aynı';
  return rounded < 0 ? `${euro(rounded)} daha az` : `${euro(rounded)} daha fazla`;
}
