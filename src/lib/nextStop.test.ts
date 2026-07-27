import { describe, expect, it } from 'vitest';
import type { Stop, StopTier } from '../data/schema';
import { nextStop } from './nextStop';

function stop(id: string, tier: StopTier = 'core'): Stop {
  return { id, name: id, tier };
}

function visitedSet(ids: readonly string[]): { has: (id: string) => boolean } {
  const set = new Set(ids);
  return { has: (id) => set.has(id) };
}

describe('nextStop', () => {
  it('returns the first stop when nothing is visited', () => {
    const stops = [stop('a'), stop('b'), stop('c')];
    expect(nextStop(stops, visitedSet([]))?.id).toBe('a');
  });

  it('returns the first not-yet-visited stop', () => {
    const stops = [stop('a'), stop('b'), stop('c')];
    expect(nextStop(stops, visitedSet(['a']))?.id).toBe('b');
  });

  it('falls back to the last stop once everything is visited', () => {
    const stops = [stop('a'), stop('b'), stop('c')];
    expect(nextStop(stops, visitedSet(['a', 'b', 'c']))?.id).toBe('c');
  });

  it('ignores skip/removed stops', () => {
    const stops = [stop('a', 'skip'), stop('b', 'removed'), stop('c', 'core')];
    expect(nextStop(stops, visitedSet([]))?.id).toBe('c');
  });

  it('returns undefined when there are no visible stops', () => {
    const stops = [stop('a', 'skip')];
    expect(nextStop(stops, visitedSet([]))).toBeUndefined();
  });

  it('returns undefined for an empty list', () => {
    expect(nextStop([], visitedSet([]))).toBeUndefined();
  });
});
