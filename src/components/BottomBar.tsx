import type { Route } from '../hooks/useRoute';

type Tab = { readonly route: Route; readonly label: string; readonly glyph: string };

const TABS: readonly Tab[] = [
  { route: { name: 'days' }, label: 'Günler', glyph: '🗓️' },
  { route: { name: 'search' }, label: 'Ara', glyph: '🔍' },
  { route: { name: 'pork', tab: 'guide' }, label: 'Domuz Rehberi', glyph: '🚫' },
  { route: { name: 'lists' }, label: 'Listeler', glyph: '📋' },
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
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface-2/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-md"
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
            className={`relative flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-medium transition-all ${
              isPork
                ? active
                  ? 'font-bold text-danger'
                  : 'text-danger/90'
                : active
                  ? 'font-bold text-accent'
                  : 'text-text-muted hover:text-text'
            }`}
          >
            {active && (
              <span
                className={`absolute top-0 h-1 w-8 rounded-b-full ${isPork ? 'bg-danger' : 'bg-accent'}`}
              />
            )}
            <span aria-hidden="true" className="text-base leading-none">
              {tab.glyph}
            </span>
            <span className="truncate text-[11px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
