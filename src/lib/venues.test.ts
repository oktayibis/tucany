import { describe, expect, it } from 'vitest';
import { trip } from '../data/trip';

/**
 * The hotel-adjacent venue list is the one part of the data a hungry family
 * acts on without any planning — so it carries two obligations the schema
 * cannot express on its own.
 */
describe('otel çevresi mekanlar', () => {
  const venues = trip.base.nearbyVenues ?? [];

  it('listelenmiş mekanlar var', () => {
    expect(venues.length).toBeGreaterThan(0);
  });

  /**
   * Pork is a hard constraint for this trip (`trip.constraints`), so silence is
   * not an acceptable answer for any venue: it is either confirmed pork-free or
   * it says what to avoid. A venue with neither reads as "safe" at a glance.
   */
  it('her mekan domuz eti konusunda ya güvenli işaretli ya da uyarı taşıyor', () => {
    for (const venue of venues) {
      const covered = venue.porkSafe === true || venue.porkWarning !== undefined;
      expect(covered, `${venue.name} domuz bilgisi taşımıyor`).toBe(true);
    }
  });

  /**
   * Every factual claim here (hours, phone, rating) was transcribed from a
   * named page rather than inferred — an earlier draft of this list carried
   * invented phone numbers and opening hours. `sourceUrl` is what makes a
   * stale entry re-checkable instead of merely plausible.
   */
  it('her mekan doğrulanabilir bir kaynak taşıyor', () => {
    for (const venue of venues) {
      expect(venue.sourceUrl, `${venue.name} kaynaksız`).toBeDefined();
    }
  });

  /** A rating with no stated source is the shape a fabricated one takes. */
  it('puan verilen her mekan puanın kaynağını da söylüyor', () => {
    for (const venue of venues) {
      if (venue.rating !== undefined) {
        expect(venue.ratingNote, `${venue.name} puan kaynağı yok`).toBeDefined();
      }
    }
  });
});
