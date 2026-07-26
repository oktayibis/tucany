import type { Day } from '../data/schema';
import { trip } from '../data/trip';
import { formatDriving } from '../lib/dates';
import { getDayRoute } from '../lib/routes';
import { NavButton, PhoneButton } from './NavButton';

/** "Rota/navigasyon" — the day's driving load, base hotel origin/destination, starter route, and schedule. */
export function RouteSection({ day }: { readonly day: Day }) {
  const dayRoute = getDayRoute(day);

  return (
    <div className="flex flex-col gap-4">
      {/* Hotel Card */}
      <div className="border border-border bg-surface-2 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
              🏨 Başlangıç & Dönüş Noktası (Otel)
            </span>
            <p className="font-display text-base font-medium">{trip.base.name}</p>
            <p className="text-xs text-text-muted">{trip.base.address}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <NavButton place={trip.base} note="Otele yol tarifi al" />
          <PhoneButton phone={trip.base.phone} />
        </div>
      </div>

      {/* Starter Route Card */}
      {dayRoute !== undefined && (
        <div className="border border-cobalt/30 bg-surface p-3">
          <span className="font-display text-xs font-semibold uppercase tracking-wide text-cobalt">
            🚀 Başlangıç Rotası (Otel → İlk Durak)
          </span>
          <p className="mt-1 font-display text-base font-semibold text-ink">
            Otel → {dayRoute.starterRoute.destination}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
            <span>⏱ Sürüş: <strong>{formatDriving(dayRoute.starterRoute.durationMin)}</strong></span>
            <span>📍 Mesafe: <strong>~{dayRoute.starterRoute.km} km</strong></span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <NavButton
              place={{
                name: dayRoute.starterRoute.destination,
                nav: dayRoute.starterRoute.navUrl,
              }}
              note="İlk durağa yol tarifi al"
            />
          </div>
        </div>
      )}

      {/* Daily Driving Load & Route Leg Breakdown */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <p>
            Bugünkü toplam sürüş:{' '}
            <strong className="font-display font-semibold">{formatDriving(day.drivingMinutes)}</strong>
            {dayRoute !== undefined && (
              <span className="ml-2 text-xs font-normal text-text-muted">
                (~{dayRoute.totalKm} km)
              </span>
            )}
          </p>
        </div>

        {dayRoute !== undefined && dayRoute.legs.length > 0 && (
          <div className="mt-1 border border-border bg-surface-2 p-3 text-xs">
            <p className="font-semibold text-text-muted mb-2">🚗 Sürüş Segmentleri & Süreler:</p>
            <ul className="flex flex-col gap-2">
              {dayRoute.legs.map((leg, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between border-b border-border/50 pb-1 last:border-b-0 last:pb-0">
                  <span className="font-medium text-ink">
                    {leg.from} → {leg.to}
                  </span>
                  <div className="flex items-center gap-2 text-text-muted">
                    <span className="font-semibold text-accent">{formatDriving(leg.durationMin)}</span>
                    <span>({leg.km} km)</span>
                    {leg.navUrl && (
                      <a
                        href={leg.navUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cobalt underline hover:text-accent font-medium"
                      >
                        Aç
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {day.timeline !== undefined && day.timeline.length > 0 && (
        <ol className="flex flex-col gap-1 border-l-2 border-border pl-3 text-sm">
          {day.timeline.map((entry) => (
            <li key={entry.time} className="flex gap-2">
              <span className="font-display font-semibold tabular-nums text-accent">
                {entry.time}
              </span>
              <span>{entry.what}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

