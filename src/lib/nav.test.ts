import { describe, expect, it } from 'vitest';
import { trip } from '../data/trip';
import { isIos, mapLinks, queryFromGoogleUrl, telHref } from './nav';

describe('queryFromGoogleUrl', () => {
  it('reads the search term the author chose', () => {
    expect(
      queryFromGoogleUrl(
        'https://www.google.com/maps/search/?api=1&query=Parcheggio+Via+Pietrasantina+Pisa',
      ),
    ).toBe('Parcheggio Via Pietrasantina Pisa');
  });

  it('decodes escaped apostrophes', () => {
    expect(
      queryFromGoogleUrl(
        'https://www.google.com/maps/search/?api=1&query=L%27Antico+Trippaio+Firenze',
      ),
    ).toBe("L'Antico Trippaio Firenze");
  });

  it('returns null for anything unparseable', () => {
    expect(queryFromGoogleUrl('not a url')).toBeNull();
    expect(queryFromGoogleUrl('https://example.com/')).toBeNull();
  });
});

describe('mapLinks', () => {
  it('keeps the author\'s car park instead of routing into the ZTL', () => {
    const pisa = trip.days[0]?.stops[0];
    if (pisa === undefined) throw new Error('Pisa durağı yok');
    const links = mapLinks(pisa);
    expect(links.isAuthorRoute).toBe(true);
    expect(links.google).toBe(pisa.nav);
    expect(links.apple).toContain('Parcheggio%20Via%20Pietrasantina%20Pisa');
  });

  it('prefers the author URL even when the stop also has coordinates', () => {
    const links = mapLinks({
      name: 'Piazza dei Miracoli',
      lat: 43.7229,
      lng: 10.3966,
      nav: 'https://www.google.com/maps/search/?api=1&query=Parcheggio+Via+Pietrasantina+Pisa',
    });
    expect(links.google).toContain('Pietrasantina');
    expect(links.apple).not.toContain('43.7229');
  });

  it('falls back to coordinates when there is no author URL', () => {
    const links = mapLinks({ name: 'Montefioralle', lat: 43.585, lng: 11.305 });
    expect(links.isAuthorRoute).toBe(false);
    expect(links.google).toContain('query=43.585,11.305');
    expect(links.apple).toContain('ll=43.585,11.305');
    expect(links.apple).toContain('q=Montefioralle');
  });

  it('falls back to a name search as a last resort', () => {
    const links = mapLinks({ name: 'Torre Grossa', city: 'San Gimignano' });
    expect(links.google).toContain('Torre%20Grossa%20San%20Gimignano');
    expect(links.apple).toContain('Torre%20Grossa%20San%20Gimignano');
  });

  it('produces a working link for every stop in the trip', () => {
    for (const day of trip.days) {
      for (const stop of day.stops) {
        const links = mapLinks(stop);
        expect(() => new URL(links.google)).not.toThrow();
        expect(() => new URL(links.apple)).not.toThrow();
      }
    }
  });
});

describe('isIos', () => {
  it('recognises iPhone and iPad', () => {
    expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 5)).toBe(true);
    expect(isIos('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', 5)).toBe(true);
  });

  it('recognises iPadOS pretending to be a Mac', () => {
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(true);
  });

  it('leaves a real Mac and an Android phone alone', () => {
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe(false);
    expect(isIos('Mozilla/5.0 (Linux; Android 14; Pixel 8)', 5)).toBe(false);
  });
});

describe('telHref', () => {
  it('dials the numbers in the data', () => {
    expect(telHref('+39 055 807 3333')).toBe('tel:+390558073333');
    expect(telHref('+39 328 950 9196')).toBe('tel:+393289509196');
  });
});
