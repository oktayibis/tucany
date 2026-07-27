import type { DayClosures } from '../lib/closures';

/**
 * Surfaces the day's own `warnings[]` plus anything the closure guard derived
 * from cross-referencing today's weekday against the closures table. Both are
 * shown the same way — this is not decoration, it's the reason a plan can be
 * trusted at all.
 */
export function WarningBanner({
  warnings,
  closures,
}: {
  readonly warnings: readonly string[];
  readonly closures: DayClosures;
}) {
  const items = [
    ...warnings,
    ...closures.blocking.map((thing) =>
      thing.note === undefined
        ? `${thing.name} bugün (${closures.weekday}) kapalı.`
        : `${thing.name} bugün (${closures.weekday}) kapalı. ${thing.note}`,
    ),
  ];

  if (items.length === 0) return null;

  return (
    <div role="alert" className="rounded-2xl border-2 border-warn-border bg-warn-bg p-3 text-warn-text">
      <ul className="flex flex-col gap-1.5 text-sm font-semibold">
        {items.map((text) => (
          <li key={text} className="flex gap-2">
            <span aria-hidden="true">⚠</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
