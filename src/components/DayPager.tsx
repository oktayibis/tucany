import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { trip } from '../data/trip';
import type { Day } from '../data/schema';
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
import { nextStop } from '../lib/nextStop';
import { ALL_CLOSURES, ALL_GAPS } from '../state/derived';
import { useTrip } from '../state/TripContext';
import { Disclosure } from './Disclosure';
import { DayHeadNotes, DayNotes, hasTailNotes } from './DayNotes';
import { FoodSection } from './FoodSection';
import { INTENSITY_SHORT } from './IntensityMeter';
import { ModeSwitch } from './ModeSwitch';
import { NavButton } from './NavButton';
import { OptionsSection } from './OptionsSection';
import { PriceTag } from './PriceTag';
import { RouteSection } from './RouteSection';
import { ShoppingSection } from './ShoppingSection';
import { StopsSection } from './StopsSection';
import { WarningBanner } from './WarningBanner';

/**
 * All ten days as one horizontally swipeable strip, so a family standing in
 * Lucca can flick straight to tomorrow without detouring through the list.
 *
 * The strip scroll position is the source of truth for "which day is active";
 * `dayId` (the URL hash) follows it, not the other way round, except when
 * navigation comes from outside (a day-list tap, the browser back button) —
 * `lastSyncedDayId` tells those two directions apart so neither fights the
 * other into a scroll loop.
 */
