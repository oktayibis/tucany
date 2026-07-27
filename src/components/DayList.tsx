import { trip } from '../data/trip';
import { chosenOption, effectiveDrivingMinutes } from '../lib/budget';
import { formatDateRange } from '../lib/dates';
import { euro } from '../lib/format';
import { MODE_INFO } from '../lib/modes';
import { PriceTag } from './PriceTag';
import { useTrip } from '../state/TripContext';
import { DayCard } from './DayCard';
import { Disclosure } from './Disclosure';
import { HotelVenuesSection } from './HotelVenuesSection';
import { ModeSwitch } from './ModeSwitch';
import { PartyControl } from './PartyControl';
import { NavButton, PhoneButton } from './NavButton';

/**
 * Home. A warm header skirt over a plain stack of day cards — each day sits on
 * its own, total on its right, with no line connecting them.
 *
 * This is a scroll container, not a scrolling page: `App` owns the viewport
 * height and this fills the space left between the header and the tab bar.
 */
export function DayList({ onOpenDay }: { readonly onOpenDay: (dayId: string) => void }) {
  const { today, isOnTrip, activeDayId, budget, mode, party, chosenOptions, upgrades } = useTrip();
  const activeDay = trip.days.find((day) => day.id === activeDayId);

  return (
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <header className="rounded-b-2xl bg-plate px-4 pb-6 pt-6 text-plate-text">
        <span className="tag tag-accent">
          Toskana · {formatDateRange(trip.trip.startDate, trip.trip.endDate)}
        </span>
        <h1 className="mb-2 mt-3 font-display text-hero font-semibold tracking-[-0.02em]">
          {trip.trip.title}
        </h1>
        <p className="text-lead text-accent-800">
          {trip.base.name} · {trip.trip.nights} gece
          <br />
          {trip.base.address}
        </p>
        <div className="mt-4 flex items-stretch gap-2">
          <NavButton
            place={trip.base}
            label="Otele yol tarifi"
            alt
            iconSize={18}
            className="min-h-[52px] flex-1 text-lead"
          />
          <PhoneButton phone={trip.base.phone} className="min-h-[52px] w-[64px]" />
        </div>
      </header>

      {/*
       * Not in the mockup, which shows the mode switch only inside a day panel.
       * Kept here deliberately: the "Toplam" figure directly below reacts to
       * both of these, and burying them one screen deep would mean you cannot
       * see a mode change and its effect on the trip total at the same time.
       * Collapsed by default so the day list still opens as the mockup's.
       */}
      <div className="px-4 pt-4">
        <Disclosure title="Bütçe modu ve kişi sayısı" hint={MODE_INFO[mode].label}>
          <div className="flex flex-col gap-4">
            <ModeSwitch />
            <PartyControl />
          </div>
        </Disclosure>
      </div>

      {isOnTrip && activeDay !== undefined && (
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={() => onOpenDay(activeDayId)}
            className="card w-full cursor-pointer gap-1 bg-accent-100 p-4 text-left ring-2 ring-accent"
          >
            <span className="card-kicker">Bugün</span>
            <span className="card-title text-display-md">{activeDay.title}</span>
          </button>
        </div>
      )}

      <div className="px-4 pt-3">
        <HotelVenuesSection />
      </div>

      <div className="flex items-baseline justify-between px-4 pb-3 pt-6">
        <h2 className="section-label">Günler</h2>
        <p className="text-note text-neutral-700">
          Toplam{' '}
          <PriceTag
            amount={budget.grandTotal}
            className="font-display text-lead font-semibold text-text"
          />
        </p>
      </div>

      <ol className="flex flex-col gap-2 px-4 pb-8">
        {trip.days.map((day, index) => {
          const dayTotal = budget.days.find((candidate) => candidate.dayId === day.id)?.total ?? 0;
          const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
          return (
            <li key={day.id}>
              <DayCard
                day={day}
                index={index}
                total={dayTotal}
                drivingMinutes={effectiveDrivingMinutes(day, option)}
                undecided={day.options !== undefined && chosenOptions[day.id] === undefined}
                isToday={day.date === today}
                onOpen={() => onOpenDay(day.id)}
              />
            </li>
          );
        })}
      </ol>

      <footer className="flex flex-col items-start gap-3 px-4 pb-8 text-note text-neutral-700">
        <p>Atlanan: {euro(budget.savedTotal)}</p>
        <button type="button" onClick={() => window.print()} className="btn btn-secondary min-h-[44px]">
          Yazdır / PDF olarak kaydet
        </button>
      </footer>
    </div>
  );
}
