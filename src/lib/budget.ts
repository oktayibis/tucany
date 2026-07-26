import type { Day, DayOption, Food, MealSlot, OptionCost, Party, Shopping, Stop, TripData } from '../data/schema';
import { MODES, MODE_RULES, type Mode } from './modes';
import { applyParty, classifyPrice, scalesWithParty, type PriceBasis } from './pricing';

/**
 * Budget derivation.
 *
 * Every figure the app shows is computed from the individual stop and food
 * prices in the data — never from the author's round headline totals. Those
 * headlines are carried alongside as `declared` so the two can be compared
 * (see src/lib/gaps.ts), because they genuinely disagree and hiding that would
 * be the wrong call for a document people budget against.
 */

export type LineSource = 'stop' | 'food' | 'option';

export type LineItem = {
  readonly id: string;
  readonly label: string;
  readonly source: LineSource;
  /** Price as written in the data. */
  readonly base: number;
  /** Price after the party size is applied. Equals `base` for group prices. */
  readonly amount: number;
  readonly basis: PriceBasis;
  /** Set when a cheaper alternative replaced the full price. */
  readonly altApplied?: string;
  /** Set when the family added this back by hand in Karma mode. */
  readonly upgraded?: true;
};

export type DayBudget = {
  readonly dayId: string;
  readonly items: readonly LineItem[];
  readonly total: number;
  /**
   * The author's headline for this day, when one exists. `mixed` has none —
   * the plan only states Karma at trip level — so it is `null` rather than a
   * number we made up.
   */
  readonly declared: number | null;
  /** What the `skip` and `removed` stops would have cost. */
  readonly saved: number;
  /** What this day costs in the other two modes, for the delta line. */
  readonly totalsByMode: Readonly<Record<Mode, number>>;
};

export type TripBudget = {
  readonly mode: Mode;
  readonly party: Party;
  readonly days: readonly DayBudget[];
  /** Sum of the day totals. */
  readonly daysTotal: number;
  /** Fuel, tolls, parking — identical in every mode. */
  readonly fixedTotal: number;
  readonly grandTotal: number;
  /** The plan's headline for this mode (`budget.modes[mode].foodAndTickets`). */
  readonly declaredHeadline: number;
  /** Trip totals in all three modes, for the delta line. */
  readonly totalsByMode: Readonly<Record<Mode, number>>;
  /** Total the family would have spent on skipped stops. */
  readonly savedTotal: number;
  /** How much of `daysTotal` moves when the party size changes. */
  readonly partySensitiveTotal: number;
};

/** User choices that feed derivation. */
export type BudgetInput = {
  readonly mode: Mode;
  readonly party: Party;
  /** Day 9 offers three itineraries; which one is selected. */
  readonly chosenOptions: Readonly<Record<string, string>>;
  /**
   * Splurges the family has added back by hand, as `upgradeKey` strings.
   *
   * Karma drops the tier-`a` meals and the paid optional stops. Rather than
   * inventing a per-day Karma figure to close the gap against the plan's
   * headline, the app lets the family put individual splurges back and watch
   * the total move. Only meaningful in Karma — Keyif already includes them and
   * Ucuz is the floor.
   */
  readonly upgrades: readonly string[];
};

/** Stable id for a food entry, which the data does not give one. */
export function foodKey(dayId: string, food: Food): string {
  return `${dayId}:${food.slot}:${food.name}`;
}

/** Stops already carry a unique id. */
export function stopKey(stop: Stop): string {
  return stop.id;
}

function isUpgraded(input: BudgetInput, key: string): boolean {
  return input.mode === 'mixed' && input.upgrades.includes(key);
}

/* ------------------------------------------------------------------ */
/* Stops                                                               */
/* ------------------------------------------------------------------ */

/**
 * What a stop costs in a given mode, or `null` when the mode does not include
 * it at all.
 *
 * `skip` and `removed` never cost anything, regardless of `upgraded` — those
 * tiers exist for reasons the money control has no business overriding (8 yaş
 * altı yasak, anne çıkamaz, uzun sıra). `optional` stops are paid for in
 * Keyif; in the cheap modes they only survive at their free `costAlt`, unless
 * the family has explicitly bought the full version back.
 */
