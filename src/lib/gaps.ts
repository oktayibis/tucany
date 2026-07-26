import type { Day, TripData } from '../data/schema';
import { dayBudget, tripBudget, type BudgetInput } from './budget';
import { effectiveWeekday, unmatchedClosures, weekdayMatchesDate } from './closures';
import { formatDayMonth } from './dates';
import { MODES, MODE_INFO, type Mode } from './modes';

/**
 * Data-gap detection.
 *
 * The brief for this app is that missing information gets surfaced, never
 * invented. This module finds the places where the data is silent, internally
 * inconsistent, or rounder than the app pretends, so the UI can say so plainly
 * instead of printing a confident wrong number.
 *
 * Everything here is derived. Adding a price or a closure to the JSON removes
 * the corresponding gap with no code change.
 */

export type GapSeverity = 'info' | 'warning';

export type Gap = {
  readonly id: string;
  /** Where the family would run into it. */
  readonly where: string;
  readonly what: string;
  readonly severity: GapSeverity;
  readonly dayId?: string;
};

/** A day total this far from the plan's own headline is worth mentioning. */
const DAY_DIVERGENCE_THRESHOLD_EUR = 25;

const euro = (amount: number): string => `€${Math.round(amount)}`;

function dayLabel(day: Day, index: number): string {
  return `${index + 1}. gün · ${formatDayMonth(day.date)}`;
}

function baseInput(data: TripData, mode: Mode): BudgetInput {
  return { mode, party: data.trip.party, chosenOptions: {}, upgrades: [] };
}

/* ------------------------------------------------------------------ */
/* Detectors                                                           */
/* ------------------------------------------------------------------ */

/** Headline mode totals versus the sum of the individual prices. */
function headlineGaps(data: TripData): Gap[] {
  return MODES.flatMap((mode) => {
    const budget = tripBudget(data, baseInput(data, mode));
    const difference = budget.declaredHeadline - budget.daysTotal;
    if (Math.abs(difference) < 50) return [];
    return [
      {
        id: `headline-${mode}`,
        where: 'Bütçe',
        what:
          `${MODE_INFO[mode].label} modunda plan ${euro(budget.declaredHeadline)} diyor, ` +
          `tek tek kalemler ${euro(budget.daysTotal)} ediyor. ` +
          `Aradaki ${euro(Math.abs(difference))} planda kalem olarak yazılmamış ` +
          `(coperto, su, otopark, alışveriş gibi).`,
        severity: 'info' as const,
      },
    ];
  });
}

/** Per-day headline versus the sum of that day's prices. */
function dayDivergenceGaps(data: TripData): Gap[] {
  const gaps: Gap[] = [];
  for (const mode of ['a', 'b'] as const) {
    data.days.forEach((day, index) => {
      const budget = dayBudget(day, baseInput(data, mode));
      if (budget.declared === null) return;
      // A day with nothing priced at all is reported once, by its own detector.
      if (budget.total === 0) return;
      const difference = budget.declared - budget.total;
      if (Math.abs(difference) < DAY_DIVERGENCE_THRESHOLD_EUR) return;
      gaps.push({
        id: `day-divergence-${day.id}-${mode}`,
        where: dayLabel(day, index),
        what:
          `${MODE_INFO[mode].label} modunda plan ${euro(budget.declared)} yazıyor, ` +
          `kalemler ${euro(budget.total)} ediyor.`,
        severity: 'info',
        dayId: day.id,
      });
    });
  }
  return gaps;
}

/** Karma has no per-day figure in the data, only a trip-level one. */
function mixedGranularityGap(): Gap {
  return {
    id: 'mixed-no-day-figures',
    where: 'Bütçe',
    what:
      'Karma mod için planda gün gün rakam yok, sadece toplam var. ' +
      'Gün rakamları kalemlerden hesaplanıyor: ücretsiz duraklar + ucuz yemek + ' +
      'planın açıkça tuttuğu keyif kalemleri.',
    severity: 'info',
  };
}

