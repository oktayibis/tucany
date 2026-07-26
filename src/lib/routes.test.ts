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
});
