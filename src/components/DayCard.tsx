import type { Day } from '../data/schema';
import { euro } from '../lib/format';
import { formatDayMonth, weekdayDisplay } from '../lib/dates';
import { IntensityMeter } from './IntensityMeter';

/**
 * One waypoint on the route. Deliberately plain markup at this stage — the
 * step-5 design pass turns this list into the continuous-line "route"
 * visual; what matters now is that every required field is present and the
 * card is a real link target.
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
      className={`flex min-h-11 w-full flex-col gap-1 rounded border p-3 text-left ${
        isToday ? 'border-2' : ''
      }`}
      aria-current={isToday ? 'date' : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs opacity-75">
          {index + 1}. gün · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </span>
        {isToday && (
          <span className="rounded bg-current/10 px-1.5 py-0.5 text-xs font-semibold">Bugün</span>
        )}
        {day.starred === true && <span aria-hidden="true">★</span>}
      </div>
      <h2 className="font-bold">{day.title}</h2>
      <div className="flex flex-wrap items-center gap-3 text-sm opacity-75">
        <IntensityMeter intensity={day.intensity} />
        <span>{day.drivingMinutes} dk sürüş</span>
        <span className="ml-auto font-semibold tabular-nums">{euro(total)}</span>
      </div>
    </button>
  );
}
