import { describe, expect, it } from 'vitest';
import type { Day, Food, Party, Stop } from '../data/schema';
import { trip } from '../data/trip';
import {
  availableUpgrades,
  chosenOption,
  dayBudget,
  daySavings,
  effectiveFood,
  foodKey,
  modeDelta,
  selectFood,
  stopCharge,
  stopKey,
  tripBudget,
  type BudgetInput,
} from './budget';
import { MODES, type Mode } from './modes';

const PARTY = trip.trip.party;

const input = (mode: Mode, party: Party = PARTY): BudgetInput => ({
  mode,
  party,
  chosenOptions: {},
  upgrades: [],
});

const dayById = (id: string): Day => {
  const day = trip.days.find((candidate) => candidate.id === id);
  if (day === undefined) throw new Error(`Gün yok: ${id}`);
  return day;
};

const stopById = (dayId: string, stopId: string): Stop => {
  const stop = dayById(dayId).stops.find((candidate) => candidate.id === stopId);
  if (stop === undefined) throw new Error(`Durak yok: ${stopId}`);
  return stop;
};

const names = (food: readonly Food[]): readonly string[] => food.map((entry) => entry.name);

/* ------------------------------------------------------------------ */

describe('stopCharge', () => {
  it('never charges for skipped or removed stops', () => {
    for (const mode of MODES) {
      expect(stopCharge(stopById('d1', 's1b'), mode)).toBeNull(); // Eğik Kule, skip
      expect(stopCharge(stopById('d6', 's6e'), mode)).toBeNull(); // Montepulciano, removed
    }
  });

  it('charges core stops in every mode', () => {
    for (const mode of MODES) {
      expect(stopCharge(stopById('d8', 's8a'), mode)?.amount).toBe(60); // Accademia
      expect(stopCharge(stopById('d3', 's3a'), mode)?.amount).toBe(48); // Siena Duomo
    }
  });

  it('drops an optional stop with no cheaper alternative outside Keyif', () => {
    const uffizi = stopById('d8', 's8d');
    expect(stopCharge(uffizi, 'a')?.amount).toBe(87);
    expect(stopCharge(uffizi, 'mixed')).toBeNull();
    expect(stopCharge(uffizi, 'b')).toBeNull();
  });

  it('keeps an optional stop that has a free alternative, and says why', () => {
    const casaSola = stopById('d5', 's5b');
    expect(stopCharge(casaSola, 'a')?.amount).toBe(90);
    const cheap = stopCharge(casaSola, 'mixed');
    expect(cheap?.amount).toBe(0);
    // The note is the data's own wording.
    expect(cheap?.altNote).toContain('Sadece dükkanına uğra');
  });
});

