import type { Day } from '../data/schema';
import { formatDayMonth, weekdayDisplay } from '../lib/dates';
import { IntensityMeter } from './IntensityMeter';
import { PriceTag } from './PriceTag';

/**
 * One waypoint's content on the route. The dot and connecting line live in
 * `DayList` (they're a property of the list, not of one card); this is just
 * the signage-plate card sitting next to that dot.
 */
export function DayCard({
  day,
  index,
  total,
  isToday,
  onOpen,
}: {
  readonly day: Day;
  readonly index: number;
  readonly total: number;
  readonly isToday: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex min-h-11 w-full flex-col gap-1.5 border bg-surface-2 p-3 text-left ${
        isToday ? 'border-2 border-accent' : 'border-border'
      }`}
      aria-current={isToday ? 'date' : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-xs font-medium uppercase tracking-wide text-text-muted">
          {index + 1}. gün · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </span>
        <span className="flex items-center gap-1.5">
          {isToday && (
            <span className="bg-accent px-1.5 py-0.5 font-display text-xs font-semibold uppercase tracking-wide text-white">
              Bugün
            </span>
          )}
          {day.starred === true && (
            <span aria-hidden="true" className="text-accent-2">
              ★
            </span>
          )}
        </span>
      </div>
      <h2 className="font-display text-base font-medium">{day.title}</h2>
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <IntensityMeter intensity={day.intensity} />
        <span>{day.drivingMinutes} dk sürüş</span>
        <span className="ml-auto font-display text-base font-semibold text-text">
          <PriceTag amount={total} />
        </span>
      </div>
    </button>
  );
}
