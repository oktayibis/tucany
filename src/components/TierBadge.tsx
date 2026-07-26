import type { FoodTier, StopTier } from '../data/schema';

const STOP_LABEL: Readonly<Record<StopTier, string>> = {
  core: 'Ana durak',
  optional: 'Opsiyonel',
  skip: 'Atlanıyor',
  removed: 'Çıkarıldı',
};

const FOOD_LABEL: Readonly<Record<FoodTier, string>> = {
  a: 'Keyif',
  b: 'Ucuz',
  both: 'Her modda',
};

export function StopTierBadge({ tier }: { readonly tier: StopTier }) {
  return (
    <span className="inline-block border border-border px-1.5 py-0.5 font-display text-xs font-medium uppercase tracking-wide text-text-muted">
      {STOP_LABEL[tier]}
    </span>
  );
}

/**
 * Solid fills in the raw brand colours, not the theme-adjusted semantic
 * tokens — `--color-accent` brightens in dark mode so it stays legible as
 * *text on the page background*, which would undermine the white-on-cobalt
 * pairing here. A chip fill + its text colour is a pairing decided once,
 * not something that should drift with the theme. Antimony gold text also
 * reads poorly on anything but a dark plate, hence dark ink text, never
 * gold-on-white.
 */
const FOOD_TIER_STYLE: Readonly<Record<FoodTier, string>> = {
  a: 'bg-antimony text-ink',
  b: 'bg-cobalt text-white',
  both: 'border border-border text-text-muted',
};

export function FoodTierBadge({ tier }: { readonly tier: FoodTier }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 font-display text-xs font-medium uppercase tracking-wide ${FOOD_TIER_STYLE[tier]}`}
    >
      {FOOD_LABEL[tier]}
    </span>
  );
}