export function stopCharge(
  stop: Stop,
  mode: Mode,
  upgraded = false,
): { readonly amount: number; readonly altNote?: string; readonly upgraded?: true } | null {
  const rules = MODE_RULES[mode];
  if (stop.tier === 'skip' || stop.tier === 'removed') return null;

  if (rules.fullPriceStopTiers.includes(stop.tier)) {
    return { amount: stop.cost ?? 0 };
  }
  if (stop.tier === 'optional') {
    if (upgraded && stop.cost !== undefined) return { amount: stop.cost, upgraded: true };
    if (rules.useCostAltForOptional && stop.costAlt !== undefined) {
      return stop.costAltNote === undefined
        ? { amount: stop.costAlt }
        : { amount: stop.costAlt, altNote: stop.costAltNote };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Food                                                                */
/* ------------------------------------------------------------------ */

const SLOT_ORDER = ['coffee', 'lunch', 'aperitivo', 'dinner', 'snack'] as const;

function groupBySlot(food: readonly Food[]): ReadonlyMap<MealSlot, readonly Food[]> {
  const bySlot = new Map<MealSlot, Food[]>();
  for (const entry of food) {
    const existing = bySlot.get(entry.slot);
    if (existing === undefined) bySlot.set(entry.slot, [entry]);
    else existing.push(entry);
  }
  return bySlot;
}

function pick(candidates: readonly Food[], how: 'max' | 'min'): Food | null {
  return candidates.reduce<Food | null>((best, candidate) => {
    if (best === null) return candidate;
    const better = how === 'max' ? candidate.price > best.price : candidate.price < best.price;
    return better ? candidate : best;
  }, null);
}

/**
 * Which meals the family actually eats in a given mode.
 *
 * Entries tiered `both` are eaten in every mode and always included. For the
 * rest, each slot contributes at most one option: the eligible tier for this
 * mode, resolved by `slotPick` when the data offers several (Karma keeps the
 * better one — the plan's "one bistecca night"; Ucuz takes the cheaper).
 *
 * A slot whose only option is out of tier is simply not eaten out. That is not
 * an omission: it is the plan's advice for that evening (hotel or picnic), and
 * it is why day 7 can read "bu gün neredeyse bedava geçebilir".
 *
 * In Karma, a tier-`a` entry the family has explicitly upgraded replaces the
 * slot's usual pick — one splurge bought back on purpose, not a rounder
 * number invented to close the gap against the plan's €950 headline.
 */
export function selectFood(
  food: readonly Food[],
  mode: Mode,
  dayId: string,
  upgradedKeys: readonly string[] = [],
): readonly Food[] {
  const rules = MODE_RULES[mode];
  const bySlot = groupBySlot(food);
  const chosen: Food[] = [];

  for (const slot of SLOT_ORDER) {
    const entries = bySlot.get(slot);
    if (entries === undefined) continue;

    chosen.push(...entries.filter((entry) => entry.tier === 'both'));

    const upgraded =
      mode === 'mixed'
        ? entries.find(
            (entry) => entry.tier === 'a' && upgradedKeys.includes(foodKey(dayId, entry)),
          )
        : undefined;
    if (upgraded !== undefined) {
      chosen.push(upgraded);
      continue;
    }

    const eligible = entries.filter(
      (entry) => entry.tier !== 'both' && rules.foodTiers.includes(entry.tier),
    );
    const fallback =
      eligible.length === 0 && rules.fallBackToOtherTier
        ? entries.filter((entry) => entry.tier !== 'both')
        : [];

    const winner = pick(eligible.length > 0 ? eligible : fallback, rules.slotPick);
    if (winner !== null) chosen.push(winner);
  }
  return chosen;
}

/* ------------------------------------------------------------------ */
/* Day + trip totals                                                   */
/* ------------------------------------------------------------------ */

function lineFor(
  id: string,
  label: string,
  source: LineSource,
  base: number,
  note: string | undefined,
  party: Party,
  extra: { readonly altNote?: string; readonly upgraded?: true } = {},
): LineItem {
  const basis = classifyPrice(base, note, party.adults);
  const line: LineItem = {
    id,
    label,
    source,
    base,
    amount: applyParty(base, basis, party),
    basis,
  };
  return {
    ...line,
    ...(extra.altNote === undefined ? {} : { altApplied: extra.altNote }),
    ...(extra.upgraded === undefined ? {} : { upgraded: extra.upgraded }),
  };
}

/**
 * A day's stops/food/shopping, folded together with whichever option is
 * selected. Thin options (day 9's craft towns) carry no `stops`/`food` of
 * their own, so these are no-ops for them and the day's own lists stand;
 * self-contained options (day 7's beach days) add theirs on top, which is
 * how "picking a card swaps the whole day" is implemented everywhere the day
 * is rendered or priced.
 */
export function effectiveStops(day: Day, option: DayOption | null): readonly Stop[] {
  return option?.stops === undefined ? day.stops : [...day.stops, ...option.stops];
}

export function effectiveFood(day: Day, option: DayOption | null): readonly Food[] {
  return option?.food === undefined ? day.food : [...day.food, ...option.food];
}

export function effectiveShopping(day: Day, option: DayOption | null): readonly Shopping[] {
  return option?.shopping === undefined ? day.shopping : [...day.shopping, ...option.shopping];
}

/** A day's driving load, swapped for the selected option's own figure when it has one. */
export function effectiveDrivingMinutes(day: Day, option: DayOption | null): number {
  return option?.drivingMinutes ?? day.drivingMinutes;
}

/** An option's cost in a given mode — the {a, b} split resolved, or the single figure as-is. */
export function resolveOptionCost(cost: OptionCost, mode: Mode): number {
  return typeof cost === 'number' ? cost : mode === 'a' ? cost.a : cost.b;
}

/**
 * Whether an option prices itself out via its own stops/food (day 7's beach
 * days) rather than a single headline figure resolved against the day's
 * existing lists (day 9's craft towns, which have no `stops`/`food` of their
 * own). Only the latter get a flat "option" line — a self-contained option's
 * items are already counted individually, and adding both would double-count.
 */
function optionPricesItself(option: DayOption): boolean {
  return option.stops !== undefined || option.food !== undefined;
}

/** Every priced line on a day, in the given mode. */
export function dayLineItems(day: Day, input: BudgetInput): readonly LineItem[] {
  const { mode, party } = input;
  const items: LineItem[] = [];
  const option = chosenOption(day, input);

  for (const stop of effectiveStops(day, option)) {
    const charge = stopCharge(stop, mode, isUpgraded(input, stopKey(stop)));
    if (charge === null || charge.amount === 0) continue;
    items.push(
      lineFor(stop.id, stop.name, 'stop', charge.amount, stop.costNote, party, {
        ...(charge.altNote === undefined ? {} : { altNote: charge.altNote }),
        ...(charge.upgraded === undefined ? {} : { upgraded: charge.upgraded }),
      }),
    );
  }

  if (option !== null && !optionPricesItself(option)) {
    const cost = resolveOptionCost(option.cost, mode);
    if (cost > 0) items.push(lineFor(option.id, option.label, 'option', cost, undefined, party));
  }

  for (const entry of selectFood(effectiveFood(day, option), mode, day.id, input.upgrades)) {
    if (entry.price === 0) continue;
    const key = foodKey(day.id, entry);
    const upgraded = mode === 'mixed' && entry.tier === 'a' && input.upgrades.includes(key);
    items.push(
      lineFor(key, entry.name, 'food', entry.price, entry.priceNote, party, {
        ...(upgraded ? { upgraded: true as const } : {}),
      }),
    );
  }
  return items;
}

/**
 * Optional stops and tier-`a` meals a day offers to buy back in Karma mode —
 * the toggles the mode switch's "splurge" UI renders. Empty in Keyif (already
 * included) and Ucuz (the floor).
 */
export type Upgrade = {
  readonly key: string;
  readonly label: string;
  readonly cost: number;
  readonly kind: 'stop' | 'food';
};

export function availableUpgrades(day: Day): readonly Upgrade[] {
  const stops: Upgrade[] = day.stops
    .filter((stop) => stop.tier === 'optional' && stop.cost !== undefined && stop.cost > 0)
    .map((stop) => ({ key: stopKey(stop), label: stop.name, cost: stop.cost ?? 0, kind: 'stop' }));

  const meals: Upgrade[] = day.food
    .filter((entry) => entry.tier === 'a')
    .map((entry) => ({ key: foodKey(day.id, entry), label: entry.name, cost: entry.price, kind: 'food' }));

  return [...stops, ...meals];
}

/**
 * The day's chosen itinerary, for days that offer alternatives.
 *
 * Defaults to whichever the data marks `recommended`, so the app opens on the
 * plan's own advice rather than the first entry.
 */
export function chosenOption(day: Day, input: BudgetInput): DayOption | null {
  return resolveOption(day, input.chosenOptions);
}

/**
 * The same resolution as `chosenOption`, without needing a full
 * `BudgetInput` — option selection never depends on mode, party or upgrades.
 * Used to read one day's choice while rendering a different one (day 9's
 * conditional San Gimignano block reads day 7's choice this way).
 */
export function resolveOption(
  day: Day,
  chosenOptions: Readonly<Record<string, string>>,
): DayOption | null {
  if (day.options === undefined || day.options.length === 0) return null;
  const selectedId = chosenOptions[day.id];
  return (
    day.options.find((option) => option.id === selectedId) ??
    day.options.find((option) => option.recommended === true) ??
    day.options[0] ??
    null
  );
}

/**
 * Whether a stop with a `showWhen` guard should appear, based on what was
 * chosen on the day it depends on. A stop with no guard is always visible.
 */
export function isStopVisible(
  stop: Stop,
  days: readonly Day[],
  chosenOptions: Readonly<Record<string, string>>,
): boolean {
  if (stop.showWhen === undefined) return true;
  const targetDay = days.find((day) => day.id === stop.showWhen?.dayId);
  if (targetDay === undefined) return false;
  const selectedId = resolveOption(targetDay, chosenOptions)?.id;
  return selectedId !== undefined && stop.showWhen.optionIn.includes(selectedId);
}

/** What the plan avoided spending on this day by skipping or dropping stops. */
export function daySavings(day: Day): number {
  return day.stops
    .filter((stop) => stop.tier === 'skip' || stop.tier === 'removed')
    .reduce((sum, stop) => sum + (stop.cost ?? 0), 0);
}

function sum(items: readonly LineItem[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function dayBudget(day: Day, input: BudgetInput): DayBudget {
  const items = dayLineItems(day, input);
  const totalsByMode = Object.fromEntries(
    MODES.map((mode) => [mode, sum(dayLineItems(day, { ...input, mode }))]),
  ) as Record<Mode, number>;

  return {
    dayId: day.id,
    items,
    total: sum(items),
    declared: input.mode === 'mixed' ? null : day.budget[input.mode],
    saved: daySavings(day),
    totalsByMode,
  };
}

export function tripBudget(data: TripData, input: BudgetInput): TripBudget {
  const days = data.days.map((day) => dayBudget(day, input));
  const daysTotal = days.reduce((total, day) => total + day.total, 0);
  const { fuel, tolls, parking } = data.budget.fixed;
  const fixedTotal = fuel + tolls + parking;

  const totalsByMode = Object.fromEntries(
    MODES.map((mode) => [
      mode,
      data.days.reduce((total, day) => total + sum(dayLineItems(day, { ...input, mode })), 0),
    ]),
  ) as Record<Mode, number>;

  const partySensitiveTotal = days
    .flatMap((day) => day.items)
    .filter((item) => scalesWithParty(item.basis))
    .reduce((total, item) => total + item.amount, 0);

  return {
    mode: input.mode,
    party: input.party,
    days,
    daysTotal,
    fixedTotal,
    grandTotal: daysTotal + fixedTotal,
    declaredHeadline: data.budget.modes[input.mode].foodAndTickets,
    totalsByMode,
    savedTotal: data.days.reduce((total, day) => total + daySavings(day), 0),
    partySensitiveTotal,
  };
}

/**
 * Signed difference against another mode, from the current mode's point of
 * view: negative means the other mode is cheaper.
 */
export function modeDelta(totals: Readonly<Record<Mode, number>>, from: Mode, to: Mode): number {
  return totals[to] - totals[from];
}
