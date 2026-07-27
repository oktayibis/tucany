import { useState } from 'react';
import type { Stop } from '../data/schema';
import type { LineItem } from '../lib/budget';
import { euro } from '../lib/format';
import { useTrip } from '../state/TripContext';
import { Disclosure } from './Disclosure';
import { Icon } from './Icon';
import { NavButton } from './NavButton';
import { StopSheet } from './StopSheet';

/**
 * The visitable part of the day, as numbered cards in visiting order (the
 * order the plan author wrote them in — the data carries no clock times for
 * stops, so nothing here invents one).
 *
 * Each card carries the two things worth doing without opening anything:
 * marking it done, and navigating to it. Tapping the card's body still opens
 * `StopSheet` for the why, the opening hours and the pork notes.
 *
 * `skip`/`removed` stops collapse into one "Neden atlıyoruz" disclosure: the
 * reasoning is half the value of the plan, it just isn't worth scrolling past
 * on the way to what you *are* doing.
 *
 * `stops` is already resolved by the caller (day + selected option merged,
 * conditional stops filtered) — this component just renders what it is given.
 */
export function StopsSection({
  stops,
  dayItems,
}: {
  readonly stops: readonly Stop[];
  readonly dayItems: readonly LineItem[];
}) {
  const { visited } = useTrip();
  const [open, setOpen] = useState<Stop | null>(null);

  const visible = stops.filter((stop) => stop.tier === 'core' || stop.tier === 'optional');
  const dropped = stops.filter((stop) => stop.tier === 'skip' || stop.tier === 'removed');
  const savedTotal = dropped.reduce((sum, stop) => sum + (stop.cost ?? 0), 0);

  return (
    <div className="flex flex-col gap-3">
      {visible.length > 0 && (
        <ol className="flex flex-col gap-2">
          {visible.map((stop, index) => (
            <li key={stop.id}>
              <StopRow
                stop={stop}
                index={index + 1}
                item={dayItems.find((candidate) => candidate.id === stop.id)}
                isVisited={visited.has(stop.id)}
                onToggleVisited={() => visited.toggle(stop.id)}
                onOpen={() => setOpen(stop)}
              />
            </li>
          ))}
        </ol>
      )}

      {dropped.length > 0 && (
        <Disclosure
          title="Neden atlıyoruz?"
          icon="piggyBank"
          count={dropped.length}
          hint={savedTotal > 0 ? `${euro(savedTotal)} tasarruf` : undefined}
        >
          <ul className="flex flex-col gap-3 rounded-xl bg-surface px-4 py-3">
            {dropped.map((stop) => (
              <li key={stop.id}>
                <p className="font-display text-body font-semibold">
                  {stop.name}
                  {stop.cost !== undefined && stop.cost > 0 && (
                    <span className="ml-2 font-body font-normal text-neutral-700">
                      ({euro(stop.cost)} tasarruf)
                    </span>
                  )}
                </p>
                <p className="text-body text-neutral-700">
                  {stop.skipReason ?? stop.removedReason ?? stop.why}
                </p>
              </li>
            ))}
          </ul>
        </Disclosure>
      )}

      {open !== null && (
        <StopSheet
          stop={open}
          item={dayItems.find((candidate) => candidate.id === open.id)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function StopRow({
  stop,
  index,
  item,
  isVisited,
  onToggleVisited,
  onOpen,
}: {
  readonly stop: Stop;
  readonly index: number;
  readonly item: LineItem | undefined;
  readonly isVisited: boolean;
  readonly onToggleVisited: () => void;
  readonly onOpen: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 ${
        isVisited ? 'bg-accent-100 ring-2 ring-inset ring-accent' : 'bg-surface'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full font-display text-lead font-semibold ${
          isVisited ? 'bg-accent text-bg' : 'bg-accent-2-300 text-accent-2-800'
        }`}
      >
        {isVisited ? '✓' : index}
      </span>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 cursor-pointer text-left">
        <span className="block font-display text-item font-semibold">{stop.name}</span>
        <span className="mt-[3px] flex flex-wrap items-center gap-2 text-meta text-neutral-700">
          {stop.rating !== undefined && (
            <span className="inline-flex items-center gap-[3px] text-accent-700">
              <Icon name="star" size={13} />
              {stop.rating.toFixed(1)}
            </span>
          )}
          <span>{stopMeta(stop, item)}</span>
          {stop.badge !== undefined && <span className="tag tag-accent-2">{stop.badge}</span>}
        </span>
      </button>

      <div className="flex flex-none flex-col items-stretch gap-[5px]">
        <button
          type="button"
          onClick={onToggleVisited}
          aria-pressed={isVisited}
          className={`btn min-h-[36px] whitespace-nowrap px-3 text-meta ${
            isVisited
              ? 'border-accent-2-600 bg-accent-2-600 text-bg'
              : 'border-neutral-400 text-neutral-700'
          }`}
        >
          Gezildi
        </button>
        {stop.nav !== undefined && (
          <NavButton
            place={{ name: stop.name, nav: stop.nav }}
            iconSize={15}
            className="min-h-[36px] px-3"
          />
        )}
      </div>
    </div>
  );
}

/** The one muted line under a stop's name: duration, timing hint, then cost. */
function stopMeta(stop: Stop, item: LineItem | undefined): string {
  const cost =
    item !== undefined
      ? euro(item.amount)
      : stop.cost === undefined || stop.cost === 0
        ? 'Ücretsiz'
        : 'dahil değil';
  return [
    stop.durationMin === undefined ? undefined : `${stop.durationMin} dk`,
    stop.bestTime === undefined ? undefined : `en iyi ${stop.bestTime}`,
    stop.tier === 'optional' ? 'opsiyonel' : undefined,
    cost,
  ]
    .filter((part): part is string => part !== undefined)
    .join(' · ');
}
