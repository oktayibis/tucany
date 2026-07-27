import type { DayClosures } from '../lib/closures';
import { weekdayDisplay } from '../lib/dates';
import { Icon } from './Icon';

/**
 * The mockup's "Dikkat" panel: the day's own `warnings[]` plus anything the
 * closure guard derived from cross-referencing today's weekday against the
 * closures table. Both are shown the same way — this is not decoration, it's
 * the reason a plan can be trusted at all.
 */
export function WarningBanner({
  warnings,
  closures,
}: {
  readonly warnings: readonly string[];
  readonly closures: DayClosures;
}) {
  // `closures.weekday` is the schema's ASCII enum ("Carsamba"), which is fine
  // for comparisons but must never reach the screen — `weekdayDisplay` is the
  // accented form ("Çarşamba").
  const weekday = weekdayDisplay(closures.weekday);
  const items = [
    ...warnings,
    ...closures.blocking.map((thing) =>
      thing.note === undefined
        ? `${thing.name} bugün (${weekday}) kapalı.`
        : `${thing.name} bugün (${weekday}) kapalı. ${thing.note}`,
    ),
  ];

  if (items.length === 0) return null;

  return (
    <div role="alert" className="rounded-xl bg-accent-100 px-4 py-3">
      <p className="mb-2 text-micro uppercase tracking-[0.1em] text-accent-700">Dikkat</p>
      <ul className="flex flex-col gap-2">
        {items.map((text) => (
          <li key={text} className="flex items-start gap-[10px] text-body text-accent-900">
            <Icon name="alert" size={18} className="mt-[2px] text-accent-700" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