describe('selectFood', () => {
  it('always eats the entries tiered "both"', () => {
    const day = dayById('d8');
    for (const mode of MODES) {
      const chosen = names(selectFood(day.food, mode, day.id));
      expect(chosen).toContain('Ditta Artigianale (Via dello Sprone)');
      expect(chosen).toContain('Gelateria dei Neri (Via dei Neri 9)');
    }
  });

  it('takes one option per slot, not all of them', () => {
    const day = dayById('d3'); // two tier-b lunches
    for (const mode of MODES) {
      const lunches = selectFood(day.food, mode, day.id).filter((entry) => entry.slot === 'lunch');
      expect(lunches).toHaveLength(1);
    }
  });

  it('Karma keeps the better cheap meal, Ucuz takes the cheaper one', () => {
    const day = dayById('d3');
    const lunchIn = (mode: Mode): Food | undefined =>
      selectFood(day.food, mode, day.id).find((entry) => entry.slot === 'lunch');
    expect(lunchIn('mixed')?.price).toBe(70); // Osteria Il Grattacielo
    expect(lunchIn('b')?.price).toBe(25); // Consorzio Agrario
  });

  it('Karma keeps the bistecca night, which the data tiers as cheap', () => {
    const day = dayById('d5');
    const dinner = selectFood(day.food, 'mixed', day.id).find((entry) => entry.slot === 'dinner');
    expect(dinner?.name).toContain('La Sosta');
    expect(dinner?.price).toBe(110);
  });

  it('Karma drops the two splurges the plan names', () => {
    const d2 = dayById('d2');
    const d5 = dayById('d5');
    expect(names(selectFood(d2.food, 'mixed', d2.id))).not.toContain('Osteria di Passignano');
    expect(names(selectFood(d5.food, 'mixed', d5.id))).not.toContain(
      'Officina della Bistecca (Dario Cecchini)',
    );
  });

  it('Keyif falls back to the cheap option when a slot has no splurge', () => {
    const day = dayById('d2');
    const dinner = selectFood(day.food, 'a', day.id).find((entry) => entry.slot === 'dinner');
    expect(dinner?.name).toContain('In Serra da Cocchino');
  });

  it('cheap modes skip a slot that only has a splurge — that is the picnic evening', () => {
    const day = dayById('d7'); // opt-a's dinner exists only as tier a
    const optA = day.options?.find((option) => option.id === 'opt-a') ?? null;
    const food = effectiveFood(day, optA);
    expect(selectFood(food, 'a', day.id).some((entry) => entry.slot === 'dinner')).toBe(true);
    expect(selectFood(food, 'mixed', day.id).some((entry) => entry.slot === 'dinner')).toBe(false);
    expect(selectFood(food, 'b', day.id).some((entry) => entry.slot === 'dinner')).toBe(false);
  });

  it('Karma buys back a tier-a meal when the family upgrades it, replacing the usual pick', () => {
    const day = dayById('d3');
    const taverna = day.food.find((entry) => entry.name.includes('Taverna di San Giuseppe'));
    if (taverna === undefined) throw new Error('Taverna di San Giuseppe verisi yok');
    const key = foodKey(day.id, taverna);
    const lunch = selectFood(day.food, 'mixed', day.id, [key]).find((entry) => entry.slot === 'lunch');
    expect(lunch?.name).toBe(taverna.name);
  });

  it('an upgrade key has no effect outside Karma', () => {
    const day = dayById('d3');
    const taverna = day.food.find((entry) => entry.name.includes('Taverna di San Giuseppe'));
    if (taverna === undefined) throw new Error('Taverna di San Giuseppe verisi yok');
    const key = foodKey(day.id, taverna);
    const lunch = selectFood(day.food, 'b', day.id, [key]).find((entry) => entry.slot === 'lunch');
    expect(lunch?.name).not.toBe(taverna.name);
  });
});

describe('Karma matches the keep/drop list the plan writes out', () => {
  const kept = tripBudget(trip, input('mixed'));
  const labels = kept.days.flatMap((day) => day.items.map((item) => item.label));

  it.each([
    ['Galleria dell’Accademia', 'Galleria dell'],
    ['Siena Duomo', 'Duomo + Piccolomini'],
    ['La Sosta bistecca gecesi', 'La Sosta'],
  ])('keeps %s', (_name, needle) => {
    expect(labels.some((label) => label.includes(needle))).toBe(true);
  });

  it.each([
    ['Osteria di Passignano', 'Passignano'],
    ['Officina della Bistecca', 'Officina della Bistecca'],
    ['Uffizi', 'Uffizi'],
  ])('drops %s', (_name, needle) => {
    expect(labels.some((label) => label.includes(needle))).toBe(false);
  });

  it('drops every tower climb and Montepulciano in all three modes', () => {
    for (const mode of MODES) {
      const all = tripBudget(trip, input(mode)).days.flatMap((day) =>
        day.items.map((item) => item.label),
      );
      for (const tower of ['Egik Kule', 'Torre Guinigi', 'Brunelleschi', 'Torre del Mangia', 'Torre Grossa', 'Montepulciano']) {
        expect(all.some((label) => label.includes(tower)), `${mode}: ${tower}`).toBe(false);
      }
    }
  });
});

describe('ordering of the three modes', () => {
  const totals = tripBudget(trip, input('a')).totalsByMode;

  it('Keyif costs the most and Ucuz the least', () => {
    expect(totals.a).toBeGreaterThan(totals.mixed);
    expect(totals.mixed).toBeGreaterThan(totals.b);
  });

  it('is stable no matter which mode is currently selected', () => {
    for (const mode of MODES) {
      expect(tripBudget(trip, input(mode)).totalsByMode).toEqual(totals);
    }
  });

  it('reports a signed delta against the other modes', () => {
    expect(modeDelta(totals, 'a', 'b')).toBeLessThan(0);
    expect(modeDelta(totals, 'b', 'a')).toBeGreaterThan(0);
    expect(modeDelta(totals, 'a', 'a')).toBe(0);
  });
});

