import type { Day } from '../data/schema';
import type { Gap } from '../lib/gaps';
import { Icon } from './Icon';

/**
 * The two notes worth reading before the day starts, kept above the fold in
 * the day panel: what makes this day the day (the mockup's olive piggy-bank
 * panel — it is nearly always about money saved), and what Anne needs to know.
 * Everything more archival (`revised`, data gaps) is in `DayNotes` below.
 */
export function DayHeadNotes({ day }: { readonly day: Day }) {
  if (day.highlight === undefined && day.elderNote === undefined) return null;

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      {day.highlight !== undefined && (
        <p className="flex items-start gap-[10px] rounded-xl bg-accent-2-100 px-4 py-3 text-body text-accent-2-800">
          <Icon name="piggyBank" size={20} className="mt-[1px]" />
          <span>{day.highlight}</span>
        </p>
      )}
      {day.elderNote !== undefined && (
        <p className="rounded-xl bg-surface px-4 py-3 text-body">
          <span className="font-display font-semibold text-accent-2-700">Anne için: </span>
          {day.elderNote}
        </p>
      )}
    </div>
  );
}

/** Returns whether `DayNotes` would render anything, so the caller can skip the disclosure. */
export function hasTailNotes(day: Day, gaps: readonly Gap[]): boolean {
  return day.revised !== undefined || gaps.length > 0;
}

/** The archival half: a change already applied to the plan, and this day's data gaps. */
export function DayNotes({ day, gaps }: { readonly day: Day; readonly gaps: readonly Gap[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface px-4 py-3 text-body">
      {day.revised !== undefined && (
        <p className="text-neutral-700">
          <span className="font-display font-semibold text-text">Değişiklik: </span>
          {day.revised}
        </p>
      )}
      {gaps.length > 0 && (
        <ul className="flex flex-col gap-1 text-meta text-neutral-700">
          {gaps.map((gap) => (
            <li key={gap.id}>ⓘ {gap.what}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
