import { describe, expect, it } from 'vitest';
import type { Closure, Day } from '../data/schema';
import { trip } from '../data/trip';
import {
  allDayClosures,
  closuresOn,
  dayClosures,
  effectiveWeekday,
  unmatchedClosures,
  weekdayMatchesDate,
} from './closures';
import { namesMatch, normalizeName } from './text';

const dayById = (id: string): Day => {
  const day = trip.days.find((candidate) => candidate.id === id);
  if (day === undefined) throw new Error(`Gün yok: ${id}`);
  return day;
};

describe('name matching across sections', () => {
  it('ignores the parenthetical qualifiers the data adds inconsistently', () => {
    expect(namesMatch('Trattoria Sostanza', 'Trattoria Sostanza (Firenze)')).toBe(true);
    expect(namesMatch('Da Nerbone (Mercato Centrale)', 'Da Nerbone (Firenze)')).toBe(true);
    expect(namesMatch("Antica Osteria l'Agania (Via Mazzini 10)", "Antica Osteria l'Agania (Arezzo)")).toBe(true);
    expect(namesMatch('Il Torchio (Via de\' Bardi 17)', 'Il Torchio (Firenze)')).toBe(true);
  });

  it('handles Turkish letters written both ways', () => {
    expect(normalizeName('Tavarnelle haftalık pazarı')).toBe('tavarnelle haftalik pazari');
    expect(namesMatch('Tavarnelle pazarı', 'Tavarnelle pazari')).toBe(true);
  });

  it('does not match two different places that share a first word', () => {
    expect(namesMatch('Duomo + Battistero', 'Duomo + Santa Maria della Pieve')).toBe(false);
    expect(namesMatch('Gelateria dei Neri', 'Gelateria Dondoli')).toBe(false);
    expect(namesMatch('Torre Guinigi', 'Torre Grossa')).toBe(false);
  });

  it('is not fooled into substring matches', () => {
    expect(namesMatch('Pisa', 'Piazza dei Miracoli')).toBe(false);
    expect(namesMatch('Osteria', 'Osteria di Passignano')).toBe(true); // word-boundary prefix
    expect(namesMatch('steria di Passignano', 'Osteria di Passignano')).toBe(false);
  });
});

describe('weekday consistency', () => {
  it('every day label agrees with its date', () => {
    for (const day of trip.days) {
      expect(weekdayMatchesDate(day), `${day.id}: ${day.date} / ${day.weekday}`).toBe(true);
    }
  });

  it('derives the weekday from the date, not the label', () => {
    expect(effectiveWeekday(dayById('d4'))).toBe('Cumartesi');
    expect(effectiveWeekday(dayById('d5'))).toBe('Pazar');
  });
});

describe('closuresOn', () => {
  it('finds everything shut on a Sunday', () => {
    const sunday = closuresOn(trip.closures, 'Pazar').map((closure) => closure.place);
    expect(sunday).toContain('Osteria di Passignano');
    expect(sunday).toContain('Trattoria Sostanza (Firenze)');
    expect(sunday).toContain('Da Nerbone (Firenze)');
  });

  it('ignores entries with an empty closed list', () => {
    const coop = trip.closures.find((closure) => closure.place === 'Coop Tavarnelle');
    expect(coop?.closed).toEqual([]);
    for (const weekday of ['Pazar', 'Pazartesi', 'Cuma'] as const) {
      expect(closuresOn(trip.closures, weekday)).not.toContain(coop);
    }
  });
});

describe('day 1 — the closure the plan warns about', () => {
  const result = dayClosures(dayById('d1'), trip.closures);

  it('is a Wednesday', () => {
    expect(result.weekday).toBe('Carsamba');
  });

  it('flags In Serra da Cocchino, which is on the day-1 menu', () => {
    expect(result.blocking.map((thing) => thing.name)).toContain('In Serra da Cocchino (pizza)');
  });

  it('derives it from the closure table rather than trusting the flag', () => {
    const flagged = result.blocking.find((thing) => thing.name.includes('In Serra'));
    expect(flagged?.evidence).toBe('closures-table');
  });
});

describe('no false alarms on the other days', () => {
  it('only day 1 has a closed place in its own plan', () => {
    const withBlocking = allDayClosures(trip)
      .filter((day) => day.blocking.length > 0)
      .map((day) => day.dayId);
    expect(withBlocking).toEqual(['d1']);
  });

  it('leaves Saturday alone even though l\'Agania closes Mon/Tue', () => {
    expect(dayClosures(dayById('d4'), trip.closures).blocking).toEqual([]);
  });

  it('leaves Thursday alone even though Il Torchio closes at weekends', () => {
    expect(dayClosures(dayById('d9'), trip.closures).blocking).toEqual([]);
  });
});

describe('context without noise', () => {
  it('lists what else is closed on Sunday without treating it as a warning', () => {
    const sunday = dayClosures(dayById('d5'), trip.closures);
    expect(sunday.blocking).toEqual([]);
    const also = sunday.alsoClosedToday.map((closure) => closure.place);
    expect(also).toContain('Osteria di Passignano');
    expect(also).toContain('Dario Doc (Panzano)');
  });

  it('never puts the same closure in both lists', () => {
    for (const day of allDayClosures(trip)) {
      const blockingNames = day.blocking.map((thing) => thing.name);
      for (const closure of day.alsoClosedToday) {
        expect(blockingNames.some((name) => namesMatch(name, closure.place))).toBe(false);
      }
    }
  });
});

describe('unmatchedClosures', () => {
  const unmatched = unmatchedClosures(trip).map((closure) => closure.place);

  it('reports places that are in the closure list but not in any day', () => {
    expect(unmatched).toContain('Il Caratello (Tavarnelle)');
    expect(unmatched).toContain('Dario Doc (Panzano)');
  });

  it('does not report places that are matched somewhere', () => {
    expect(unmatched).not.toContain('Osteria di Passignano');
    expect(unmatched).not.toContain('In Serra da Cocchino (Barberino)');
  });
});

describe('behaviour on data the trip does not currently contain', () => {
  const fakeDay: Day = {
    ...dayById('d5'),
    id: 'fake',
    food: [{ slot: 'dinner', tier: 'b', name: 'Trattoria Hayali', price: 40, closedOn: ['Pazar'] }],
  };

  it('honours a food entry\'s own closedOn even with no closure-table row', () => {
    const result = dayClosures(fakeDay, []);
    expect(result.blocking).toEqual([
      { name: 'Trattoria Hayali', kind: 'food', evidence: 'item-closedOn' },
    ]);
  });

  it('carries the closure note through to the UI', () => {
    const closures: Closure[] = [
      { place: 'Trattoria Hayali', closed: ['Pazar'], note: '15:00\'te kapanir' },
    ];
    expect(dayClosures(fakeDay, closures).blocking[0]?.note).toBe('15:00\'te kapanir');
  });
});