/** Tickets with a price but no statement of how it splits across people. */
function unscalablePriceGaps(data: TripData): Gap[] {
  const gaps: Gap[] = [];
  data.days.forEach((day, index) => {
    const unscalable = day.stops.filter(
      (stop) =>
        (stop.tier === 'core' || stop.tier === 'optional') &&
        stop.cost !== undefined &&
        stop.cost > 0 &&
        stop.costNote === undefined,
    );
    if (unscalable.length === 0) return;
    gaps.push({
      id: `unscalable-${day.id}`,
      where: dayLabel(day, index),
      what:
        `${unscalable.map((stop) => stop.name).join(', ')} — fiyatın kaç kişiye ait olduğu ` +
        'yazmıyor. Kişi sayısını değiştirince bu tutar değişmiyor.',
      severity: 'info',
      dayId: day.id,
    });
  });
  return gaps;
}

/** A per-person price where the child's share is our inference, not the data's. */
function childShareGaps(data: TripData): Gap[] {
  const gaps: Gap[] = [];
  data.days.forEach((day, index) => {
    for (const entry of day.food) {
      if (entry.priceNote === undefined) continue;
      const budget = dayBudget(day, baseInput(data, 'a'));
      const line = budget.items.find((item) => item.label === entry.name);
      if (line?.basis.kind !== 'perAdult') continue;
      if (line.basis.childExemption !== 'inferred-from-total') continue;
      gaps.push({
        id: `child-share-${day.id}-${entry.name}`,
        where: dayLabel(day, index),
        what:
          `${entry.name} kişi başı fiyatlı ama çocuk için ne olacağı yazmıyor. ` +
          'Yazılı toplam üç yetişkine denk geldiği için çocuk hesaba katılmadı — sorun.',
        severity: 'warning',
        dayId: day.id,
      });
    }
  });
  return gaps;
}

/** Closure entries that match nothing in the itinerary. */
function unmatchedClosureGaps(data: TripData): Gap[] {
  return unmatchedClosures(data).map((closure) => ({
    id: `closure-unmatched-${closure.place}`,
    where: 'Kapalı günler',
    what:
      `"${closure.place}" kapalı günler listesinde ama programda böyle bir durak yok. ` +
      'Kontrol et: ya adı farklı yazılmış ya da plandan çıkmış.',
    severity: 'info' as const,
  }));
}

/** `closedToday` asserted without the closure table or `closedOn` backing it. */
function closedTodayConsistencyGaps(data: TripData): Gap[] {
  const gaps: Gap[] = [];
  data.days.forEach((day, index) => {
    const weekday = effectiveWeekday(day);
    for (const entry of day.food) {
      if (entry.closedToday !== true) continue;
      const inOwnField = entry.closedOn?.includes(weekday) === true;
      const inTable = data.closures.some(
        (closure) => closure.place.startsWith(entry.name.split(' (')[0] ?? entry.name) && closure.closed.includes(weekday),
      );
      if (inOwnField || inTable) continue;
      gaps.push({
        id: `closed-today-${day.id}-${entry.name}`,
        where: dayLabel(day, index),
        what: `${entry.name} bugün kapalı işaretli ama kapalı günler listesi bunu doğrulamıyor.`,
        severity: 'warning',
        dayId: day.id,
      });
    }
  });
  return gaps;
}

/** The weekday written in the data disagreeing with the date. */
function weekdayGaps(data: TripData): Gap[] {
  return data.days
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => !weekdayMatchesDate(day))
    .map(({ day, index }) => ({
      id: `weekday-${day.id}`,
      where: dayLabel(day, index),
      what: `Planda "${day.weekday}" yazıyor ama ${day.date} aslında ${effectiveWeekday(day)}.`,
      severity: 'warning' as const,
      dayId: day.id,
    }));
}

