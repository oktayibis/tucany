import { useState } from 'react';
import type { Day, Stop } from '../data/schema';
import type { LineItem } from '../lib/budget';
import { euro } from '../lib/format';
import { NavButton, PhoneButton } from './NavButton';
import { StopTierBadge } from './TierBadge';
import { useTrip } from '../state/TripContext';

/**
 * "Görülecek". Splits a day's stops the way the brief specifies: `core` and
 * `optional` get full cards; `skip` and `removed` collapse into one
 * "Neden atlıyoruz" accordion — closed by default, but never hidden, because
 * the reasoning is half the value of the plan.
 */
export function StopsSection({
  day,
  dayItems,
}: {
  readonly day: Day;
  readonly dayItems: readonly LineItem[];
}) {
  const visible = day.stops.filter((stop) => stop.tier === 'core' || stop.tier === 'optional');
  const dropped = day.stops.filter((stop) => stop.tier === 'skip' || stop.tier === 'removed');
  const savedTotal = dropped.reduce((sum, stop) => sum + (stop.cost ?? 0), 0);

  return (
    <div className="flex flex-col gap-3">
      {visible.map((stop) => (
        <StopCard key={stop.id} stop={stop} item={dayItems.find((item) => item.id === stop.id)} />
      ))}
      {dropped.length > 0 && <SkipAccordion stops={dropped} savedTotal={savedTotal} />}
    </div>
  );
}

function StopCard({ stop, item }: { readonly stop: Stop; readonly item: LineItem | undefined }) {
  const { mode, upgrades, toggleUpgrade, visited } = useTrip();
  const isVisited = visited.has(stop.id);
  const canUpgrade = mode === 'mixed' && stop.tier === 'optional' && stop.cost !== undefined && stop.cost > 0;
  const isUpgraded = upgrades.includes(stop.id);

  return (
    <article className="rounded border p-3" aria-labelledby={`${stop.id}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={`${stop.id}-title`} className="font-semibold">
          {stop.name}
        </h3>
        <div className="flex items-center gap-2">
          {stop.tier === 'optional' && <StopTierBadge tier="optional" />}
          <CostLine stop={stop} item={item} />
        </div>
      </div>

      {stop.why !== undefined && <p className="mt-1 text-sm">{stop.why}</p>}

      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-75">
        {stop.durationMin !== undefined && (
          <div className="flex gap-1">
            <dt>Süre:</dt>
            <dd>{stop.durationMin} dk</dd>
          </div>
        )}
        {stop.hours !== undefined && (
          <div className="flex gap-1">
            <dt>Saatler:</dt>
            <dd>{stop.hours}</dd>
          </div>
        )}
        {stop.bestTime !== undefined && (
          <div className="flex gap-1">
            <dt>En iyi zaman:</dt>
            <dd>{stop.bestTime}</dd>
          </div>
        )}
      </dl>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <NavButton place={stop} note={stop.navNote} />
        {stop.phone !== undefined && <PhoneButton phone={stop.phone} />}
        <label className="ml-auto inline-flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isVisited}
            onChange={() => visited.toggle(stop.id)}
            className="h-5 w-5"
          />
          Gezildi
        </label>
      </div>

      {canUpgrade && (
        <button
          type="button"
          onClick={() => toggleUpgrade(stop.id)}
          className="mt-2 min-h-11 rounded border px-3 py-2 text-xs font-medium"
        >
          {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : `Karma’ya ekle (+${euro(stop.cost ?? 0)})`}
        </button>
      )}
    </article>
  );
}

function CostLine({ stop, item }: { readonly stop: Stop; readonly item: LineItem | undefined }) {
  if (item !== undefined) {
    return (
      <span className="text-sm font-semibold tabular-nums">
        {euro(item.amount)}
        {item.altApplied !== undefined && <span className="ml-1 text-xs font-normal opacity-75">(ücretsiz seçenek)</span>}
      </span>
    );
  }
  if (stop.cost === undefined || stop.cost === 0) {
    return <span className="text-sm opacity-75">Ücretsiz</span>;
  }
  return <span className="text-sm opacity-75">Bu modda dahil değil</span>;
}

function SkipAccordion({
  stops,
  savedTotal,
}: {
  readonly stops: readonly Stop[];
  readonly savedTotal: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded border">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium"
      >
        <span>
          Neden atlıyoruz? ({stops.length} durak{savedTotal > 0 ? `, ${euro(savedTotal)} tasarruf` : ''})
        </span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ul className="flex flex-col gap-3 border-t px-3 py-3">
          {stops.map((stop) => (
            <li key={stop.id}>
              <p className="text-sm font-semibold">
                {stop.name}
                {stop.cost !== undefined && stop.cost > 0 && (
                  <span className="ml-2 font-normal opacity-75">({euro(stop.cost)} tasarruf)</span>
                )}
              </p>
              <p className="text-sm">{stop.skipReason ?? stop.removedReason ?? stop.why}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
