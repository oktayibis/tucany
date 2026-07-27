import {
  AlertCircle,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Lightbulb,
  ListChecks,
  Map,
  Navigation,
  PiggyBank,
  Route,
  Search,
  ShoppingBag,
  Star,
  TriangleAlert,
  Utensils,
} from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * The mockup draws its icons as CSS masks pointing at `unpkg.com/lucide-static`.
 * A CDN is not an option here — the app has to cold-start in airplane mode — so
 * the same Lucide glyphs come from `lucide-react` instead, which tree-shakes
 * into the bundle and is therefore covered by the PWA precache.
 *
 * Everything routes through this one module so the set stays small and the
 * sizes stay the mockup's (icons there are sized in px per usage, not on a
 * scale), and so swapping the icon library later is a one-file change.
 */
export const ICONS = {
  alert: AlertCircle,
  car: CarFront,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  gauge: Gauge,
  lightbulb: Lightbulb,
  lists: ListChecks,
  map: Map,
  nav: Navigation,
  piggyBank: PiggyBank,
  pork: TriangleAlert,
  route: Route,
  search: Search,
  shopping: ShoppingBag,
  star: Star,
  utensils: Utensils,
} as const satisfies Record<string, ComponentType<{ size?: number; className?: string }>>;

export type IconName = keyof typeof ICONS;

/**
 * `size` is in CSS px, matching how the mockup specifies each icon. Icons are
 * always decorative here — every one sits next to a text label or inside a
 * button that carries its own `aria-label` — so they are hidden from the
 * accessibility tree rather than given a redundant name.
 */
export function Icon({
  name,
  size = 16,
  className,
}: {
  readonly name: IconName;
  readonly size?: number;
  readonly className?: string;
}) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      size={size}
      aria-hidden="true"
      className={`shrink-0${className === undefined ? '' : ` ${className}`}`}
    />
  );
}