/** A tier-`b` option costing more than the tier-`a` one it is meant to undercut. */
function invertedTierGaps(data: TripData): Gap[] {
  const gaps: Gap[] = [];
  data.days.forEach((day, index) => {
    const slots = new Set(day.food.map((entry) => entry.slot));
    for (const slot of slots) {
      const entries = day.food.filter((entry) => entry.slot === slot);
      const cheapest = (tier: 'a' | 'b'): number | null => {
        const prices = entries.filter((entry) => entry.tier === tier).map((entry) => entry.price);
        return prices.length === 0 ? null : Math.min(...prices);
      };
      const keyif = cheapest('a');
      const ucuz = cheapest('b');
      if (keyif === null || ucuz === null || ucuz <= keyif) continue;
      gaps.push({
        id: `inverted-tier-${day.id}-${slot}`,
        where: dayLabel(day, index),
        what:
          `Ucuz seçenek (${euro(ucuz)}) keyif seçeneğinden (${euro(keyif)}) pahalı. ` +
          'Bu iki seçenek muhtemelen farklı günlük rotalara ait, fiyat kademesine değil.',
        severity: 'warning',
        dayId: day.id,
      });
    }
  });
  return gaps;
}

/**
 * A stop the family has to drive to with no way to navigate to it.
 *
 * Stops with no `city` are at the hotel — the pool, the e-bike hire — and need
 * no directions, so they are not gaps.
 */
function navigationGaps(data: TripData): Gap[] {
  const gaps: Gap[] = [];
  data.days.forEach((day, index) => {
    const unreachable = day.stops.filter(
      (stop) =>
        (stop.tier === 'core' || stop.tier === 'optional') &&
        stop.city !== undefined &&
        stop.nav === undefined &&
        (stop.lat === undefined || stop.lng === undefined),
    );
    if (unreachable.length === 0) return;
    gaps.push({
      id: `nav-${day.id}`,
      where: dayLabel(day, index),
      what: `${unreachable.map((stop) => stop.name).join(', ')} için konum yok — haritada arayacaksın.`,
      severity: 'info',
      dayId: day.id,
    });
  });
  return gaps;
}

/** A day with a budget on paper but nothing priced to spend it on. */
function emptyPricedDayGaps(data: TripData): Gap[] {
  const gaps: Gap[] = [];
  data.days.forEach((day, index) => {
    const budget = dayBudget(day, baseInput(data, 'a'));
    if (budget.total > 0 || budget.declared === null || budget.declared === 0) return;
    gaps.push({
      id: `empty-priced-day-${day.id}`,
      where: dayLabel(day, index),
      what: `Planda ${euro(budget.declared)} yazıyor ama bu güne yazılmış tek bir kalem yok.`,
      severity: 'info',
      dayId: day.id,
    });
  });
  return gaps;
}

/** Shopping entries with no price at all. */
function shoppingPriceGaps(data: TripData): Gap[] {
  const total = data.days.flatMap((day) => day.shopping).length;
  const unpriced = data.days
    .flatMap((day) => day.shopping)
    .filter((entry) => entry.cost === undefined || entry.cost === null).length;
  if (unpriced === 0) return [];
  return [
    {
      id: 'shopping-unpriced',
      where: 'Alışveriş',
      what:
        `${total} alışveriş durağının ${unpriced === total ? 'hiçbirinde' : `${unpriced} tanesinde`} ` +
        'fiyat yok, yani hiçbiri bütçe toplamına girmiyor. Arezzo antikası ve hediyelikler için ' +
        'ayrı bir pay ayır — bu geziye harcanacak paranın gözükmeyen kısmı bu.',
      severity: 'warning',
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

const SEVERITY_ORDER: Readonly<Record<GapSeverity, number>> = { warning: 0, info: 1 };

export function findGaps(data: TripData): readonly Gap[] {
  return [
    ...weekdayGaps(data),
    ...closedTodayConsistencyGaps(data),
    ...invertedTierGaps(data),
    ...childShareGaps(data),
    ...shoppingPriceGaps(data),
    ...headlineGaps(data),
    mixedGranularityGap(),
    ...dayDivergenceGaps(data),
    ...unscalablePriceGaps(data),
    ...unmatchedClosureGaps(data),
    ...navigationGaps(data),
    ...emptyPricedDayGaps(data),
  ].sort((left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]);
}

/** Gaps attached to a specific day, for the day detail screen. */
export function gapsForDay(gaps: readonly Gap[], dayId: string): readonly Gap[] {
  return gaps.filter((gap) => gap.dayId === dayId);
}
