import type { Shopping } from '../data/schema';
import { euro } from '../lib/format';
import { NavButton } from './NavButton';

export function ShoppingSection({ shopping }: { readonly shopping: readonly Shopping[] }) {
  if (shopping.length === 0) {
    return <p className="text-sm text-text-muted">Bu gün için ayrı bir alışveriş durağı yok.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {shopping.map((entry) => (
        <li key={entry.name} className="rounded-2xl border border-border bg-surface-2 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-display font-medium">
              {entry.name}
              {entry.highlight === true && (
                <span className="ml-2 rounded-full bg-olive px-1.5 py-0.5 font-body text-xs font-semibold text-ink">
                  Öne çıkan
                </span>
              )}
            </p>
            <span className="text-sm text-text-muted">
              {entry.cost === undefined || entry.cost === null ? 'fiyat yok' : euro(entry.cost)}
            </span>
          </div>
          <p className="mt-1 text-sm">{entry.for}</p>
          {entry.address !== undefined && (
            <p className="text-xs text-text-muted">{entry.address}</p>
          )}
          {entry.tip !== undefined && <p className="mt-1 text-sm italic">{entry.tip}</p>}
          {entry.nav !== undefined && (
            <div className="mt-2">
              <NavButton place={{ name: entry.name, nav: entry.nav }} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
