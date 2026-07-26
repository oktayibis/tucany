import { Badge } from '@chakra-ui/react';
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
    <Badge
      variant="plain"
      textStyle="eyebrow"
      borderWidth="1px"
      borderColor="border"
      color="fg.muted"
      px="1.5"
      py="0.5"
    >
      {STOP_LABEL[tier]}
    </Badge>
  );
}

/**
 * Solid fills in the *raw* brand colours, not the theme-adjusted semantic
 * tokens — `accent` brightens in dark mode so it stays legible as text on the
 * page background, which would undermine the white-on-cobalt pairing here.
 * A chip fill and its text colour are a pairing decided once, not something
 * that should drift with the theme. Antimony gold text also reads poorly on
 * anything but a dark plate, hence ink text, never gold-on-white.
 */
const FOOD_TIER_STYLE: Readonly<
  Record<FoodTier, { readonly bg?: string; readonly color: string; readonly outlined?: boolean }>
> = {
  a: { bg: 'antimony', color: 'ink' },
  b: { bg: 'cobalt', color: 'white' },
  both: { color: 'fg.muted', outlined: true },
};

export function FoodTierBadge({ tier }: { readonly tier: FoodTier }) {
  const style = FOOD_TIER_STYLE[tier];
  return (
    <Badge
      variant="plain"
      textStyle="eyebrow"
      px="1.5"
      py="0.5"
      bg={style.bg}
      color={style.color}
      borderWidth={style.outlined === true ? '1px' : undefined}
      borderColor={style.outlined === true ? 'border' : undefined}
    >
      {FOOD_LABEL[tier]}
    </Badge>
  );
}
