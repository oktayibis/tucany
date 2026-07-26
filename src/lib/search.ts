import type { Day, Phrase, Shopping, Stop, TripData } from '../data/schema';
import { matchesQuery } from './text';

/**
 * Cross-section search + filters.
 *
 * One query box searches stop names, food, shopping and phrases at once —
 * useful mid-street when you remember "the place with the ebru paper" but not
 * which day it was on. Filters narrow by theme, elder-friendliness, tags and
 * tier without needing the query box at all.
 */

export type SearchResultKind = 'stop' | 'food' | 'shopping' | 'phrase';

export type SearchResult = {
  readonly kind: SearchResultKind;
  readonly dayId?: string;
  readonly title: string;
  readonly subtitle?: string;
};

export type SearchFilters = {
  readonly query: string;
  readonly theme: Day['theme'] | null;
  readonly elderFriendlyOnly: boolean;
  readonly tag: 'market' | 'shopping' | null;
  readonly tier: Stop['tier'] | null;
};

export const EMPTY_FILTERS: SearchFilters = {
  query: '',
  theme: null,
  elderFriendlyOnly: false,
  tag: null,
  tier: null,
};

export function hasActiveFilter(filters: SearchFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.theme !== null ||
    filters.elderFriendlyOnly ||
    filters.tag !== null ||
    filters.tier !== null
  );
}

function stopMatches(stop: Stop, filters: SearchFilters): boolean {
  if (filters.tier !== null && stop.tier !== filters.tier) return false;
  if (filters.tag !== null && !(stop.tags?.includes(filters.tag) ?? false)) return false;
  if (filters.query.trim() === '') return true;
  return matchesQuery(stop.name, filters.query) || matchesQuery(stop.why ?? '', filters.query);
}

function shoppingMatches(entry: Shopping, filters: SearchFilters): boolean {
  if (filters.tag !== null && filters.tag !== 'shopping') return false;
  if (filters.tier !== null) return false; // shopping has no tier
  if (filters.query.trim() === '') return true;
  return matchesQuery(entry.name, filters.query) || matchesQuery(entry.for, filters.query);
}

function phraseMatches(phrase: Phrase, filters: SearchFilters): boolean {
  if (filters.theme !== null || filters.elderFriendlyOnly || filters.tag !== null || filters.tier !== null) {
    return false; // phrases have no day-level attributes to filter by
  }
  if (filters.query.trim() === '') return false; // don't flood results with all 8 phrases by default
  return matchesQuery(phrase.tr, filters.query) || matchesQuery(phrase.it, filters.query);
}

function dayPassesFilters(day: Day, filters: SearchFilters): boolean {
  if (filters.theme !== null && day.theme !== filters.theme) return false;
  if (filters.elderFriendlyOnly && !day.elderFriendly) return false;
  return true;
}

/** All results across the trip that satisfy the query and filters. */
export function search(data: TripData, filters: SearchFilters): readonly SearchResult[] {
  const results: SearchResult[] = [];

  for (const day of data.days) {
    if (!dayPassesFilters(day, filters)) continue;

    for (const stop of day.stops) {
      if (stopMatches(stop, filters)) {
        results.push({ kind: 'stop', dayId: day.id, title: stop.name, subtitle: day.title });
      }
    }
    for (const entry of day.shopping) {
      if (shoppingMatches(entry, filters)) {
        results.push({ kind: 'shopping', dayId: day.id, title: entry.name, subtitle: entry.for });
      }
    }
    if (filters.query.trim() !== '') {
      for (const entry of day.food) {
        if (matchesQuery(entry.name, filters.query)) {
          results.push({ kind: 'food', dayId: day.id, title: entry.name, subtitle: day.title });
        }
      }
    }
  }

  if (filters.theme === null && !filters.elderFriendlyOnly) {
    for (const phrase of data.phrases) {
      if (phraseMatches(phrase, filters)) {
        results.push({ kind: 'phrase', title: phrase.tr, subtitle: phrase.it });
      }
    }
  }

  return results;
}
