import { describe, expect, it } from 'vitest';
import { trip } from '../data/trip';
import { EMPTY_FILTERS, hasActiveFilter, search } from './search';

describe('search', () => {
  it('finds a stop by name across the whole trip', () => {
    const results = search(trip, { ...EMPTY_FILTERS, query: 'Montefioralle' });
    expect(results.some((r) => r.kind === 'stop' && r.title === 'Montefioralle')).toBe(true);
  });

  it('finds the pork phrase when searching a word only it contains', () => {
    // Isolates the phrase match specifically, rather than accidentally
    // passing because *something* matched "cinghiale" somewhere.
    const results = search(trip, { ...EMPTY_FILTERS, query: 'cinghiale' });
    expect(results.some((r) => r.kind === 'phrase')).toBe(true);
  });

  it('finds a food entry by its pork warning, not just its name', () => {
    // The fuar panini stall isn't named "porchetta" anywhere — the word only
    // appears in its porkWarning. This is the exact mid-restaurant query the
    // feature exists for: "does this contain X" typed while ordering.
    const results = search(trip, { ...EMPTY_FILTERS, query: 'porchetta' });
    expect(
      results.some((r) => r.kind === 'food' && r.title.includes('panini tezgahları')),
    ).toBe(true);
  });

  it('finds shopping by what it is for', () => {
    const results = search(trip, { ...EMPTY_FILTERS, query: 'ebru' });
    expect(results.some((r) => r.kind === 'shopping' && r.title.includes('Il Torchio'))).toBe(true);
  });

  it('finds a phrase by its Turkish or Italian text', () => {
    expect(search(trip, { ...EMPTY_FILTERS, query: 'domuz' }).some((r) => r.kind === 'phrase')).toBe(
      true,
    );
    expect(
      search(trip, { ...EMPTY_FILTERS, query: 'maiale' }).some((r) => r.kind === 'phrase'),
    ).toBe(true);
  });

  it('does not flood results with phrases when the query is empty', () => {
    expect(search(trip, EMPTY_FILTERS).some((r) => r.kind === 'phrase')).toBe(false);
  });

  it('filters by theme', () => {
    const results = search(trip, { ...EMPTY_FILTERS, theme: 'market' });
    expect(results.every((r) => r.dayId === 'd4' || r.dayId === 'd8')).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('filters by elderFriendly', () => {
    const results = search(trip, { ...EMPTY_FILTERS, elderFriendlyOnly: true });
    const dayIds = new Set(results.map((r) => r.dayId));
    expect(dayIds.has('d8')).toBe(false); // day 8 (Floransa) is not elder-friendly
    expect(dayIds.has('d3')).toBe(true); // day 3 (Siena) is
  });

  it('filters by tag', () => {
    const results = search(trip, { ...EMPTY_FILTERS, tag: 'market' });
    expect(results.every((r) => r.kind === 'stop')).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('filters by tier', () => {
    const results = search(trip, { ...EMPTY_FILTERS, tier: 'skip' });
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) expect(result.kind).toBe('stop');
  });

  it('combines query and filters', () => {
    const results = search(trip, { ...EMPTY_FILTERS, query: 'pazari', tag: 'market' });
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('hasActiveFilter', () => {
  it('is false for the empty filter set', () => {
    expect(hasActiveFilter(EMPTY_FILTERS)).toBe(false);
  });

  it('is true when any field is set', () => {
    expect(hasActiveFilter({ ...EMPTY_FILTERS, query: 'x' })).toBe(true);
    expect(hasActiveFilter({ ...EMPTY_FILTERS, elderFriendlyOnly: true })).toBe(true);
    expect(hasActiveFilter({ ...EMPTY_FILTERS, theme: 'city' })).toBe(true);
    expect(hasActiveFilter({ ...EMPTY_FILTERS, tag: 'shopping' })).toBe(true);
    expect(hasActiveFilter({ ...EMPTY_FILTERS, tier: 'core' })).toBe(true);
  });
});
