import type { Shopping } from '../data/schema';
import { euro } from '../lib/format';
import { NavButton } from './NavButton';

/** The day's shopping stops, as the mockup's name/description rows with an arrow out to maps. */
export function ShoppingSection({ shopping }: { readonly shopping: readonly Shopping[] }) {
  if (shopping.length === 0) {
    return <p className="text-body text-neutral-700">Bu gün için ayrı bir alışveriş durağı yok.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {shopping.map((entry) => (
        <li
          key={entry.name}
          className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="font-display text-item font-semibold">
              {entry.name}
              {entry.highlight === true && (
                <span className="tag tag-accent-2 ml-2 align-middle">öne çıkan</span>
              )}
            </p>
            <p className="mt-[3px] text-meta text-neutral-700">
              {[
                entry.for,
                entry.cost === undefined || entry.cost === null ? 'fiyat yok' : euro(entry.cost),
              ].join(' · ')}
            </p>
            {entry.address !== undefined && (
              <p className="text-meta text-neutral-600">{entry.address}</p>
            )}
            {entry.tip !== undefined && (
              <p className="mt-1 text-meta italic text-neutral-700">{entry.tip}</p>
            )}
          </div>
          {entry.nav !== undefined && (
            <NavButton
              place={{ name: entry.name, nav: entry.nav }}
              className="min-h-[44px] w-[52px] flex-none"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
