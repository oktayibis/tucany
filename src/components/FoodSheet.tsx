import { Badge, Box, DataList, Span, Text, Wrap } from '@chakra-ui/react';
import type { Food, MealSlot } from '../data/schema';
import { foodKey } from '../lib/budget';
import { useTrip } from '../state/TripContext';
import { NavButton, PhoneButton } from './NavButton';
import { PorkSafeNote, PorkWarningNote } from './PorkWarningNote';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';
import { Sheet } from './Sheet';
import { FoodTierBadge } from './TierBadge';
import { SignButton } from './ui/primitives';

export const SLOT_LABEL: Readonly<Record<MealSlot, string>> = {
  coffee: 'Kahve',
  lunch: 'Öğle',
  aperitivo: 'Aperitivo',
  dinner: 'Akşam',
  snack: 'Atıştırmalık',
};

export const SLOT_ORDER: readonly MealSlot[] = ['coffee', 'lunch', 'aperitivo', 'dinner', 'snack'];

const BOOKING_LABEL: Readonly<Record<NonNullable<Food['booking']>, string>> = {
  required: 'Gerekli',
  recommended: 'Önerilir',
  'phone-only': 'Sadece telefonla',
};

/** Everything about one meal that no longer fits on its row in the day flow. */
export function FoodSheet({
  food,
  dayId,
  onClose,
}: {
  readonly food: Food;
  readonly dayId: string;
  readonly onClose: () => void;
}) {
  const { mode, upgrades, toggleUpgrade } = useTrip();
  const key = foodKey(dayId, food);
  const canUpgrade = mode === 'mixed' && food.tier === 'a';
  const isUpgraded = upgrades.includes(key);

  const facts: readonly (readonly [string, string])[] = [
    ...(food.hours !== undefined ? ([['Saatler', food.hours]] as const) : ([] as const)),
    ...(food.closedOn !== undefined && food.closedOn.length > 0
      ? ([['Kapalı', food.closedOn.join(', ')]] as const)
      : ([] as const)),
    ...(food.booking !== undefined
      ? ([
          [
            'Rezervasyon',
            food.bookingNote === undefined
              ? BOOKING_LABEL[food.booking]
              : `${BOOKING_LABEL[food.booking]} — ${food.bookingNote}`,
          ],
        ] as const)
      : ([] as const)),
  ];

  return (
    <Sheet
      eyebrow={SLOT_LABEL[food.slot]}
      title={food.name}
      titleExtra={<RatingBadge rating={food.rating} />}
      onClose={onClose}
      footer={
        <Wrap align="center" gap="2">
          <NavButton place={food} />
          {food.phone !== undefined && <PhoneButton phone={food.phone} />}
        </Wrap>
      }
    >
      <Wrap align="center" gap="2">
        <FoodTierBadge tier={food.tier} />
        {food.michelin === true && (
          <Badge
            variant="plain"
            borderWidth="1px"
            borderColor="accent"
            color="accent"
            px="1.5"
            py="0.5"
            fontSize="xs"
            fontWeight="semibold"
          >
            ★ Michelin
          </Badge>
        )}
        <Span ms="auto" fontSize="md" fontWeight="semibold">
          <PriceTag amount={food.price} />
        </Span>
      </Wrap>
      {food.priceNote !== undefined && (
        <Text mt="1" fontSize="xs" color="fg.muted">
          Fiyat notu: {food.priceNote}
        </Text>
      )}

      {food.closedToday === true && (
        <Text
          mt="4"
          borderWidth="1px"
          borderColor="danger"
          bg="danger.bg"
          color="danger"
          p="3"
          fontSize="sm"
          fontWeight="semibold"
        >
          Bugün kapalı.
        </Text>
      )}

      {food.why !== undefined && (
        <Text mt="4" fontSize="sm" lineHeight="relaxed">
          {food.why}
        </Text>
      )}

      {facts.length > 0 && (
        <DataList.Root mt="4" gap="1.5" orientation="horizontal" size="sm">
          {facts.map(([label, value]) => (
            <DataList.Item key={label}>
              <DataList.ItemLabel w="28" flexShrink={0} color="fg.muted">
                {label}
              </DataList.ItemLabel>
              <DataList.ItemValue minW="0" flex="1" color="fg">
                {value}
              </DataList.ItemValue>
            </DataList.Item>
          ))}
        </DataList.Root>
      )}

      {food.porkWarning !== undefined && (
        <Box mt="4">
          <PorkWarningNote warning={food.porkWarning} />
        </Box>
      )}
      {food.porkSafe === true && (
        <Box mt="4">
          <PorkSafeNote />
        </Box>
      )}

      {canUpgrade && (
        <Box mt="5" borderTopWidth="1px" borderColor="border" pt="4">
          <SignButton
            fontSize="xs"
            onClick={() => toggleUpgrade(key)}
            bg={isUpgraded ? 'antimony' : 'bg.panel'}
            color={isUpgraded ? 'ink' : 'fg.muted'}
            borderColor={isUpgraded ? 'accentAlt' : 'border'}
            _hover={{ bg: isUpgraded ? 'antimony' : 'bg.subtle' }}
          >
            {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : 'Karma’ya ekle'}
          </SignButton>
        </Box>
      )}
    </Sheet>
  );
}
