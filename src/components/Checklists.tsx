import { trip } from '../data/trip';
import type { Booking, Priority } from '../data/schema';
import { euro } from '../lib/format';
import { telHref } from '../lib/nav';
import { bookingKey, packingKey, type PackingCategory } from '../state/keys';
import { useTrip } from '../state/TripContext';

const PACKING_LABEL: Readonly<Record<PackingCategory, string>> = {
  documents: 'Belgeler',
  tech: 'Teknoloji',
  heat: 'Sıcak + anne için',
  emergency: 'Acil durum',
};

const PRIORITY_STYLE: Readonly<Record<Priority, string>> = {
  high: 'border-danger bg-danger-bg text-danger',
  medium: 'border-warn-border bg-warn-bg text-warn-text',
  low: 'border-border bg-surface text-text-muted',
  optional: 'border-border bg-surface text-text-muted',
};

/**
 * "Listeler": the three checklists the brief asks for — bookings, packing,
 * and (as a trip-wide overview) which stops are already ticked "gezildi" from
 * the day-detail screens. Everything persists to localStorage keyed by
 * `DATA_VERSION`, so a data update never silently wipes progress already made.
 */
export function Checklists() {
  const { bookingsDone, packingDone, visited } = useTrip();

  const visitableStops = trip.days.flatMap((day) =>
    day.stops
      .filter((stop) => stop.tier === 'core' || stop.tier === 'optional')
      .map((stop) => ({ dayTitle: day.title, stop })),
  );
  const visitedCount = visitableStops.filter(({ stop }) => visited.has(stop.id)).length;

  return (
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-4 pb-8">
      <h1 className="text-display-lg font-semibold">Listeler</h1>

      <section>
        <h2 className="font-display text-base font-semibold">Rezervasyonlar</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {trip.bookings.map((booking) => (
            <BookingRow
              key={bookingKey(booking)}
              booking={booking}
              done={bookingsDone.has(bookingKey(booking))}
              onToggle={() => bookingsDone.toggle(bookingKey(booking))}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-base font-semibold">Bavul listesi</h2>
        <div className="mt-2 flex flex-col gap-4">
          {(Object.keys(trip.packing) as PackingCategory[]).map((category) => (
            <div key={category}>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
                {PACKING_LABEL[category]}
              </h3>
              <ul className="mt-1 flex flex-col gap-1">
                {trip.packing[category].map((item, index) => {
                  const key = packingKey(category, index);
                  return (
                    <li key={key}>
                      <label className="flex min-h-[44px] items-center gap-2 rounded-xl bg-surface px-4 py-2 text-body">
                        <input
                          type="checkbox"
                          checked={packingDone.has(key)}
                          onChange={() => packingDone.toggle(key)}
                          className="h-5 w-5 flex-none accent-accent"
                        />
                        <span className={packingDone.has(key) ? 'text-text-muted line-through' : ''}>
                          {item}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-base font-semibold">
          Gezilenler ({visitedCount}/{visitableStops.length})
        </h2>
        <ul className="mt-2 flex flex-col gap-1">
          {visitableStops.map(({ dayTitle, stop }) => (
            <li key={stop.id}>
              <label className="flex min-h-[44px] items-center gap-2 rounded-xl bg-surface px-4 py-2 text-body">
                <input
                  type="checkbox"
                  checked={visited.has(stop.id)}
                  onChange={() => visited.toggle(stop.id)}
                  className="h-5 w-5 flex-none accent-accent"
                />
                <span className="flex flex-col">
                  <span className={visited.has(stop.id) ? 'text-text-muted line-through' : ''}>
                    {stop.name}
                  </span>
                  <span className="text-xs text-text-muted">{dayTitle}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BookingRow({
  booking,
  done,
  onToggle,
}: {
  readonly booking: Booking;
  readonly done: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <li className="rounded-xl bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <label className="flex min-h-11 items-center gap-2 font-display font-medium">
          <input
            type="checkbox"
            checked={done}
            onChange={onToggle}
            className="h-5 w-5 flex-none accent-accent"
          />
          <span className={done ? 'text-text-muted line-through' : ''}>{booking.what}</span>
        </label>
        <span className="text-sm font-semibold tabular-nums">{euro(booking.cost)}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-7">
        <span className={`border px-1.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLE[booking.priority]}`}>
          {booking.when}
        </span>
        <span className="text-xs text-text-muted">{booking.how}</span>
      </div>
      {/\+\d/.test(booking.how) && (
        <a
          href={telHref(booking.how)}
          className="ml-7 mt-1 inline-block text-xs font-semibold text-accent"
        >
          Telefonu ara
        </a>
      )}
    </li>
  );
}
