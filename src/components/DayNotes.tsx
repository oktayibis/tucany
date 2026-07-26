import type { Day } from '../data/schema';
import type { Gap } from '../lib/gaps';

/** "Notlar" — the elder note, plan-authored highlights, and this day's data gaps. */
export function DayNotes({ day, gaps }: { readonly day: Day; readonly gaps: readonly Gap[] }) {
  const hasNotes =
    day.elderNote !== undefined ||
    day.highlight !== undefined ||
    day.revised !== undefined ||
    gaps.length > 0;

  if (!hasNotes) return <p className="text-sm text-text-muted">Bu gün için not yok.</p>;

  return (
    <div className="flex flex-col gap-3 text-sm">
      {day.highlight !== undefined && (
        <p className="border border-accent-2 bg-warn-bg p-3 font-medium text-warn-text">
          ★ {day.highlight}
        </p>
      )}
      {day.elderNote !== undefined && (
        <p className="border border-border bg-surface-2 p-3">
          <span className="font-display font-semibold">Anne için: </span>
          {day.elderNote}
        </p>
      )}
      {day.revised !== undefined && (
        <p className="border border-dashed border-border bg-surface p-3 text-text-muted">
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
