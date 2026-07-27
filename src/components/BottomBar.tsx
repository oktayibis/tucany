import type { Route } from '../hooks/useRoute';
import { Icon, type IconName } from './Icon';

type Tab = { readonly route: Route; readonly label: string; readonly icon: IconName };

const TABS: readonly Tab[] = [
  { route: { name: 'days' }, label: 'Günler', icon: 'map' },
  { route: { name: 'search' }, label: 'Ara', icon: 'search' },
  { route: { name: 'pork', tab: 'guide' }, label: 'Domuz', icon: 'pork' },
  { route: { name: 'lists' }, label: 'Listeler', icon: 'lists' },
];

function isActive(route: Route, tabRoute: Route): boolean {
  if (tabRoute.name === 'days') return route.name === 'days' || route.name === 'day';
  return route.name === tabRoute.name;
}

/**
 * Persistent across every screen — the brief is explicit that the pork guide
 * must never be more than one tap away, so it lives here rather than behind a
 * menu. The mockup has no tab bar at all (it only draws two screens), so this
 * is styled to the same system rather than transcribed from it.
 *
 * A `flex-none` row at the bottom of the app frame, not a fixed overlay: the
 * frame owns the viewport height, so nothing above needs to reserve space for
 * this or track its height.
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
      className="flex flex-none border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
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
            className={`flex min-h-[54px] flex-1 cursor-pointer flex-col items-center justify-center gap-[3px] text-label font-semibold ${
              isPork ? 'text-danger' : active ? 'text-accent-700' : 'text-neutral-600'
            }`}
          >
            <Icon name={tab.icon} size={19} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
