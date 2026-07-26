import { describe, expect, it } from 'vitest';
import { trip } from '../data/trip';
import {
  activeDayIndex,
  daysBetween,
  daysUntilStart,
  formatDayMonth,
  formatDriving,
  isWithinTrip,
  parseIsoDate,
  toIsoDate,
  weekdayOf,
} from './dates';

describe('parseIsoDate', () => {
  it('builds a local calendar date, not a UTC instant', () => {
    const date = parseIsoDate('2026-07-29');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(29);
    expect(date.getHours()).toBe(0);
  });

  it('rejects anything that is not YYYY-MM-DD', () => {
    expect(() => parseIsoDate('29-07-2026')).toThrow();
    expect(() => parseIsoDate('2026-7-9')).toThrow();
  });
});

describe('toIsoDate', () => {
  it('round-trips through parseIsoDate', () => {
    for (const iso of ['2026-01-01', '2026-07-29', '2026-12-31']) {
      expect(toIsoDate(parseIsoDate(iso))).toBe(iso);
    }
  });

  it('uses the local day even late at night', () => {
    expect(toIsoDate(new Date(2026, 7, 2, 23, 59))).toBe('2026-08-02');
  });
});

describe('weekdayOf', () => {
  it('agrees with every weekday written in the data', () => {
    for (const day of trip.days) {
      expect(weekdayOf(day.date), `${day.id} (${day.date})`).toBe(day.weekday);
    }
  });

  it('knows the known anchors of the trip', () => {
    expect(weekdayOf('2026-07-29')).toBe('Carsamba');
    expect(weekdayOf('2026-08-01')).toBe('Cumartesi');
    expect(weekdayOf('2026-08-07')).toBe('Cuma');
  });
});

describe('trip window', () => {
  it('covers the ten planned days with no gaps', () => {
    expect(trip.days).toHaveLength(10);
    trip.days.forEach((day, index) => {
      expect(daysBetween(trip.trip.startDate, day.date)).toBe(index);
    });
  });

  it('matches the declared start, end and night count', () => {
    const first = trip.days.at(0);
    const last = trip.days.at(-1);
    expect(first?.date).toBe(trip.trip.startDate);
    expect(last?.date).toBe(trip.trip.endDate);
    expect(daysBetween(trip.trip.startDate, trip.trip.endDate)).toBe(trip.trip.nights);
  });

  it('includes the endpoints', () => {
    expect(isWithinTrip(trip.trip, '2026-07-29')).toBe(true);
    expect(isWithinTrip(trip.trip, '2026-08-07')).toBe(true);
    expect(isWithinTrip(trip.trip, '2026-07-28')).toBe(false);
    expect(isWithinTrip(trip.trip, '2026-08-08')).toBe(false);
  });
});

describe('activeDayIndex', () => {
  it('pins the current day when the family is on the trip', () => {
    expect(activeDayIndex(trip.days, '2026-08-01')).toBe(3);
    expect(activeDayIndex(trip.days, '2026-07-29')).toBe(0);
    expect(activeDayIndex(trip.days, '2026-08-07')).toBe(9);
  });

  it('falls back to day one before departure and after return', () => {
    expect(activeDayIndex(trip.days, '2026-07-26')).toBe(0);
    expect(activeDayIndex(trip.days, '2027-01-01')).toBe(0);
  });
});

describe('daysUntilStart', () => {
  it('counts down, hits zero on departure day, goes negative after', () => {
    expect(daysUntilStart(trip.trip, '2026-07-26')).toBe(3);
    expect(daysUntilStart(trip.trip, '2026-07-29')).toBe(0);
    expect(daysUntilStart(trip.trip, '2026-08-02')).toBe(-4);
  });
});

describe('formatting', () => {
  it('writes dates the way the family says them', () => {
    expect(formatDayMonth('2026-07-29')).toBe('29 Temmuz');
    expect(formatDayMonth('2026-08-01')).toBe('1 Ağustos');
  });

  it('writes driving times compactly', () => {
    expect(formatDriving(135)).toBe('2 sa 15 dk');
    expect(formatDriving(30)).toBe('30 dk');
    expect(formatDriving(120)).toBe('2 sa');
    expect(formatDriving(0)).toBe('yolculuk yok');
  });
});
