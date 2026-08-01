import { describe, expect, it } from 'vitest';
import { trip } from '../data/trip';
import { getDayRoute, getRouteDirectionsLinks } from './routes';

describe('routes derivation', () => {
  it('returns valid route derivation for every day in the trip', () => {
    for (const day of trip.days) {
      const route = getDayRoute(day);
      expect(route).toBeDefined();
      if (!route) continue;

      expect(route.starterRoute.origin).toBe(trip.base.name);
      expect(route.starterRoute.durationMin).toBeGreaterThan(0);
      expect(route.starterRoute.km).toBeGreaterThan(0);
      expect(route.starterRoute.navUrl).toContain('https://');

      expect(route.legs.length).toBeGreaterThan(0);
      const directions = getRouteDirectionsLinks(route);
      expect(directions.google).toContain('google.com/maps/dir/');
      expect(directions.apple).toContain('maps.apple.com/');
    }
  });

  it('starter route destination matches top destination for day 1', () => {
    const day1Route = getDayRoute(trip.days[0]!);
    expect(day1Route?.starterRoute.destination).toContain('Pisa');
    expect(day1Route?.starterRoute.durationMin).toBe(65);
  });

  /**
   * Routes are keyed by day id, so re-ordering the itinerary silently leaves
   * every day pointing at the previous occupant's car park — which is exactly
   * what happened when Siena, Floransa, Arezzo and the Chianti day were moved.
   * This pins each day's route to a place that day actually goes to.
   */
  it.each([
    ['d1', 'Pisa'],
    ['d2', 'Tavarnelle'],
    ['d3', 'Siena'],
    ['d4', 'Villa Costanza'],
    ['d5', 'Arezzo'],
    ['d6', 'Pienza'],
    ['d7', 'San Gimignano'],
    ['d8', 'Casa Sola'],
    ['d9', 'Montelupo'],
    ['d10', 'Pisa Havalimanı'],
  ])('%s drives to somewhere on its own itinerary (%s)', (dayId, place) => {
    const day = trip.days.find((candidate) => candidate.id === dayId);
    if (day === undefined) throw new Error(`Gün yok: ${dayId}`);
    expect(getDayRoute(day)?.starterRoute.destination).toContain(place);
  });

  /** The day card's "Sürüş" figure and the route's own total must agree. */
  it.each(['d3', 'd4', 'd5', 'd8'])('%s driving minutes match the route total', (dayId) => {
    const day = trip.days.find((candidate) => candidate.id === dayId);
    if (day === undefined) throw new Error(`Gün yok: ${dayId}`);
    expect(getDayRoute(day)?.totalDrivingMinutes).toBe(day.drivingMinutes);
  });
});
