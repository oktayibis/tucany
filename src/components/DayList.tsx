import { trip } from '../data/trip';
import { formatDriving } from '../lib/dates';
import { euro } from '../lib/format';
import { useTrip } from '../state/TripContext';
import { DayCard } from './DayCard';
import { ModeSwitch } from './ModeSwitch';
import { PartyControl } from './PartyControl';

/**
 * Home. A vertical route: each day is a waypoint, and the drive it took to
 * get there is the segment rendered before it — so day 1 (arrival) opens the
 * line and the two heavy driving days (Arezzo, Val d'Orcia) visibly widen it.
 * The connecting line itself is a step-5 visual; the DOM order here is what
 * that styling will hang off.
 */
export function DayList({ onOpenDay }: { readonly onOpenDay: (dayId: string) => void }) {
  const { today, isOnTrip, activeDayId, budget } = useTrip();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-24">
      <header>
        <h1 className="text-2xl font-extrabold">{trip.trip.title}</h1>
        <p className="text-sm opacity-75">
          {trip.base.name} · {trip.trip.nights} gece
        </p>
      </header>

      <ModeSwitch />
      <PartyControl />

      {isOnTrip && (
        <button
          type="button"
          onClick={() => onOpenDay(activeDayId)}
          className="min-h-11 rounded border-2 p-3 text-left"
        >
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">Bugün</p>
          <p className="font-bold">
            {trip.days.find((day) => day.id === activeDayId)?.title ?? ''}
          </p>
        </button>
      )}

      <ol className="flex flex-col gap-2">
        {trip.days.map((day, index) => {
          const dayTotal = budget.days.find((candidate) => candidate.dayId === day.id)?.total ?? 0;
          return (
            <li key={day.id} className="flex flex-col gap-2">
              {index > 0 && (
                <p aria-hidden="true" className="pl-3 text-xs opacity-60">
                  ↓ {formatDriving(day.drivingMinutes)} sürüş
                </p>
              )}
              <DayCard
                day={day}
                index={index}
                total={dayTotal}
                isToday={day.date === today}
                onOpen={() => onOpenDay(day.id)}
              />
            </li>
          );
        })}
      </ol>

      <footer className="border-t pt-4 text-sm opacity-75">
        <p>
          Toplam ({budget.mode}): {euro(budget.grandTotal)} · Atlanan: {euro(budget.savedTotal)}
        </p>
      </footer>
    </div>
  );
}
