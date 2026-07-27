import type { Day } from '../data/schema';
import { formatDayMonth, weekdayDisplay } from '../lib/dates';
import { IntensityMeter } from './IntensityMeter';
import { PriceTag } from './PriceTag';

/**
 * One day's plate in the list. A plain rounded card — the previous route-line
 * threading days together is gone; the list is just a stack of these now.
 */
export function DayCard({
  day,
  index,
  total,
  drivingMinutes,
  undecided,
  isToday,
  onOpen,
}: {
  readonly day: Day;
  readonly index: number;
  readonly total: number;
  readonly drivingMinutes: number;
  readonly undecided: boolean;
  readonly isToday: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex min-h-11 w-full flex-col gap-1.5 rounded-2xl border bg-surface-2 p-4 text-left shadow-sm transition-shadow hover:shadow-md ${
        isToday ? 'border-2 border-accent' : 'border-border'
      }`}
      aria-current={isToday ? 'date' : undefined}
    >
      <div className="flex items-center gap-2">
        <span className="font-display text-xs font-medium uppercase tracking-wide text-accent">
          {index + 1}. gün
        </span>
        <span className="text-xs uppercase tracking-wide text-text-muted">
          {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {isToday && (
            <span className="rounded-full bg-accent px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wide text-white">
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
      <h2 className="font-display text-xl">{day.title}</h2>
      {undecided && (
        <span className="self-start rounded-full bg-warn-bg px-2 py-0.5 font-body text-xs font-semibold text-warn-text">
          Karar verilmedi
        </span>
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <IntensityMeter intensity={day.intensity} />
        <span>{drivingMinutes} dk sürüş</span>
        <span className="ml-auto font-display text-lg text-accent">
          <PriceTag amount={total} />
        </span>
      </div>
    </button>
  );
}
