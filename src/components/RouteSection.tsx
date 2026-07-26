import type { Day } from '../data/schema';
import { formatDriving } from '../lib/dates';

/** "Rota/navigasyon" — the day's driving load and, on departure day, the timed schedule. */
export function RouteSection({ day }: { readonly day: Day }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
        Bugünkü sürüş:{' '}
        <strong className="font-display font-semibold">{formatDriving(day.drivingMinutes)}</strong>
      </p>
      {day.timeline !== undefined && day.timeline.length > 0 && (
        <ol className="flex flex-col gap-1 border-l-2 border-border pl-3 text-sm">
          {day.timeline.map((entry) => (
            <li key={entry.time} className="flex gap-2">
              <span className="font-display font-semibold tabular-nums text-accent">
                {entry.time}
              </span>
              <span>{entry.what}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
