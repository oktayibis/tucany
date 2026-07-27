import { trip } from '../data/trip';
import { chosenOption, effectiveDrivingMinutes } from '../lib/budget';
import { euro } from '../lib/format';
import { PriceTag } from './PriceTag';
import { useTrip } from '../state/TripContext';
import { DayCard } from './DayCard';
import { ModeSwitch } from './ModeSwitch';
import { PartyControl } from './PartyControl';
import { NavButton, PhoneButton } from './NavButton';

/**
 * Home. A plain stack of day cards — each day's plate sits on its own,
 * ranked by total below it, with no line connecting them.
 */
export function DayList({ onOpenDay }: { readonly onOpenDay: (dayId: string) => void }) {
  const { today, isOnTrip, activeDayId, budget, mode, party, chosenOptions, upgrades } = useTrip();

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-24">
      <header className="rounded-b-3xl bg-plate px-4 pb-6 pt-7 text-plate-text">
        <h1 className="font-display text-display-xl">{trip.trip.title}</h1>
        <p className="text-sm opacity-80">
          🏨 {trip.base.name} · {trip.trip.nights} gece
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <NavButton place={trip.base} note="Otele yol tarifi al" />
          <PhoneButton phone={trip.base.phone} />
        </div>
      </header>

      <div className="px-4 pt-4">
        <ModeSwitch />
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">
        <PartyControl />

        {isOnTrip && (
          <button
            type="button"
            onClick={() => onOpenDay(activeDayId)}
            className="min-h-11 rounded-2xl border-2 border-accent bg-surface-2 p-3 text-left"
          >
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent">
              Bugün
            </p>
            <p className="font-display text-lg">
              {trip.days.find((day) => day.id === activeDayId)?.title ?? ''}
            </p>
          </button>
        )}
      </div>

      <ol className="flex flex-col gap-3 px-4 pt-6">
        {trip.days.map((day, index) => {
          const dayTotal = budget.days.find((candidate) => candidate.dayId === day.id)?.total ?? 0;
          const isToday = day.date === today;
          const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
          const drivingMinutes = effectiveDrivingMinutes(day, option);
          const undecided = day.options !== undefined && chosenOptions[day.id] === undefined;
          return (
            <li key={day.id}>
              <DayCard
                day={day}
                index={index}
                total={dayTotal}
                drivingMinutes={drivingMinutes}
                undecided={undecided}
                isToday={isToday}
                onOpen={() => onOpenDay(day.id)}
              />
            </li>
          );
        })}
      </ol>

      <footer className="mt-6 flex flex-col gap-3 border-t border-border px-4 pt-4 text-sm text-text-muted">
        <p>
          Toplam ({budget.mode}):{' '}
          <PriceTag amount={budget.grandTotal} className="font-semibold text-text" /> · Atlanan:{' '}
          {euro(budget.savedTotal)}
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 self-start rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-accent"
        >
          Yazdır / PDF olarak kaydet
        </button>
      </footer>
    </div>
  );
}
