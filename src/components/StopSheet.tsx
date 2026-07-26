import { Badge, DataList, Flex, Span, Text, Wrap } from '@chakra-ui/react';
import type { Stop } from '../data/schema';
import type { LineItem } from '../lib/budget';
import { euro } from '../lib/format';
import { useTrip } from '../state/TripContext';
import { NavButton, PhoneButton } from './NavButton';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';
import { Sheet } from './Sheet';
import { StopTierBadge } from './TierBadge';
import { CheckRow, SignButton } from './ui/primitives';

/** Everything about one stop that no longer fits on its row in the day flow. */
export function StopSheet({
  stop,
  item,
  onClose,
}: {
  readonly stop: Stop;
  readonly item: LineItem | undefined;
  readonly onClose: () => void;
}) {
  const { mode, upgrades, toggleUpgrade, visited } = useTrip();
  const isVisited = visited.has(stop.id);
  const canUpgrade =
    mode === 'mixed' && stop.tier === 'optional' && stop.cost !== undefined && stop.cost > 0;
  const isUpgraded = upgrades.includes(stop.id);

  const facts: readonly (readonly [string, string])[] = [
    ...(stop.durationMin !== undefined
      ? ([['Süre', `${stop.durationMin} dk`]] as const)
      : ([] as const)),
    ...(stop.hours !== undefined ? ([['Saatler', stop.hours]] as const) : ([] as const)),
    ...(stop.bestTime !== undefined ? ([['En iyi zaman', stop.bestTime]] as const) : ([] as const)),
    ...(stop.costNote !== undefined ? ([['Fiyat notu', stop.costNote]] as const) : ([] as const)),
    ...(stop.costAltNote !== undefined
      ? ([['Ucuz alternatif', stop.costAltNote]] as const)
      : ([] as const)),
  ];

  return (
    <Sheet
      eyebrow={stop.city}
      title={stop.name}
      titleExtra={<RatingBadge rating={stop.rating} />}
      onClose={onClose}
      footer={
        <Wrap align="center" gap="2">
          <NavButton place={stop} note={stop.navNote} />
          {stop.phone !== undefined && <PhoneButton phone={stop.phone} />}
        </Wrap>
      }
    >
      <Wrap align="center" gap="2">
        {stop.tier === 'optional' && <StopTierBadge tier="optional" />}
        {stop.badge !== undefined && (
          <Badge
            variant="plain"
            bg="accentAlt.subtle"
            color="warn.fg"
            px="1.5"
            py="0.5"
            fontSize="xs"
            fontWeight="semibold"
          >
            {stop.badge}
          </Badge>
        )}
        <Span ms="auto" fontSize="md" fontWeight="semibold">
          {item !== undefined ? (
            <PriceTag amount={item.amount} />
          ) : stop.cost === undefined || stop.cost === 0 ? (
            'Ücretsiz'
          ) : (
            <Span fontSize="sm" fontWeight="normal" color="fg.muted">
              Bu modda dahil değil
            </Span>
          )}
        </Span>
      </Wrap>

      {item?.altApplied !== undefined && (
        <Text mt="1" fontSize="xs" color="fg.muted">
          Ücretsiz seçenek uygulandı.
        </Text>
      )}

      {stop.why !== undefined && (
        <Text mt="4" fontSize="sm" lineHeight="relaxed">
          {stop.why}
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

      <Flex
        mt="5"
        wrap="wrap"
        align="center"
        gap="3"
        borderTopWidth="1px"
        borderColor="border"
        pt="4"
      >
        <CheckRow
          checked={isVisited}
          onToggle={() => visited.toggle(stop.id)}
          fontSize="sm"
          fontWeight="medium"
        >
          Gezildi
        </CheckRow>
        {canUpgrade && (
          <SignButton
            ms="auto"
            fontSize="xs"
            onClick={() => toggleUpgrade(stop.id)}
            bg={isUpgraded ? 'antimony' : 'bg.panel'}
            color={isUpgraded ? 'ink' : 'fg.muted'}
            borderColor={isUpgraded ? 'accentAlt' : 'border'}
            _hover={{ bg: isUpgraded ? 'antimony' : 'bg.subtle' }}
          >
            {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : `Karma’ya ekle (+${euro(stop.cost ?? 0)})`}
          </SignButton>
        )}
      </Flex>
    </Sheet>
  );
}
