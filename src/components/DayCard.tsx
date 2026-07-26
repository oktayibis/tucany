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
      className={`group flex min-h-12 w-full flex-col gap-2 rounded-xl border bg-surface-2 p-3.5 text-left shadow-xs transition-all active:scale-[0.99] ${
        isToday
          ? 'border-2 border-accent bg-surface-2 ring-2 ring-accent/20'
          : 'border-border/80 hover:border-accent/40'
      }`}
      aria-current={isToday ? 'date' : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-wider text-text-muted">
          <span className="rounded bg-surface px-1.5 py-0.5 font-bold text-text border border-border/60">
            {index + 1}. GÜN
          </span>
          <span>·</span>
          <span>{weekdayDisplay(day.weekday)}</span>
          <span>·</span>
          <span>{formatDayMonth(day.date)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          {isToday && (
            <span className="rounded bg-accent px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
              Bugün
            </span>
          )}
          {day.starred === true && (
            <span aria-hidden="true" className="text-base text-accent-2" title="Özel Vurgulanan Gün">
              ★
            </span>
          )}
        </span>
      </div>

      <h2 className="font-display text-lg font-semibold text-text group-hover:text-accent transition-colors">
        {day.title}
      </h2>

      {undecided && (
        <span className="self-start rounded-md border border-warn-border bg-warn-bg px-2 py-0.5 font-body text-xs font-bold text-warn-text">
          ⚠️ Karar verilmedi
        </span>
      )}

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-text-muted border-t border-border/40 pt-2.5">
        <div className="flex items-center gap-3">
          <IntensityMeter intensity={day.intensity} />
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">🚘</span>
            <span>{drivingMinutes} dk</span>
          </span>
        </div>
        <span className="font-display text-base font-bold text-text bg-surface px-2 py-0.5 rounded-md border border-border/60">
          <PriceTag amount={total} />
        </span>
      </div>
    </button>
  );
}
