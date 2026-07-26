import { trip } from '../data/trip';
import { chosenOption, effectiveDrivingMinutes } from '../lib/budget';
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
  const { today, isOnTrip, activeDayId, budget, mode, party, chosenOptions, upgrades } = useTrip();

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-28">
      <header className="bg-plate px-4 pb-6 pt-7 text-plate-text shadow-md rounded-b-2xl">
        <div className="flex flex-col gap-1">
          <span className="font-display text-xs uppercase tracking-widest text-accent-2 font-bold">
            🇮🇹 Toskana Gezi Rehberi
          </span>
          <h1 className="font-display text-display-xl font-bold">{trip.trip.title}</h1>
          <p className="text-xs text-plate-text/90 flex items-center gap-1.5 mt-1 font-medium">
            <span>🏨 {trip.base.name}</span>
            <span>·</span>
            <span>{trip.trip.nights} Gece Konaklama</span>
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <NavButton place={trip.base} note="Otele Yol Tarifi Al" />
          <PhoneButton phone={trip.base.phone} />
        </div>
      </header>

      <div className="-mt-4 px-4 relative z-10">
        <ModeSwitch />
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        <PartyControl />

        {isOnTrip && (
          <button
            type="button"
            onClick={() => onOpenDay(activeDayId)}
            className="group flex min-h-12 items-center justify-between rounded-xl border-2 border-accent bg-surface-2 p-3.5 text-left shadow-md transition-all active:scale-[0.99]"
          >
            <div>
              <span className="inline-flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-accent">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Bugün Programı
              </span>
              <p className="font-display text-base font-semibold text-text">
                {trip.days.find((day) => day.id === activeDayId)?.title ?? ''}
              </p>
            </div>
            <span className="font-display text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">
              Detaylar →
            </span>
          </button>
        )}
      </div>

      <ol className="relative flex flex-col px-4 pl-10 pt-6 before:absolute before:bottom-10 before:left-[1.65rem] before:top-8 before:w-1 before:rounded-full before:bg-border before:content-['']">
        {trip.days.map((day, index) => {
          const dayTotal = budget.days.find((candidate) => candidate.dayId === day.id)?.total ?? 0;
          const isToday = day.date === today;
          const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
          const drivingMinutes = effectiveDrivingMinutes(day, option);
          const undecided = day.options !== undefined && chosenOptions[day.id] === undefined;
          return (
            <li key={day.id} className="flex flex-col gap-2">
              {index > 0 && (
                <div
                  aria-hidden="true"
                  className="flex items-center pl-1 text-xs text-text-muted"
                  style={{ height: `${1.1 + drivingMinutes * 0.035}rem` }}
                >
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface px-2.5 py-0.5 font-display text-[11px] font-semibold shadow-xs">
                    <span>🚗</span>
                    <span>{formatDriving(drivingMinutes)} sürüş</span>
                  </span>
                </div>
              )}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute left-[-1.55rem] top-4.5 h-4 w-4 rounded-full border-2 bg-surface-2 shadow-xs ${
                    day.starred === true
                      ? 'border-accent-2 bg-antimony ring-2 ring-antimony/30'
                      : isToday
                        ? 'border-accent bg-cobalt ring-4 ring-cobalt/20'
                        : 'border-accent/80'
                  }`}
                />
                <DayCard
                  day={day}
                  index={index}
                  total={dayTotal}
                  drivingMinutes={drivingMinutes}
                  undecided={undecided}
                  isToday={isToday}
                  onOpen={() => onOpenDay(day.id)}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="mt-6 flex flex-col gap-3.5 border-t border-border/80 px-4 pt-5 text-sm text-text-muted">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2 p-3.5 border border-border/60 shadow-xs">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-text-muted block">
              Genel Toplam ({budget.mode})
            </span>
            <PriceTag amount={budget.grandTotal} className="font-display text-lg font-bold text-text" />
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-safe bg-safe/10 px-2 py-1 rounded-md border border-safe/20">
              Atlanan tasarruf: {euro(budget.savedTotal)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-12 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 font-display text-sm font-bold text-accent shadow-xs active:scale-[0.99] hover:bg-surface"
        >
          📄 Yazdır / PDF Olarak Kaydet
        </button>
      </footer>
    </div>
  );
}
