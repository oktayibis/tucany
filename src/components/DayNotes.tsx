import type { Day } from '../data/schema';
import type { Gap } from '../lib/gaps';

/**
 * The two notes worth reading before the day starts, kept above the fold in
 * `DayDetail`: what makes this day the day, and what Anne needs to know.
 * Everything more archival (`revised`, data gaps) is in `DayNotes` below.
 */
export function DayHeadNotes({ day }: { readonly day: Day }) {
  if (day.highlight === undefined && day.elderNote === undefined) return null;

  return (
    <div className="flex flex-col gap-2 text-sm">
      {day.highlight !== undefined && (
        <p className="border-l-2 border-accent-2 bg-warn-bg px-3 py-2 font-medium text-warn-text">
          ★ {day.highlight}
        </p>
      )}
      {day.elderNote !== undefined && (
        <p className="border-l-2 border-border px-3 py-2 text-text-muted">
          <span className="font-display font-semibold text-text">Anne için: </span>
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
    <div className="flex flex-col gap-3 text-sm">
      {day.revised !== undefined && (
        <p className="text-text-muted">
          <span className="font-display font-semibold text-text">Değişiklik: </span>
          {day.revised}
        </p>
      )}
      {gaps.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs text-text-muted">
          {gaps.map((gap) => (
            <li key={gap.id}>ⓘ {gap.what}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
