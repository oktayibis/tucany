import type { Day } from '../data/schema';
import { formatDayMonth, formatDriving, weekdayDisplay } from '../lib/dates';
import { Icon } from './Icon';
import { INTENSITY_SHORT } from './IntensityMeter';
import { PriceTag } from './PriceTag';

/**
 * One day's card in the list: kicker row, title, then a single meta line of
 * tempo, driving time and the day's total. Transcribed from the mockup, which
 * replaced the old five-bar tempo meter with a plain worded label — at a
 * glance "Orta tempo" needs no decoding, and it leaves room on the row for the
 * driving time the bars used to crowd out.
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
      aria-current={isToday ? 'date' : undefined}
      className={`card elev-sm w-full cursor-pointer p-4 text-left transition-shadow hover:shadow-md ${
        isToday ? 'ring-2 ring-accent' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="card-kicker">{index + 1}. Gün</span>
        <span className="text-label uppercase tracking-[0.08em] text-neutral-600">
          {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </span>
        <span className="ml-auto flex items-center gap-1">
          {isToday && <span className="tag tag-accent">bugün</span>}
          {day.starred === true && <span className="tag tag-accent-2">öne çıkan</span>}
        </span>
      </div>

      <div className="card-title text-display-lg">{day.title}</div>

      {undecided && (
        <span className="tag tag-neutral self-start border border-accent-300">Karar verilmedi</span>
      )}

      <div className="flex items-center gap-3 text-note text-neutral-700">
        <span className="inline-flex items-center gap-[5px]">
          <Icon name="gauge" size={15} />
          {INTENSITY_SHORT[day.intensity]} tempo
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <Icon name="car" size={15} />
          {formatDriving(drivingMinutes)}
        </span>
        <span className="ml-auto font-display text-price font-semibold text-accent-700">
          <PriceTag amount={total} />
        </span>
      </div>
    </button>
  );
}
