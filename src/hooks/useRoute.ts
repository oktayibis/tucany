import { useCallback, useEffect, useState } from 'react';

/**
 * Hash routing, hand-rolled.
 *
 * A router library would be more weight than this needs, but the phone's back
 * button has to work — on a day detail, pressing back must return to the day
 * list rather than leaving the app. The hash gives us that for free.
 */
export type Route =
  | { readonly name: 'days' }
  | { readonly name: 'day'; readonly dayId: string }
  | { readonly name: 'pork'; readonly tab: 'guide' | 'phrases' }
  | { readonly name: 'search' }
  | { readonly name: 'lists' };

export const HOME: Route = { name: 'days' };

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'days':
      return '#/';
    case 'day':
      return `#/gun/${route.dayId}`;
    case 'pork':
      return `#/domuz/${route.tab === 'guide' ? 'rehber' : 'cumleler'}`;
    case 'search':
      return '#/ara';
    case 'lists':
      return '#/listeler';
  }
}

export function hashToRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [head, tail] = path;

  switch (head) {
    case undefined:
      return HOME;
    case 'gun':
      return tail === undefined ? HOME : { name: 'day', dayId: tail };
    case 'domuz':
      return { name: 'pork', tab: tail === 'cumleler' ? 'phrases' : 'guide' };
    case 'ara':
      return { name: 'search' };
    case 'listeler':
      return { name: 'lists' };
    default:
      return HOME;
  }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => hashToRoute(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(hashToRoute(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const go = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
  }, []);

  return { route, go } as const;
}
