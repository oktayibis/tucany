import type { FoodTier, StopTier } from '../data/schema';

/**
 * The three budget modes.
 *
 * `a` and `b` are the tiers the data itself carries on every food entry.
 * `mixed` ("Karma") is the plan's recommended middle, and the plan defines it
 * as an explicit keep/drop list rather than a tier:
 *
 *   KEEP  Arezzo fuarı (free) · bir bistecca gecesi (La Sosta, €110) ·
 *         Accademia (€55) · Siena Duomo (€48) · Dondoli + Piazzale (~€15)
 *   DROP  Osteria di Passignano · Officina della Bistecca · Uffizi ·
 *         bütün kule tırmanışları · Montepulciano · ücretli şarap tadımı
 *
 * That list maps exactly onto the tier fields already in the data, which is
 * what `MODE_RULES` below encodes — no per-day figures were invented:
 *
 *   kept items    = every `core` stop, plus `optional` stops that carry a
 *                   `costAlt` (the free way to do them), plus tier-`b` food
 *   dropped items = tier-`a` food, `optional` stops without a `costAlt`,
 *                   and everything tiered `skip` or `removed`
 *
 * Verify: Accademia and Siena Duomo are `core` (kept ✓), Uffizi and the Casa
 * Sola tasting are `optional` (Uffizi has no `costAlt` → dropped ✓, Casa Sola
 * has `costAlt: 0` → visited free ✓), every tower is `skip` (dropped ✓),
 * Montepulciano is `removed` (dropped ✓), and La Sosta is tier `b` (kept ✓).
 */
export type Mode = 'a' | 'mixed' | 'b';

export const MODES = ['a', 'mixed', 'b'] as const satisfies readonly Mode[];

export type ModeInfo = {
  readonly id: Mode;
  readonly label: string;
  /** One line the family can read on the switch itself. */
  readonly gist: string;
};

export const MODE_INFO: Readonly<Record<Mode, ModeInfo>> = {
  a: { id: 'a', label: 'Keyif', gist: 'Her gün restoran, bütün biletler' },
  mixed: { id: 'mixed', label: 'Karma', gist: 'Ucuz taban + sayılı keyif — planın önerisi' },
  b: { id: 'b', label: 'Ucuz', gist: 'Piknik ve ücretsiz duraklar' },
};

export type ModeRules = {
  /** Stop tiers that appear in this mode's total at their full `cost`. */
  readonly fullPriceStopTiers: readonly StopTier[];
  /**
   * When an `optional` stop carries a cheaper `costAlt`, the cheap modes take
   * that instead of dropping the stop — the family still goes, they just do
   * not pay for the tasting. An `optional` stop with no `costAlt` is dropped.
   */
  readonly useCostAltForOptional: boolean;
  /** Food tiers eligible in this mode. `both` is always eaten. */
  readonly foodTiers: readonly FoodTier[];
  /**
   * When a slot offers several eligible options, which one the plan takes.
   * Keyif eats the best, Karma keeps the one good meal, Ucuz takes the least.
   */
  readonly slotPick: 'max' | 'min';
  /**
   * Whether a slot with only a tier-`a` option still gets eaten. In Keyif yes
   * (there is no cheaper option, you still have dinner); in the cheap modes no
   * — that is the day the plan says to eat at the hotel or picnic.
   */
  readonly fallBackToOtherTier: boolean;
};

export const MODE_RULES: Readonly<Record<Mode, ModeRules>> = {
  a: {
    fullPriceStopTiers: ['core', 'optional'],
    useCostAltForOptional: false,
    foodTiers: ['a', 'both'],
    slotPick: 'max',
    fallBackToOtherTier: true,
  },
  mixed: {
    fullPriceStopTiers: ['core'],
    useCostAltForOptional: true,
    foodTiers: ['b', 'both'],
    slotPick: 'max',
    fallBackToOtherTier: false,
  },
  b: {
    fullPriceStopTiers: ['core'],
    useCostAltForOptional: true,
    foodTiers: ['b', 'both'],
    slotPick: 'min',
    fallBackToOtherTier: false,
  },
};

/** Modes other than `mode`, in switch order — for the "…moddan €X az" line. */
export function otherModes(mode: Mode): readonly Mode[] {
  return MODES.filter((candidate) => candidate !== mode);
}
