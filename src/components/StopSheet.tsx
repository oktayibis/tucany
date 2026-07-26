import type { Stop } from '../data/schema';
import type { LineItem } from '../lib/budget';
import { euro } from '../lib/format';
import { useTrip } from '../state/TripContext';
import { NavButton, PhoneButton } from './NavButton';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';
import { Sheet } from './Sheet';
import { StopTierBadge } from './TierBadge';

/** Everything about one stop that no longer fits on its row in the day flow. */
export function StopSheet({
  stop,
  item,
  onClose,
}: {
  readonly stop: Stop;
  readonly item: LineItem | undefined;
  readonly onClose: () => void;
}) {
  const { mode, upgrades, toggleUpgrade, visited } = useTrip();
  const isVisited = visited.has(stop.id);
  const canUpgrade =
    mode === 'mixed' && stop.tier === 'optional' && stop.cost !== undefined && stop.cost > 0;
  const isUpgraded = upgrades.includes(stop.id);

  const facts: readonly (readonly [string, string])[] = [
    ...(stop.durationMin !== undefined
      ? ([['Süre', `${stop.durationMin} dk`]] as const)
      : ([] as const)),
    ...(stop.hours !== undefined ? ([['Saatler', stop.hours]] as const) : ([] as const)),
    ...(stop.bestTime !== undefined ? ([['En iyi zaman', stop.bestTime]] as const) : ([] as const)),
    ...(stop.costNote !== undefined ? ([['Fiyat notu', stop.costNote]] as const) : ([] as const)),
    ...(stop.costAltNote !== undefined
      ? ([['Ucuz alternatif', stop.costAltNote]] as const)
      : ([] as const)),
  ];

  return (
    <Sheet
      eyebrow={stop.city}
      title={stop.name}
      titleExtra={<RatingBadge rating={stop.rating} />}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <NavButton place={stop} note={stop.navNote} />
          {stop.phone !== undefined && <PhoneButton phone={stop.phone} />}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {stop.tier === 'optional' && <StopTierBadge tier="optional" />}
        {stop.badge !== undefined && (
          <span className="bg-accent-2/20 px-1.5 py-0.5 text-xs font-semibold text-accent-2">
            {stop.badge}
          </span>
        )}
        <span className="ml-auto text-base font-semibold">
          {item !== undefined ? (
            <PriceTag amount={item.amount} />
          ) : stop.cost === undefined || stop.cost === 0 ? (
            'Ücretsiz'
          ) : (
            <span className="text-sm font-normal text-text-muted">Bu modda dahil değil</span>
          )}
        </span>
      </div>

      {item?.altApplied !== undefined && (
        <p className="mt-1 text-xs text-text-muted">Ücretsiz seçenek uygulandı.</p>
      )}

      {stop.why !== undefined && <p className="mt-4 text-sm leading-relaxed">{stop.why}</p>}

      {facts.length > 0 && (
        <dl className="mt-4 flex flex-col gap-1.5 text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-28 shrink-0 text-text-muted">{label}</dt>
              <dd className="min-w-0 flex-1">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isVisited}
            onChange={() => visited.toggle(stop.id)}
            className="h-5 w-5 accent-accent"
          />
          Gezildi
        </label>
        {canUpgrade && (
          <button
            type="button"
            onClick={() => toggleUpgrade(stop.id)}
            className={`ml-auto min-h-11 border px-3 py-2 text-xs font-semibold ${
              isUpgraded ? 'border-accent-2 bg-antimony text-ink' : 'border-border text-text-muted'
            }`}
          >
            {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : `Karma’ya ekle (+${euro(stop.cost ?? 0)})`}
          </button>
        )}
      </div>
    </Sheet>
  );
}
