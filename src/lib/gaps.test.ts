import { describe, expect, it } from 'vitest';
import { trip } from '../data/trip';
import { findGaps, gapsForDay } from './gaps';

const gaps = findGaps(trip);
const ids = gaps.map((gap) => gap.id);

describe('findGaps', () => {
  it('finds something — this data has known soft spots', () => {
    expect(gaps.length).toBeGreaterThan(0);
  });

  it('gives every gap a place, a description and a severity', () => {
    for (const gap of gaps) {
      expect(gap.where.length).toBeGreaterThan(0);
      expect(gap.what.length).toBeGreaterThan(0);
      expect(['info', 'warning']).toContain(gap.severity);
    }
  });

  it('uses unique ids so React keys are stable', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('puts warnings before notes', () => {
    const firstInfo = gaps.findIndex((gap) => gap.severity === 'info');
    const lastWarning = gaps.map((gap) => gap.severity).lastIndexOf('warning');
    if (firstInfo !== -1 && lastWarning !== -1) expect(lastWarning).toBeLessThan(firstInfo);
  });

  it('writes in Turkish, not in field names', () => {
    for (const gap of gaps) {
      expect(gap.what).not.toMatch(/costNote|priceNote|closedOn|tier|undefined|null/);
    }
  });
});

describe('the specific gaps this data has', () => {
  it('reports that the Karma headline is well above the sum of its parts', () => {
    const headline = gaps.find((gap) => gap.id === 'headline-mixed');
    expect(headline).toBeDefined();
    expect(headline?.what).toContain('€950');
  });

  it('explains that Karma has no per-day figure to compare against', () => {
    expect(ids).toContain('mixed-no-day-figures');
  });

  it('flags the day where the cheap lunch costs more than the splurge', () => {
    // Day 9's two lunches belong to different itineraries, not price tiers.
    expect(ids).toContain('inverted-tier-d9-lunch');
  });

  it('flags the fixed-menu price whose child share we had to infer', () => {
    const childShare = gaps.filter((gap) => gap.id.startsWith('child-share-'));
    expect(childShare).toHaveLength(1);
    expect(childShare[0]?.what).toContain('Officina della Bistecca');
    expect(childShare[0]?.severity).toBe('warning');
  });

  it('flags closure entries that match nothing in the plan', () => {
    expect(ids).toContain('closure-unmatched-Il Caratello (Tavarnelle)');
    expect(ids).toContain('closure-unmatched-Dario Doc (Panzano)');
  });

  it('flags that no shopping stop has a price, so none of it is budgeted', () => {
    const shopping = gaps.find((gap) => gap.id === 'shopping-unpriced');
    expect(shopping?.severity).toBe('warning');
    expect(shopping?.what).toContain('hiçbirinde');
    expect(shopping?.what).toContain('Arezzo');
  });

  it('reports tickets whose per-person split is unknown', () => {
    const unscalable = gaps.filter((gap) => gap.id.startsWith('unscalable-'));
    expect(unscalable.length).toBeGreaterThan(0);
    expect(unscalable.some((gap) => gap.what.includes('Fattoria Casa Sola'))).toBe(true);
  });

  it('reports the return day, which has a budget but no items', () => {
    expect(ids).toContain('empty-priced-day-d10');
  });
});

describe('what findGaps must NOT report', () => {
  it('no weekday mismatches — every label agrees with its date', () => {
    expect(ids.filter((id) => id.startsWith('weekday-'))).toEqual([]);
  });

  it('no closedToday contradictions — the day-1 flag checks out', () => {
    expect(ids.filter((id) => id.startsWith('closed-today-'))).toEqual([]);
  });

  it('does not flag Accademia, whose note states the child is free', () => {
    expect(ids.some((id) => id.includes('Accademia'))).toBe(false);
  });
});

describe('gapsForDay', () => {
  it('picks out the gaps belonging to one day', () => {
    const dayNine = gapsForDay(gaps, 'd9');
    expect(dayNine.length).toBeGreaterThan(0);
    for (const gap of dayNine) expect(gap.dayId).toBe('d9');
  });

  it('returns nothing for an unknown day', () => {
    expect(gapsForDay(gaps, 'd99')).toEqual([]);
  });

  it('leaves trip-level gaps unattached to any day', () => {
    const headline = gaps.find((gap) => gap.id === 'headline-mixed');
    expect(headline?.dayId).toBeUndefined();
  });
});
