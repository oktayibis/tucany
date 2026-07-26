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
    <span className="inline-block rounded border px-1.5 py-0.5 text-xs leading-none">
      {STOP_LABEL[tier]}
    </span>
  );
}

export function FoodTierBadge({ tier }: { readonly tier: FoodTier }) {
  return (
    <span className="inline-block rounded border px-1.5 py-0.5 text-xs leading-none">
      {FOOD_LABEL[tier]}
    </span>
  );
}
