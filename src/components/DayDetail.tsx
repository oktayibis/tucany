import type { ReactNode } from 'react';
import { trip } from '../data/trip';
import {
  chosenOption,
  effectiveDrivingMinutes,
  effectiveFood,
  effectiveShopping,
  effectiveStops,
  isStopVisible,
} from '../lib/budget';
import { formatDayMonth, formatDriving, weekdayDisplay } from '../lib/dates';
import { gapsForDay } from '../lib/gaps';
import { ALL_CLOSURES, ALL_GAPS } from '../state/derived';
import { useTrip } from '../state/TripContext';
import type { Route } from '../hooks/useRoute';
import { Disclosure } from './Disclosure';
import { DayHeadNotes, DayNotes, hasTailNotes } from './DayNotes';
import { FoodSection } from './FoodSection';
import { INTENSITY_SHORT } from './IntensityMeter';
import { OptionsSection } from './OptionsSection';
import { PriceTag } from './PriceTag';
import { RouteSection } from './RouteSection';
import { ShoppingSection } from './ShoppingSection';
import { StopsSection } from './StopsSection';
import { WarningBanner } from './WarningBanner';

/**
 * One day, ordered by what the family needs while standing in it.
 *
 * The page is deliberately shallow: a header that answers "how hard, how far,
 * how much", the decision if the day has one, then the day itself as two runs
 * of tappable rows (stops, then meals). Everything else — driving legs, the
 * hotel, shopping, skipped stops, archival notes — is a closed disclosure at
 * the bottom. Per-place depth lives in the sheet a row opens, not on the page.
 */
export function DayDetail({
  dayId,
  onBack,
}: {
  readonly dayId: string;
  readonly onBack: () => void;
}) {
  const { today, budget, mode, party, chosenOptions, upgrades } = useTrip();
  const index = trip.days.findIndex((day) => day.id === dayId);
  const day = trip.days[index];

  if (day === undefined) {
    return (
      <div className="p-4">
        <p>Bu gün bulunamadı.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 min-h-11 border border-border bg-surface-2 px-3 py-2"
        >
          Güne dön
        </button>
      </div>
    );
  }

  const dayBudget = budget.days.find((candidate) => candidate.dayId === dayId);
  const dayClosures = ALL_CLOSURES.find((candidate) => candidate.dayId === dayId);
  const dayGaps = gapsForDay(ALL_GAPS, dayId);
  const isToday = day.date === today;

  const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
  const stops = effectiveStops(day, option).filter((stop) =>
    isStopVisible(stop, trip.days, chosenOptions),
  );
  const food = effectiveFood(day, option);
  const shopping = effectiveShopping(day, option);
  const drivingMinutes = effectiveDrivingMinutes(day, option);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24">
      <div className="sticky top-0 z-20 -mx-4 flex items-center gap-2 border-b border-border bg-bg/95 px-4 py-2 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 inline-flex min-h-11 items-center px-2 font-display text-sm font-semibold text-accent"
        >
          ← Günler
        </button>
        <span className="truncate font-display text-xs font-medium uppercase tracking-wide text-text-muted">
          {index + 1}. gün · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </span>
        {isToday && (
          <span className="ml-auto shrink-0 bg-accent px-1.5 py-0.5 font-display text-xs font-semibold uppercase text-white">
            Bugün
          </span>
        )}
      </div>

      <header className="pt-4">
        <h1 className="text-display-xl font-semibold">
          {day.title}
          {day.starred === true && (
            <span aria-hidden="true" className="ml-2 text-accent-2">
              ★
            </span>
          )}
        </h1>
        <dl className="mt-3 grid grid-cols-3 border border-border bg-surface-2">
          <Stat label="Sürüş" value={formatDriving(drivingMinutes)} />
          <Stat label="Tempo" value={INTENSITY_SHORT[day.intensity]} />
          <Stat label="Bütçe" value={<PriceTag amount={dayBudget?.total ?? 0} />} last />
        </dl>
        {!day.elderFriendly && (
          <p className="mt-2 border border-warn-border bg-warn-bg px-3 py-1.5 text-xs font-semibold text-warn-text">
            Anne için zorlu gün olabilir
          </p>
        )}
      </header>

      <div className="mt-4 flex flex-col gap-4">
        {dayClosures !== undefined && (
          <WarningBanner warnings={day.warnings} closures={dayClosures} />
        )}

        <DayHeadNotes day={day} />

        {day.options !== undefined && <OptionsSection day={day} />}

        {day.timeline !== undefined && day.timeline.length > 0 && (
          <section aria-labelledby="day-timeline">
            <SectionLabel id="day-timeline">Saat saat</SectionLabel>
            <ol className="border border-border bg-surface-2">
              {day.timeline.map((entry) => (
                <li
                  key={entry.time}
                  className="flex gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0"
                >
                  <span className="font-display font-semibold tabular-nums text-accent">
                    {entry.time}
                  </span>
                  <span>{entry.what}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {stops.length > 0 && (
          <section aria-labelledby="day-stops">
            <SectionLabel id="day-stops">Görülecek</SectionLabel>
            <StopsSection stops={stops} dayItems={dayBudget?.items ?? []} />
          </section>
        )}

        {food.length > 0 && (
          <section aria-labelledby="day-food">
            <SectionLabel id="day-food">Yemek</SectionLabel>
            <FoodSection dayId={day.id} food={food} />
          </section>
        )}

        <div className="flex flex-col gap-2">
          {shopping.length > 0 && (
            <Disclosure title="Alışveriş" count={shopping.length}>
              <ShoppingSection shopping={shopping} />
            </Disclosure>
          )}
          <Disclosure title="Rota & sürüş" hint={formatDriving(drivingMinutes)}>
            <RouteSection day={day} />
          </Disclosure>
          {hasTailNotes(day, dayGaps) && (
            <Disclosure title="Notlar">
              <DayNotes day={day} gaps={dayGaps} />
            </Disclosure>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ id, children }: { readonly id: string; readonly children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-text-muted"
    >
      {children}
    </h2>
  );
}

function Stat({
  label,
  value,
  last = false,
}: {
  readonly label: string;
  readonly value: ReactNode;
  readonly last?: boolean;
}) {
  return (
    <div className={`px-3 py-2 ${last ? '' : 'border-r border-border'}`}>
      <dt className="font-display text-xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="font-display text-display-md font-semibold">{value}</dd>
    </div>
  );
}

export function dayRoute(dayId: string): Route {
  return { name: 'day', dayId };
}
