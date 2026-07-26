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
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <div className="sticky top-0 z-20 -mx-4 flex items-center gap-2 border-b border-border/80 bg-surface-2/95 px-4 py-2.5 shadow-xs backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex min-h-10 items-center gap-1 rounded-lg bg-surface px-3 py-1.5 font-display text-xs font-bold text-accent border border-border/60 active:scale-95 transition-transform"
        >
          ← Günler
        </button>
        <span className="truncate font-display text-xs font-semibold uppercase tracking-wider text-text-muted">
          {index + 1}. GÜN · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </span>
        {isToday && (
          <span className="ml-auto shrink-0 rounded bg-accent px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
            Bugün
          </span>
        )}
      </div>

      <header className="pt-4">
        <h1 className="text-display-xl font-bold text-text flex items-center gap-2">
          <span>{day.title}</span>
          {day.starred === true && (
            <span aria-hidden="true" className="text-accent-2" title="Özel Gün">
              ★
            </span>
          )}
        </h1>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <Stat icon="🚘" label="Sürüş" value={formatDriving(drivingMinutes)} />
          <Stat icon="⚡" label="Tempo" value={INTENSITY_SHORT[day.intensity]} />
          <Stat icon="💰" label="Bütçe" value={<PriceTag amount={dayBudget?.total ?? 0} />} />
        </dl>

        {!day.elderFriendly && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-warn-border bg-warn-bg px-3.5 py-2 text-xs font-bold text-warn-text shadow-xs">
            <span aria-hidden="true" className="text-sm">⚠️</span>
            <span>Anne için yokuşlu/merdivenli zorlu gün olabilir</span>
          </div>
        )}
      </header>

      <div className="mt-5 flex flex-col gap-4">
        {dayClosures !== undefined && (
          <WarningBanner warnings={day.warnings} closures={dayClosures} />
        )}

        <DayHeadNotes day={day} />

        {day.options !== undefined && <OptionsSection day={day} />}

        {day.timeline !== undefined && day.timeline.length > 0 && (
          <section aria-labelledby="day-timeline">
            <SectionLabel id="day-timeline" icon="🕒">Saat saat plan</SectionLabel>
            <ol className="rounded-xl border border-border/80 bg-surface-2 shadow-xs divide-y divide-border/40 overflow-hidden">
              {day.timeline.map((entry) => (
                <li
                  key={entry.time}
                  className="flex gap-3 px-3.5 py-2.5 text-sm"
                >
                  <span className="font-display font-bold tabular-nums text-accent bg-surface px-2 py-0.5 rounded border border-border/60 text-xs self-start">
                    {entry.time}
                  </span>
                  <span className="text-text font-medium leading-snug">{entry.what}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {stops.length > 0 && (
          <section aria-labelledby="day-stops">
            <SectionLabel id="day-stops" icon="📍">Görülecek yerler</SectionLabel>
            <StopsSection stops={stops} dayItems={dayBudget?.items ?? []} />
          </section>
        )}

        {food.length > 0 && (
          <section aria-labelledby="day-food">
            <SectionLabel id="day-food" icon="🍝">Yemek ve mola</SectionLabel>
            <FoodSection dayId={day.id} food={food} />
          </section>
        )}

        <div className="flex flex-col gap-2.5 pt-2">
          {shopping.length > 0 && (
            <Disclosure title="Alışveriş Durakları" count={shopping.length}>
              <ShoppingSection shopping={shopping} />
            </Disclosure>
          )}
          <Disclosure title="Rota & Detaylı Sürüş" hint={formatDriving(drivingMinutes)}>
            <RouteSection day={day} />
          </Disclosure>
          {hasTailNotes(day, dayGaps) && (
            <Disclosure title="Günlük İpuçları & Notlar">
              <DayNotes day={day} gaps={dayGaps} />
            </Disclosure>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  id,
  icon,
  children,
}: {
  readonly id: string;
  readonly icon?: string;
  readonly children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mb-2 flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-text-muted"
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </h2>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  readonly icon: string;
  readonly label: string;
  readonly value: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border/80 bg-surface-2 p-2.5 shadow-xs">
      <dt className="flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-wider text-text-muted">
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </dt>
      <dd className="mt-1 font-display text-base font-bold text-text truncate">{value}</dd>
    </div>
  );
}

export function dayRoute(dayId: string): Route {
  return { name: 'day', dayId };
}
