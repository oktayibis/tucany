import type { Day } from '../data/schema';
import { trip } from '../data/trip';
import { getDayRoute } from '../lib/routes';
import { formatDriving } from '../lib/dates';
import { NavButton, PhoneButton } from './NavButton';
import { RatingBadge } from './RatingBadge';

/**
 * The driving detail for a day: first leg out of the hotel, the per-leg
 * breakdown, and the hotel's own card.
 *
 * All of it lives inside a collapsed disclosure in `DayDetail`. It used to
 * open every day at full height — including a hotel card identical on all ten
 * days — above the stops the family actually came to see. The one number worth
 * seeing without opening anything (total driving) is hoisted into the day
 * header's stat strip instead.
 */
export function RouteSection({ day }: { readonly day: Day }) {
  const dayRoute = getDayRoute(day);

  return (
    <div className="flex flex-col gap-4 text-sm">
      {dayRoute !== undefined && (
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
            İlk durak
          </p>
          <p className="mt-0.5 font-display font-medium">
            Otel → {dayRoute.starterRoute.destination}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {formatDriving(dayRoute.starterRoute.durationMin)} · ~{dayRoute.starterRoute.km} km
          </p>
          <div className="mt-2">
            <NavButton
              place={{
                name: dayRoute.starterRoute.destination,
                nav: dayRoute.starterRoute.navUrl,
              }}
            />
          </div>
        </div>
      )}

      {dayRoute !== undefined && dayRoute.legs.length > 0 && (
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
            Etaplar (~{dayRoute.totalKm} km)
          </p>
          <ul className="mt-1 flex flex-col">
            {dayRoute.legs.map((leg) => (
              <li
                key={`${leg.from}-${leg.to}`}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-1.5 text-xs last:border-b-0"
              >
                <span className="font-medium">
                  {leg.from} → {leg.to}
                </span>
                <span className="flex items-center gap-2 text-text-muted">
                  <span className="font-semibold text-accent">{formatDriving(leg.durationMin)}</span>
                  <span>{leg.km} km</span>
                  {leg.navUrl !== undefined && (
                    <a
                      href={leg.navUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-accent underline"
                    >
                      Aç
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-border pt-3">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
          Otel (başlangıç & dönüş)
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="font-display font-medium">{trip.base.name}</p>
          <RatingBadge rating={trip.base.rating} />
        </div>
        <p className="text-xs text-text-muted">{trip.base.address}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <NavButton place={trip.base} />
          <PhoneButton phone={trip.base.phone} />
        </div>
      </div>
    </div>
  );
}
