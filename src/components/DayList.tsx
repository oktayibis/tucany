import { trip } from '../data/trip';
import { formatDriving } from '../lib/dates';
import { euro } from '../lib/format';
import { PriceTag } from './PriceTag';
import { useTrip } from '../state/TripContext';
import { DayCard } from './DayCard';
import { ModeSwitch } from './ModeSwitch';
import { PartyControl } from './PartyControl';
import { NavButton, PhoneButton } from './NavButton';

/**
 * Home. The signature element: a continuous vertical route where each day is
 * a waypoint and the segment before it is drawn tall or short in proportion
 * to that day's driving minutes — so the two heavy driving days (Arezzo,
 * Val d'Orcia) visibly widen the line and the near-zero days sit close
 * together, legible at a glance before reading a single number.
 */
export function DayList({ onOpenDay }: { readonly onOpenDay: (dayId: string) => void }) {
  const { today, isOnTrip, activeDayId, budget } = useTrip();

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-24">
      <header className="bg-plate px-4 pb-5 pt-6 text-plate-text">
        <h1 className="font-display text-display-xl font-semibold">{trip.trip.title}</h1>
        <p className="text-sm opacity-85">
          🏨 {trip.base.name} · {trip.trip.nights} gece
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <NavButton place={trip.base} note="Otele yol tarifi al" />
          <PhoneButton phone={trip.base.phone} />
        </div>
      </header>

      <div className="-mt-3.5 px-4">
        <ModeSwitch />
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">
        <PartyControl />

        {isOnTrip && (
          <button
            type="button"
            onClick={() => onOpenDay(activeDayId)}
            className="min-h-11 border-2 border-accent bg-surface-2 p-3 text-left"
          >
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent">
              Bugün
            </p>
            <p className="font-display font-medium">
              {trip.days.find((day) => day.id === activeDayId)?.title ?? ''}
            </p>
          </button>
        )}
      </div>

      <ol className="relative flex flex-col px-4 pl-9 pt-6 before:absolute before:bottom-8 before:left-[1.4rem] before:top-6 before:w-0.5 before:bg-border before:content-['']">
        {trip.days.map((day, index) => {
          const dayTotal = budget.days.find((candidate) => candidate.dayId === day.id)?.total ?? 0;
          const isToday = day.date === today;
          return (
            <li key={day.id} className="flex flex-col gap-2">
              {index > 0 && (
                <div
                  aria-hidden="true"
                  className="flex items-center pl-1 text-xs text-text-muted"
                  style={{ height: `${0.9 + day.drivingMinutes * 0.032}rem` }}
                >
                  <span className="bg-bg pr-2">↓ {formatDriving(day.drivingMinutes)} sürüş</span>
                </div>
              )}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute left-[-1.35rem] top-0.5 h-3.5 w-3.5 rounded-full border-2 bg-surface-2 ${
                    day.starred === true
                      ? 'border-accent-2 bg-antimony'
                      : isToday
                        ? 'border-accent bg-cobalt'
                        : 'border-accent'
                  }`}
                />
                <DayCard
                  day={day}
                  index={index}
                  total={dayTotal}
                  isToday={isToday}
                  onOpen={() => onOpenDay(day.id)}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="mt-4 flex flex-col gap-3 border-t border-border px-4 pt-4 text-sm text-text-muted">
        <p>
          Toplam ({budget.mode}):{' '}
          <PriceTag amount={budget.grandTotal} className="font-semibold text-text" /> · Atlanan:{' '}
          {euro(budget.savedTotal)}
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 self-start border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-accent"
        >
          Yazdır / PDF olarak kaydet
        </button>
      </footer>
    </div>
  );
}
