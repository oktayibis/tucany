import type { Day } from '../data/schema';
import type { Gap } from '../lib/gaps';

/** "Notlar" — the elder note, plan-authored highlights, and this day's data gaps. */
export function DayNotes({ day, gaps }: { readonly day: Day; readonly gaps: readonly Gap[] }) {
  const hasNotes =
    day.elderNote !== undefined ||
    day.highlight !== undefined ||
    day.revised !== undefined ||
    gaps.length > 0;

  if (!hasNotes) return <p className="text-sm opacity-75">Bu gün için not yok.</p>;

  return (
    <div className="flex flex-col gap-3 text-sm">
      {day.highlight !== undefined && (
        <p className="rounded border p-3 font-medium">★ {day.highlight}</p>
      )}
      {day.elderNote !== undefined && (
        <p className="rounded border p-3">
          <span className="font-semibold">Anne için: </span>
          {day.elderNote}
        </p>
      )}
      {day.revised !== undefined && (
        <p className="rounded border p-3 opacity-90">
          <span className="font-semibold">Değişiklik: </span>
          {day.revised}
        </p>
      )}
      {gaps.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs opacity-75">
          {gaps.map((gap) => (
            <li key={gap.id}>ⓘ {gap.what}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