describe('day totals', () => {
  it('adds up to the trip total', () => {
    for (const mode of MODES) {
      const budget = tripBudget(trip, input(mode));
      const sum = budget.days.reduce((total, day) => total + day.total, 0);
      expect(budget.daysTotal).toBeCloseTo(sum, 6);
      expect(budget.grandTotal).toBeCloseTo(sum + budget.fixedTotal, 6);
    }
  });

  it('carries the plan headline for Keyif and Ucuz, and null for Karma', () => {
    const day = dayById('d3');
    expect(dayBudget(day, input('a')).declared).toBe(day.budget.a);
    expect(dayBudget(day, input('b')).declared).toBe(day.budget.b);
    expect(dayBudget(day, input('mixed')).declared).toBeNull();
  });

  it('is never negative', () => {
    for (const mode of MODES) {
      for (const day of tripBudget(trip, input(mode)).days) {
        expect(day.total).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('adds the fixed costs exactly once', () => {
    const { fuel, tolls, parking } = trip.budget.fixed;
    expect(tripBudget(trip, input('mixed')).fixedTotal).toBe(fuel + tolls + parking);
  });
});

describe('savings from skipped stops', () => {
  it('sums what the plan decided against, per day', () => {
    expect(daySavings(dayById('d1'))).toBe(60); // Eğik Kule (Torre Guinigi now lives under d1's opt-b)
    expect(daySavings(dayById('d8'))).toBe(90); // Brunelleschi Pass
    expect(daySavings(dayById('d3'))).toBe(30); // Torre del Mangia
    expect(daySavings(dayById('d2'))).toBe(0);
  });

  it('is the same in every mode — the decision was already made', () => {
    const totals = MODES.map((mode) => tripBudget(trip, input(mode)).savedTotal);
    expect(new Set(totals).size).toBe(1);
    expect(totals[0]).toBeGreaterThan(0);
  });
});

describe('party size', () => {
  it('reproduces the plan exactly at the default 3 adults + 1 child', () => {
    // Accademia is written as "3 yetiskin", Officina as "50 EUR/kisi" for 3.
    const accademia = dayBudget(dayById('d8'), input('a')).items.find((item) =>
      item.label.includes('Accademia'),
    );
    expect(accademia?.amount).toBe(60);

    const officina = dayBudget(dayById('d5'), input('a')).items.find((item) =>
      item.label.includes('Officina'),
    );
    expect(officina?.amount).toBe(150);
  });

  it('scales the two per-person prices with the adult count', () => {
    const twoAdults: Party = { ...PARTY, adults: 2 };
    const accademia = dayBudget(dayById('d8'), input('a', twoAdults)).items.find((item) =>
      item.label.includes('Accademia'),
    );
    expect(accademia?.amount).toBeCloseTo((60 / 3) * 2, 6);
  });

  it('leaves table prices alone — a shared steak is not per head', () => {
    const fourAdults: Party = { ...PARTY, adults: 4 };
    const laSosta = (party: Party) =>
      dayBudget(dayById('d5'), input('b', party)).items.find((item) =>
        item.label.includes('La Sosta'),
      )?.amount;
    expect(laSosta(PARTY)).toBe(110);
    expect(laSosta(fourAdults)).toBe(110);
  });

  it('does not charge the six-year-old for a per-adult ticket', () => {
    const noChild: Party = { ...PARTY, children: 0 };
    expect(tripBudget(trip, input('a', noChild)).daysTotal).toBeCloseTo(
      tripBudget(trip, input('a')).daysTotal,
      6,
    );
  });

  it('reports how much of the total actually moves with party size', () => {
    const budget = tripBudget(trip, input('a'));
    expect(budget.partySensitiveTotal).toBeGreaterThan(0);
    expect(budget.partySensitiveTotal).toBeLessThan(budget.daysTotal);
  });
});

describe('day 9, which offers three itineraries instead of stops', () => {
  const day = dayById('d9');

  it('defaults to the one the plan recommends', () => {
    expect(chosenOption(day, input('mixed'))?.label).toBe('Montelupo Fiorentino');
  });

  it('honours an explicit choice and reprices the day', () => {
    const oltrarno: BudgetInput = { ...input('mixed'), chosenOptions: { d9: 'opt-a' } };
    expect(chosenOption(day, oltrarno)?.label).toBe('Floransa Oltrarno');
    expect(dayBudget(day, oltrarno).total).toBeGreaterThan(dayBudget(day, input('mixed')).total);
  });

  it('returns null for days that offer no alternatives', () => {
    expect(chosenOption(dayById('d2'), input('mixed'))).toBeNull();
  });
});

describe('Karma upgrades — buying an individual splurge back by hand', () => {
  it('offers every optional paid stop and every tier-a meal, and nothing else', () => {
    const day = dayById('d8');
    const upgrades = availableUpgrades(day);
    const keys = upgrades.map((upgrade) => upgrade.key);
    expect(keys).toContain(stopKey(stopById('d8', 's8d'))); // Uffizi, optional
    expect(keys).not.toContain(stopById('d8', 's8a').id); // Accademia is core, always paid
    expect(keys).not.toContain(stopById('d8', 's8c').id); // Brunelleschi is skip
    const mercatoCentrale = day.food.find((entry) => entry.name.includes('Mercato Centrale'));
    if (mercatoCentrale === undefined) throw new Error('Mercato Centrale verisi yok');
    expect(keys).toContain(foodKey(day.id, mercatoCentrale));
  });

  it('is empty for a day with nothing to buy back', () => {
    expect(availableUpgrades(dayById('d10'))).toEqual([]);
  });

  it('adds the stop\'s full cost to the Karma total when upgraded', () => {
    const day = dayById('d8');
    const withoutUpgrade = dayBudget(day, input('mixed'));
    const withUpgrade = dayBudget(day, {
      ...input('mixed'),
      upgrades: [stopKey(stopById('d8', 's8d'))],
    });
    expect(withUpgrade.total - withoutUpgrade.total).toBe(87); // Uffizi
  });

  it('marks the upgraded line so the UI can show it was a deliberate splurge', () => {
    const day = dayById('d8');
    const key = stopKey(stopById('d8', 's8d'));
    const item = dayBudget(day, { ...input('mixed'), upgrades: [key] }).items.find(
      (candidate) => candidate.id === key,
    );
    expect(item?.upgraded).toBe(true);
  });

  it('replaces a costAlt tasting with the full price when upgraded', () => {
    const day = dayById('d5');
    const key = stopKey(stopById('d5', 's5b')); // Casa Sola
    // Free lines are not shown as a €0 row — the stop simply costs nothing.
    expect(stopCharge(stopById('d5', 's5b'), 'mixed')?.amount).toBe(0);
    const paid = dayBudget(day, { ...input('mixed'), upgrades: [key] }).items.find(
      (item) => item.id === key,
    );
    expect(paid?.amount).toBe(90);
  });

  it('has no effect in Keyif or Ucuz — upgrades only make sense against the Karma floor', () => {
    const day = dayById('d8');
    const key = stopKey(stopById('d8', 's8d'));
    expect(dayBudget(day, { ...input('a'), upgrades: [key] }).total).toBe(
      dayBudget(day, input('a')).total,
    );
    expect(dayBudget(day, { ...input('b'), upgrades: [key] }).total).toBe(
      dayBudget(day, input('b')).total,
    );
  });

  it('never buys back a skip or removed stop, no matter what is passed in', () => {
    for (const mode of MODES) {
      expect(stopCharge(stopById('d1', 's1b'), mode, true)).toBeNull(); // Eğik Kule, skip
      expect(stopCharge(stopById('d6', 's6e'), mode, true)).toBeNull(); // Montepulciano, removed
    }
  });
});

describe('derivation is pure', () => {
  it('gives the same answer twice and does not mutate the data', () => {
    const before = JSON.stringify(trip);
    const first = tripBudget(trip, input('mixed'));
    const second = tripBudget(trip, input('mixed'));
    expect(first).toEqual(second);
    expect(JSON.stringify(trip)).toBe(before);
  });
});
