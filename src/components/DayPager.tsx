import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { trip } from '../data/trip';
import type { Day, Stop } from '../data/schema';
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
import { Icon } from './Icon';
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
    /*
     * Three plain flex children — header, swipe track, next-stop bar — inside
     * the app frame's fixed height. Nothing here is `position: fixed` any more:
     * the previous version had to offset the next-stop bar by a hand-copied
     * 61px + safe-area to clear the tab bar, and the two drifted apart the
     * moment either changed. Normal flow now does that for free.
     */
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-none items-center gap-2 bg-plate px-3 py-2 text-plate-text">
        <button type="button" onClick={onBack} className="btn btn-ghost min-h-[44px] text-accent-800">
          <Icon name="chevronLeft" size={18} />
          Günler
        </button>
        <span className="flex-1 truncate text-center text-label uppercase tracking-[0.08em] text-accent-800">
          {activeDay !== undefined &&
            `${activeIndex + 1}. gün · ${weekdayDisplay(activeDay.weekday)} ${formatDayMonth(activeDay.date)}`}
        </span>
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={activeIndex === 0}
          aria-label="Önceki gün"
          className="btn btn-secondary btn-icon h-[44px] w-[44px] flex-none border-accent-700 text-accent-800 disabled:opacity-30"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={activeIndex === trip.days.length - 1}
          aria-label="Sonraki gün"
          className="btn btn-secondary btn-icon h-[44px] w-[44px] flex-none border-accent-700 text-accent-800 disabled:opacity-30"
        >
          <Icon name="chevronRight" size={20} />
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory scroll-smooth overflow-x-auto overflow-y-hidden overscroll-x-contain"
      >
        {trip.days.map((day) => (
          <div
            key={day.id}
            className="no-scrollbar h-full w-full flex-none snap-start overflow-y-auto overscroll-contain pb-8"
          >
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
    <div className="flex flex-col">
      <header className="px-4 pt-4">
        <h1 className="font-display text-display-xl font-semibold">
          {day.title}
          {day.starred === true && <span className="tag tag-accent-2 ml-2 align-middle">öne çıkan</span>}
        </h1>
        <div className="mt-4">
          <ModeSwitch />
        </div>
      </header>

      <dl className="grid grid-cols-3 gap-2 px-4 pt-4">
        <Stat label="Sürüş" value={formatDriving(drivingMinutes)} />
        <Stat label="Tempo" value={INTENSITY_SHORT[day.intensity]} />
        <Stat label="Bütçe" value={<PriceTag amount={dayBudget?.total ?? 0} />} accent />
      </dl>

      <DayHeadNotes day={day} />

      {dayClosures !== undefined && (
        <div className="px-4 pt-3">
          <WarningBanner warnings={day.warnings} closures={dayClosures} />
        </div>
      )}

      {!day.elderFriendly && (
        <div className="px-4 pt-3">
          <p className="rounded-xl bg-warn-bg px-4 py-3 text-body text-warn-text">
            <span className="font-display font-semibold">Anne için: </span>
            bu gün zorlu olabilir — merdiven, dik yokuş veya uzun sıcak yürüyüş var.
          </p>
        </div>
      )}

      {day.options !== undefined && (
        <div className="px-4 pt-6">
          <OptionsSection day={day} />
        </div>
      )}

      {day.timeline !== undefined && day.timeline.length > 0 && (
        <section aria-labelledby={`day-timeline-${day.id}`} className="px-4 pt-6">
          <SectionLabel id={`day-timeline-${day.id}`}>Saat saat</SectionLabel>
          <ol className="flex flex-col gap-2">
            {day.timeline.map((entry) => (
              <li
                key={entry.time}
                className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 text-body"
              >
                <span className="font-display font-semibold tabular-nums text-accent-700">
                  {entry.time}
                </span>
                <span>{entry.what}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {stops.length > 0 && (
        <section aria-labelledby={`day-stops-${day.id}`} className="px-4 pt-6">
          <SectionLabel id={`day-stops-${day.id}`}>Görülecek yerler</SectionLabel>
          <StopsSection stops={stops} dayItems={dayBudget?.items ?? []} />
        </section>
      )}

      {food.length > 0 && (
        <section aria-labelledby={`day-food-${day.id}`} className="px-4 pt-6">
          <SectionLabel id={`day-food-${day.id}`}>Yemek ve mola</SectionLabel>
          <FoodSection dayId={day.id} food={food} />
        </section>
      )}

      {shopping.length > 0 && (
        <section aria-labelledby={`day-shopping-${day.id}`} className="px-4 pt-6">
          <SectionLabel id={`day-shopping-${day.id}`}>Alışveriş</SectionLabel>
          <ShoppingSection shopping={shopping} />
        </section>
      )}

      <div className="flex flex-col gap-2 px-4 pt-6">
        <Disclosure title="Rota & sürüş" icon="route" hint={formatDriving(drivingMinutes)}>
          <RouteSection day={day} />
        </Disclosure>
        {hasTailNotes(day, dayGaps) && (
          <Disclosure title="Notlar" icon="lightbulb">
            <DayNotes day={day} gaps={dayGaps} />
          </Disclosure>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ id, children }: { readonly id: string; readonly children: ReactNode }) {
  return (
    <h2 id={id} className="section-label mb-3">
      {children}
    </h2>
  );
}

/**
 * One cell of the three-up strip under the day title. The budget cell is
 * tinted rather than neutral — it is the one figure the mode switch above it
 * changes, so the mockup marks it as the live number of the three.
 */
function Stat({
  label,
  value,
  accent = false,
}: {
  readonly label: string;
  readonly value: ReactNode;
  readonly accent?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${accent ? 'bg-accent-100' : 'bg-surface'}`}>
      <dt
        className={`text-micro uppercase tracking-[0.1em] ${accent ? 'text-accent-700' : 'text-neutral-700'}`}
      >
        {label}
      </dt>
      <dd
        className={`mt-1 font-display text-item font-semibold ${accent ? 'text-accent-800' : ''}`}
      >
        {value}
      </dd>
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
  const remaining = stops.filter((stop) => !visited.has(stop.id)).length;

  return (
    <div className="elev-lg flex flex-none items-center gap-3 rounded-t-xl bg-surface px-4 pb-[calc(13.2px+env(safe-area-inset-bottom))] pt-3">
      <div className="min-w-0 flex-1">
        <p className="text-micro uppercase tracking-[0.1em] text-accent-700">
          {done ? 'Son durak' : 'Sıradaki'}
        </p>
        <p className="mt-[3px] truncate font-display text-item font-semibold">{upcoming.name}</p>
        <p className="mt-[2px] truncate text-meta text-neutral-700">{stopHint(upcoming, done, remaining)}</p>
      </div>
      {upcoming.nav !== undefined && (
        <NavButton
          place={{ name: upcoming.name, nav: upcoming.nav }}
          label="Yol tarifi"
          iconSize={18}
          className="min-h-[54px] flex-none px-4 text-lead"
        />
      )}
    </div>
  );
}

/**
 * The bar's third line. Everything here is read off the stop and the `visited`
 * set — the schema carries no per-stop clock time, so this never implies one:
 * how long the stop takes and how many are still ahead, not when to be there.
 */
function stopHint(stop: Stop, done: boolean, remaining: number): string {
  const parts = [
    stop.durationMin === undefined ? undefined : `${stop.durationMin} dk`,
    stop.bestTime === undefined ? undefined : `en iyi ${stop.bestTime}`,
    done ? 'hepsi gezildi' : remaining > 1 ? `${remaining} durak kaldı` : 'son durak',
  ].filter((part): part is string => part !== undefined);
  return parts.join(' · ');
}
