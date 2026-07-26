import type { Closure, Day, Food, TripData, Weekday } from '../data/schema';
import { weekdayOf } from './dates';
import { namesMatch } from './text';

/**
 * Closed-day detection.
 *
 * Nothing here is hardcoded per day. The weekday comes from the date, the
 * closure list is cross-referenced by name, and each food entry's own
 * `closedOn` is checked too. The one place the data asserts a closure directly
 * — `closedToday` on a day-1 food entry — is verified rather than trusted.
 */

export type ClosedThing = {
  /** Name as written on the item the family will look for. */
  readonly name: string;
  /** Where in the day it appears. */
  readonly kind: 'food' | 'stop' | 'shopping';
  /** How we know: the shared closure table, or the item's own field. */
  readonly evidence: 'closures-table' | 'item-closedOn' | 'item-closedToday';
  readonly note?: string;
};

export type DayClosures = {
  readonly dayId: string;
  readonly weekday: Weekday;
  /** Closed places that are actually in today's plan. Warrants a banner. */
  readonly blocking: readonly ClosedThing[];
  /**
   * Closed today but not part of today's plan. Useful context ("bugün pazar,
   * bunlar da kapalı") but must not shout.
   */
  readonly alsoClosedToday: readonly Closure[];
};

/** Does the data's own weekday field agree with the date? */
export function weekdayMatchesDate(day: Day): boolean {
  return weekdayOf(day.date) === day.weekday;
}

/**
 * The weekday to reason with. Derived from the date, because the date is the
 * fact and the label is a transcription that could drift.
 */
export function effectiveWeekday(day: Day): Weekday {
  return weekdayOf(day.date);
}

/** Closure-table entries that apply to a given weekday. */
export function closuresOn(closures: readonly Closure[], weekday: Weekday): readonly Closure[] {
  return closures.filter((closure) => closure.closed.includes(weekday));
}

/** A day's own food plus whatever its options add — options carry no closures logic of their own. */
function allFood(day: Day): readonly Food[] {
  return [...day.food, ...(day.options?.flatMap((option) => option.food ?? []) ?? [])];
}

/** Every named thing on a day that the family might turn up to, including what its options add. */
function namedItems(day: Day): readonly { name: string; kind: ClosedThing['kind'] }[] {
  const optionStops = day.options?.flatMap((option) => option.stops ?? []) ?? [];
  const optionShopping = day.options?.flatMap((option) => option.shopping ?? []) ?? [];
  return [
    ...day.stops.map((stop) => ({ name: stop.name, kind: 'stop' as const })),
    ...optionStops.map((stop) => ({ name: stop.name, kind: 'stop' as const })),
    ...allFood(day).map((entry) => ({ name: entry.name, kind: 'food' as const })),
    ...day.shopping.map((entry) => ({ name: entry.name, kind: 'shopping' as const })),
    ...optionShopping.map((entry) => ({ name: entry.name, kind: 'shopping' as const })),
  ];
}

export function dayClosures(day: Day, closures: readonly Closure[]): DayClosures {
  const weekday = effectiveWeekday(day);
  const closedToday = closuresOn(closures, weekday);
  const items = namedItems(day);

  const blocking: ClosedThing[] = [];
  const matchedClosures = new Set<Closure>();

  for (const closure of closedToday) {
    for (const item of items) {
      if (!namesMatch(item.name, closure.place)) continue;
      matchedClosures.add(closure);
      blocking.push({
        name: item.name,
        kind: item.kind,
        evidence: 'closures-table',
        ...(closure.note === undefined ? {} : { note: closure.note }),
      });
    }
  }

  for (const entry of allFood(day)) {
    const alreadyFlagged = blocking.some((thing) => thing.name === entry.name);
    if (entry.closedOn?.includes(weekday) === true && !alreadyFlagged) {
      blocking.push({ name: entry.name, kind: 'food', evidence: 'item-closedOn' });
    } else if (entry.closedToday === true && !alreadyFlagged) {
      blocking.push({ name: entry.name, kind: 'food', evidence: 'item-closedToday' });
    }
  }

  return {
    dayId: day.id,
    weekday,
    blocking,
    alsoClosedToday: closedToday.filter((closure) => !matchedClosures.has(closure)),
  };
}

export function allDayClosures(data: TripData): readonly DayClosures[] {
  return data.days.map((day) => dayClosures(day, data.closures));
}

/**
 * Closure entries that never match anything in the itinerary.
 *
 * Either the place is mentioned only in prose (Il Caratello appears in a day-1
 * warning, not in a stop) or it is a venue nobody planned to visit. Worth
 * reporting so the closure list stays honest, not worth warning the family
 * about mid-street.
 */
export function unmatchedClosures(data: TripData): readonly Closure[] {
  const everyName = data.days.flatMap((day) => namedItems(day).map((item) => item.name));
  return data.closures.filter(
    (closure) =>
      closure.closed.length > 0 && !everyName.some((name) => namesMatch(name, closure.place)),
  );
}
