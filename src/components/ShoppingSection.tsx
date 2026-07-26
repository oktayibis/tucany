import type { Shopping } from '../data/schema';
import { euro } from '../lib/format';
import { NavButton } from './NavButton';

export function ShoppingSection({ shopping }: { readonly shopping: readonly Shopping[] }) {
  if (shopping.length === 0) {
    return <p className="text-sm opacity-75">Bu gün için ayrı bir alışveriş durağı yok.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {shopping.map((entry) => (
        <li key={entry.name} className="rounded border p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold">
              {entry.name}
              {entry.highlight === true && (
                <span className="ml-2 rounded border px-1.5 py-0.5 text-xs font-normal">Öne çıkan</span>
              )}
            </p>
            <span className="text-sm opacity-75">
              {entry.cost === undefined || entry.cost === null ? 'fiyat yok' : euro(entry.cost)}
            </span>
          </div>
          <p className="mt-1 text-sm">{entry.for}</p>
          {entry.address !== undefined && <p className="text-xs opacity-75">{entry.address}</p>}
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
