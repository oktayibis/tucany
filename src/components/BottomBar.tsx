import { Span, chakra } from '@chakra-ui/react';
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

const TabButton = chakra('button', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5',
    flex: '1',
    minH: '11',
    py: '2',
    fontSize: 'xs',
    fontWeight: 'semibold',
    cursor: 'pointer',
    _hover: { bg: 'bg.muted' },
  },
});

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
    <chakra.nav
      aria-label="Ana gezinme"
      position="fixed"
      insetX="0"
      bottom="0"
      zIndex="10"
      display="flex"
      borderTopWidth="1px"
      borderColor="border"
      bg="bg.subtle"
      pb="env(safe-area-inset-bottom)"
    >
      {TABS.map((tab) => {
        const active = isActive(route, tab.route);
        const isPork = tab.route.name === 'pork';
        return (
          <TabButton
            key={tab.label}
            type="button"
            onClick={() => onNavigate(tab.route)}
            aria-current={active ? 'page' : undefined}
            color={isPork ? 'danger' : active ? 'accent' : 'fg.muted'}
          >
            <Span aria-hidden="true" fontFamily="heading" fontSize="md">
              {tab.glyph}
            </Span>
            {tab.label}
          </TabButton>
        );
      })}
    </chakra.nav>
  );
}
