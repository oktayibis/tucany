import type { Day } from '../data/schema';
import { trip } from '../data/trip';
import { getDayRoute } from '../lib/routes';
import { formatDriving } from '../lib/dates';
import { NavButton, PhoneButton } from './NavButton';
import { RatingBadge } from './RatingBadge';

/**
 * The driving detail for a day: first leg out of the hotel, the per-leg
 * breakdown, and the hotel's own card — each an "İlk durak / Sonra / Dönüş"
 * row in the mockup's shape.
 *
 * All of it lives inside a collapsed disclosure in the day panel. It used to
 * open every day at full height — including a hotel card identical on all ten
 * days — above the stops the family actually came to see. The one number worth
 * seeing without opening anything (total driving) sits in the header's stat
 * strip and on the disclosure's own row instead.
 */
export function RouteSection({ day }: { readonly day: Day }) {
  const dayRoute = getDayRoute(day);

  return (
    <div className="flex flex-col gap-2">
      {dayRoute !== undefined && (
        <Leg
          label="İlk durak"
          name={`Otel → ${dayRoute.starterRoute.destination}`}
          detail={`${formatDriving(dayRoute.starterRoute.durationMin)} · ~${dayRoute.starterRoute.km} km`}
          nav={{ name: dayRoute.starterRoute.destination, nav: dayRoute.starterRoute.navUrl }}
        />
      )}

      {dayRoute?.legs.map((leg) => (
        <Leg
          key={`${leg.from}-${leg.to}`}
          label="Sonra"
          name={`${leg.from} → ${leg.to}`}
          detail={`${formatDriving(leg.durationMin)} · ~${leg.km} km`}
          nav={leg.navUrl === undefined ? undefined : { name: leg.to, nav: leg.navUrl }}
        />
      ))}

      <div className="rounded-xl bg-neutral-200 px-4 py-3">
        <p className="text-micro uppercase tracking-[0.1em] text-neutral-700">
          Otel (başlangıç &amp; dönüş)
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-display text-lead font-semibold">{trip.base.name}</p>
          <RatingBadge rating={trip.base.rating} />
        </div>
        <p className="mt-[3px] text-meta text-neutral-700">{trip.base.address}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <NavButton place={trip.base} label="Yol tarifi" alt className="min-h-[44px]" />
          <PhoneButton phone={trip.base.phone} className="min-h-[44px] w-[52px]" />
        </div>
      </div>
    </div>
  );
}

function Leg({
  label,
  name,
  detail,
  nav,
}: {
  readonly label: string;
  readonly name: string;
  readonly detail: string;
  readonly nav?: { readonly name: string; readonly nav: string } | undefined;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-neutral-200 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-micro uppercase tracking-[0.1em] text-neutral-700">{label}</p>
        <p className="mt-1 font-display text-lead font-semibold leading-[1.3]">{name}</p>
        <p className="mt-[3px] text-meta text-neutral-700">{detail}</p>
      </div>
      {nav !== undefined && (
        <NavButton
          place={nav}
          variant="secondary"
          className="min-h-[44px] w-[52px] flex-none border-neutral-400"
        />
      )}
    </div>
  );
}
