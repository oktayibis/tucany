import type { Route } from '../hooks/useRoute';

type Tab = { readonly route: Route; readonly label: string; readonly glyph: string };

const TABS: readonly Tab[] = [
  { route: { name: 'days' }, label: 'Günler', glyph: '≡' },
  { route: { name: 'search' }, label: 'Ara', glyph: '⌕' },
  { route: { name: 'pork', tab: 'guide' }, label: 'Domuz rehberi', glyph: '⚠' },
  { route: { name: 'lists' }, label: 'Listeler', glyph: '✓' },
];

function isActive(route: Route, tabRoute: Route): boolean {
  if (tabRoute.name === 'days') return route.name === 'days' || route.name === 'day';
  return route.name === tabRoute.name;
}

/**
 * Persistent across every screen — the brief is explicit that the pork guide
 * must never be more than one tap away, so it lives here rather than behind
 * a menu.
 */
export function BottomBar({
  route,
  onNavigate,
}: {
  readonly route: Route;
  readonly onNavigate: (next: Route) => void;
}) {
  return (
    <nav
      aria-label="Ana gezinme"
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {TABS.map((tab) => {
        const active = isActive(route, tab.route);
        const isPork = tab.route.name === 'pork';
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onNavigate(tab.route)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold ${
              isPork ? 'text-danger' : active ? 'text-accent' : 'text-text-muted'
            }`}
          >
            <span aria-hidden="true" className="font-display text-base">
              {tab.glyph}
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
