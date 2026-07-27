import { useState } from 'react';
import type { NearbyVenue, NearbyVenueCategory } from '../data/schema';
import { trip } from '../data/trip';
import { weekdayDisplay } from '../lib/dates';
import { Disclosure } from './Disclosure';
import { CATEGORY_LABEL, HotelVenueSheet } from './HotelVenueSheet';
import { NavButton } from './NavButton';
import { RatingBadge } from './RatingBadge';

type FilterId = 'all' | NearbyVenueCategory;

const FILTERS: readonly { readonly id: FilterId; readonly label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'restaurant', label: 'Restoran' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'bakery', label: 'Fırın' },
  { id: 'gelato', label: 'Dondurma' },
];

/**
 * Eating places around the base hotel, on the day list rather than inside a
 * day — these belong to no particular day, they are what the family falls back
 * on when a planned dinner is off or someone wants breakfast before setting
 * out. Collapsed by default so it never pushes the days themselves down.
 */
export function HotelVenuesSection() {
  const [filter, setFilter] = useState<FilterId>('all');
  const [selected, setSelected] = useState<NearbyVenue | null>(null);

  const venues = trip.base.nearbyVenues ?? [];
  if (venues.length === 0) return null;

  const shown = filter === 'all' ? venues : venues.filter((v) => v.category === filter);

  return (
    <section>
      <Disclosure title="Otel çevresi · yeme içme" icon="utensils" count={venues.length}>
        <p className="text-meta text-neutral-700">
          Barberino Tavarnelle'de otelden yürüme ya da birkaç dakika sürüş mesafesindeki mekânlar,
          otele yakınlığa göre sıralı.
        </p>

        <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`min-h-11 shrink-0 rounded-full px-3 text-meta font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-accent-700 text-white'
                  : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ul className="mt-3 flex flex-col gap-2">
          {shown.map((venue) => (
            <li key={venue.id}>
              <article className="rounded-xl border border-border bg-surface-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="card-kicker">
                      {CATEGORY_LABEL[venue.category]} · {venue.distanceNote}
                    </p>
                    <h4 className="card-title">{venue.name}</h4>
                  </div>
                  <RatingBadge rating={venue.rating} />
                </div>

                <p className="mt-1 text-meta leading-relaxed text-neutral-800">{venue.why}</p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {venue.menuHighlights.slice(0, 3).map((item) => (
                    <span key={item} className="tag tag-accent-2">
                      {item}
                    </span>
                  ))}
                  {venue.menuHighlights.length > 3 && (
                    <span className="tag tag-neutral">+{venue.menuHighlights.length - 3}</span>
                  )}
                </div>

                <p className="mt-2 text-meta text-neutral-700">{venue.hours}</p>
                {venue.closedOn !== undefined && venue.closedOn.length > 0 && (
                  <p className="text-meta font-semibold text-danger">
                    Kapalı: {venue.closedOn.map(weekdayDisplay).join(', ')}
                  </p>
                )}
                {venue.porkSafe === true && (
                  <p className="text-meta font-semibold text-safe">Domuzsuz</p>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(venue)}
                    className="btn btn-secondary flex-1"
                  >
                    Menü & detay
                  </button>
                  <NavButton place={venue} className="shrink-0" />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Disclosure>

      {selected !== null && (
        <HotelVenueSheet venue={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
