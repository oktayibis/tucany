import { useState } from 'react';
import type { Stop } from '../data/schema';
import type { LineItem } from '../lib/budget';
import { euro } from '../lib/format';
import { NavButton, PhoneButton } from './NavButton';
import { PriceTag } from './PriceTag';
import { StopTierBadge } from './TierBadge';
import { useTrip } from '../state/TripContext';

import { RatingBadge } from './RatingBadge';

/**
 * "Görülecek". Splits a day's stops the way the brief specifies: `core` and
 * `optional` get full cards; `skip` and `removed` collapse into one
 * "Neden atlıyoruz" accordion — closed by default, but never hidden, because
 * the reasoning is half the value of the plan.
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
  const visible = stops.filter((stop) => stop.tier === 'core' || stop.tier === 'optional');
  const dropped = stops.filter((stop) => stop.tier === 'skip' || stop.tier === 'removed');
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
  const canUpgrade =
    mode === 'mixed' && stop.tier === 'optional' && stop.cost !== undefined && stop.cost > 0;
  const isUpgraded = upgrades.includes(stop.id);

  return (
    <article className="border border-border bg-surface-2 p-3" aria-labelledby={`${stop.id}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 id={`${stop.id}-title`} className="font-display text-base font-medium">
            {stop.name}
          </h3>
          <RatingBadge rating={stop.rating} />
        </div>
        <div className="flex items-center gap-2">
          {stop.badge !== undefined && (
            <span className="bg-accent-2/20 px-1.5 py-0.5 font-body text-xs font-semibold text-accent-2">
              {stop.badge}
            </span>
          )}
          {stop.tier === 'optional' && <StopTierBadge tier="optional" />}
          <CostLine stop={stop} item={item} />
        </div>
      </div>

      {stop.why !== undefined && <p className="mt-1 text-sm">{stop.why}</p>}

      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <NavButton place={stop} note={stop.navNote} />
        {stop.phone !== undefined && <PhoneButton phone={stop.phone} />}
        <label className="ml-auto inline-flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isVisited}
            onChange={() => visited.toggle(stop.id)}
            className="h-5 w-5 accent-accent"
          />
          Gezildi
        </label>
      </div>

      {canUpgrade && (
        <button
          type="button"
          onClick={() => toggleUpgrade(stop.id)}
          className={`mt-2 min-h-11 border px-3 py-2 text-xs font-semibold ${
            isUpgraded ? 'border-accent-2 bg-antimony text-ink' : 'border-border text-text-muted'
          }`}
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
      <span className="text-sm font-semibold">
        <PriceTag amount={item.amount} />
        {item.altApplied !== undefined && (
          <span className="ml-1 text-xs font-normal text-text-muted">(ücretsiz seçenek)</span>
        )}
      </span>
    );
  }
  if (stop.cost === undefined || stop.cost === 0) {
    return <span className="text-sm text-text-muted">Ücretsiz</span>;
  }
  return <span className="text-sm text-text-muted">Bu modda dahil değil</span>;
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
    <div className="border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-semibold text-text-muted"
      >
        <span>
          Neden atlıyoruz? ({stops.length} durak
          {savedTotal > 0 ? `, ${euro(savedTotal)} tasarruf` : ''})
        </span>
        <span aria-hidden="true" className="font-display text-base">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <ul className="flex flex-col gap-3 border-t border-border px-3 py-3">
          {stops.map((stop) => (
            <li key={stop.id}>
              <p className="text-sm font-semibold">
                {stop.name}
                {stop.cost !== undefined && stop.cost > 0 && (
                  <span className="ml-2 font-normal text-text-muted">
                    ({euro(stop.cost)} tasarruf)
                  </span>
                )}
              </p>
              <p className="text-sm text-text-muted">
                {stop.skipReason ?? stop.removedReason ?? stop.why}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