export function DayPager({
  dayId,
  onBack,
  onDayChange,
}: {
  readonly dayId: string;
  readonly onBack: () => void;
  readonly onDayChange: (dayId: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSyncedDayId = useRef(dayId);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, trip.days.findIndex((day) => day.id === dayId)),
  );

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const el = trackRef.current;
    if (el === null) return;
    el.scrollTo({ left: el.clientWidth * index, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToIndex(activeIndex, false);
    // Mount only — jump to the opening day instantly, no animation on first paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dayId === lastSyncedDayId.current) return;
    const index = trip.days.findIndex((day) => day.id === dayId);
    if (index < 0) return;
    lastSyncedDayId.current = dayId;
    setActiveIndex(index);
    scrollToIndex(index, true);
  }, [dayId, scrollToIndex]);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (el === null || el.clientWidth === 0) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      const day = trip.days[index];
      if (day === undefined) return;
      setActiveIndex((current) => (current === index ? current : index));
      if (lastSyncedDayId.current !== day.id) {
        lastSyncedDayId.current = day.id;
        onDayChange(day.id);
      }
    });
  }, [onDayChange]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const step = (delta: number) => {
    const index = Math.min(trip.days.length - 1, Math.max(0, activeIndex + delta));
    scrollToIndex(index, true);
  };

  const activeDay = trip.days[activeIndex];

  return (
    <div
      // 61px matches BottomBar's own content height (see BottomBar.tsx) — its
      // safe-area padding is separate, so it's added here too, and again on
      // NextStopBar's `bottom` offset below, so neither one drifts out of
      // sync on a notched phone. If BottomBar's sizing ever changes, update
      // both.
      className="fixed inset-0 z-0 flex flex-col bg-bg"
      style={{ paddingBottom: 'calc(61px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex flex-none items-center gap-1 rounded-b-2xl bg-plate px-2 py-2 text-plate-text">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-1 px-2 font-display text-sm"
        >
          ‹ Günler
        </button>
        <span className="flex-1 truncate text-center text-xs font-medium uppercase tracking-wide">
          {activeDay !== undefined &&
            `${activeIndex + 1}. gün · ${weekdayDisplay(activeDay.weekday)} · ${formatDayMonth(activeDay.date)}`}
        </span>
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={activeIndex === 0}
          aria-label="Önceki gün"
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-plate-text/25 text-lg disabled:opacity-30"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={activeIndex === trip.days.length - 1}
          aria-label="Sonraki gün"
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-plate-text/25 text-lg disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
      >
        {trip.days.map((day) => (
          <div key={day.id} className="h-full w-full flex-none snap-start overflow-y-auto overscroll-contain">
            <DayPanel day={day} />
          </div>
        ))}
      </div>

      {activeDay !== undefined && <NextStopBar day={activeDay} />}
    </div>
  );
}

function DayPanel({ day }: { readonly day: Day }) {
  const { budget, mode, party, chosenOptions, upgrades } = useTrip();

  const dayBudget = budget.days.find((candidate) => candidate.dayId === day.id);
  const dayClosures = ALL_CLOSURES.find((candidate) => candidate.dayId === day.id);
  const dayGaps = gapsForDay(ALL_GAPS, day.id);

  const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
  const stops = effectiveStops(day, option).filter((stop) =>
    isStopVisible(stop, trip.days, chosenOptions),
  );
  const food = effectiveFood(day, option);
  const shopping = effectiveShopping(day, option);
  const drivingMinutes = effectiveDrivingMinutes(day, option);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-6 pt-4">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-2xl">
          {day.title}
          {day.starred === true && (
            <span aria-hidden="true" className="ml-2 text-accent-2">
              ★
            </span>
          )}
        </h1>
        <ModeSwitch />
        <dl className="grid grid-cols-3 rounded-2xl border border-border bg-surface-2">
          <Stat label="Sürüş" value={formatDriving(drivingMinutes)} />
          <Stat label="Tempo" value={INTENSITY_SHORT[day.intensity]} />
          <Stat label="Bütçe" value={<PriceTag amount={dayBudget?.total ?? 0} />} last />
        </dl>
        {!day.elderFriendly && (
          <p className="rounded-full border border-warn-border bg-warn-bg px-3 py-1.5 text-xs font-semibold text-warn-text">
            Anne için zorlu gün olabilir
          </p>
        )}
      </header>

      {dayClosures !== undefined && <WarningBanner warnings={day.warnings} closures={dayClosures} />}

      <DayHeadNotes day={day} />

      {day.options !== undefined && <OptionsSection day={day} />}

      {day.timeline !== undefined && day.timeline.length > 0 && (
        <section aria-labelledby={`day-timeline-${day.id}`}>
          <SectionLabel id={`day-timeline-${day.id}`}>Saat saat</SectionLabel>
          <ol className="rounded-2xl border border-border bg-surface-2">
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
        <section aria-labelledby={`day-stops-${day.id}`}>
          <SectionLabel id={`day-stops-${day.id}`}>Görülecek</SectionLabel>
          <StopsSection stops={stops} dayItems={dayBudget?.items ?? []} />
        </section>
      )}

      {food.length > 0 && (
        <section aria-labelledby={`day-food-${day.id}`}>
          <SectionLabel id={`day-food-${day.id}`}>Yemek</SectionLabel>
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
  );
}

function SectionLabel({ id, children }: { readonly id: string; readonly children: ReactNode }) {
  return (
    <h2 id={id} className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
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
      <dd className="font-display text-display-md">{value}</dd>
    </div>
  );
}

/**
 * The one always-visible action while on the road: where to go next, derived
 * from stop order and the `visited` set — never a fabricated clock time (the
 * data has none per stop). Sits directly above the global `BottomBar`, not
 * instead of it.
 */
function NextStopBar({ day }: { readonly day: Day }) {
  const { mode, party, chosenOptions, upgrades, visited } = useTrip();
  const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
  const stops = effectiveStops(day, option).filter((stop) =>
    isStopVisible(stop, trip.days, chosenOptions),
  );
  const upcoming = nextStop(stops, visited);

  if (upcoming === undefined) return null;

  const done = visited.has(upcoming.id);

  return (
    <div className="fixed inset-x-0 bottom-[calc(61px_+_env(safe-area-inset-bottom))] z-10 flex items-center gap-3 border-t border-border bg-surface-2 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent">
          {done ? 'Son durak' : 'Sıradaki'}
        </p>
        <p className="truncate font-display text-sm">{upcoming.name}</p>
      </div>
      {upcoming.nav !== undefined && (
        <NavButton place={{ name: upcoming.name, nav: upcoming.nav }} />
      )}
    </div>
  );
}
