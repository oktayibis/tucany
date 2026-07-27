import type { Intensity } from '../data/schema';

/**
 * How hard a day is, in words.
 *
 * This used to also export a five-bar meter, drawn on every day card. The
 * redesign's mockup replaced the bars with the plain label below — "Orta
 * tempo" needs no decoding and no `aria-label` to explain it — so the meter
 * went with them and this is what's left: one shared vocabulary, used by the
 * day cards and by the day panel's stat strip so the two can never disagree.
 */
export const INTENSITY_SHORT: Readonly<Record<Intensity, string>> = {
  low: 'Düşük',
  'low-medium': 'Düşük-orta',
  medium: 'Orta',
  'medium-high': 'Orta-yüksek',
  high: 'Yüksek',
};
