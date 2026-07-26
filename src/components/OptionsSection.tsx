import { Badge, Box, Flex, Grid, List, RadioGroup, Span, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import type { Day, DayOption } from '../data/schema';
import { trip } from '../data/trip';
import { chosenOption, resolveOptionCost } from '../lib/budget';
import { formatDayMonth, formatDriving } from '../lib/dates';
import { useTrip } from '../state/TripContext';
import { NavButton } from './NavButton';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';
import { Card, Eyebrow, SignButton } from './ui/primitives';

/**
 * A day's alternative itineraries — day 9's craft towns, day 7's
 * rest-day-vs-beach choice. Picking one swaps stops/food/shopping/driving
 * time/budget for the whole day (see effectiveStops/Food/Shopping in
 * src/lib/budget.ts), so this sits above the flow it rewrites.
 *
 * Once the choice is made it collapses to a single line: a decided day should
 * cost one row, not three cards of pros and cons the family already weighed.
 * Undecided, it opens the full picker — and pros/cons stay inline on the cards
 * there, never behind another toggle, because they *are* the content.
 */
export function OptionsSection({ day }: { readonly day: Day }) {
  const { mode, party, chosenOptions, chooseOption, upgrades } = useTrip();
  const [editing, setEditing] = useState(false);

  if (day.options === undefined) return null;

  const selected = chosenOption(day, { mode, party, chosenOptions, upgrades });
  const isDecided = chosenOptions[day.id] !== undefined;

  if (isDecided && !editing && selected !== null) {
    // The chosen option's destination has to stay reachable from the collapsed
    // bar. On a beach day "take me to the beach" is the single most-used action
    // of the day, and it would otherwise be buried behind "Değiştir".
    const beach =
      selected.beach === undefined
        ? undefined
        : trip.beaches.find((candidate) => candidate.id === selected.beach);
    const destination =
      beach ??
      (selected.nav === undefined ? undefined : { name: selected.label, nav: selected.nav });

    return (
      <Card>
        <Flex align="center" gap="3" p="3">
          <Box minW="0" flex="1">
            <Eyebrow>Seçilen rota</Eyebrow>
            <Text fontFamily="heading" fontWeight="medium">
              {selected.label}
            </Text>
            {beach !== undefined && (
              <Text fontSize="xs" color="fg.muted">
                {formatDriving(beach.minutesFromBase)}
              </Text>
            )}
          </Box>
          <SignButton flexShrink={0} bg="bg.subtle" onClick={() => setEditing(true)}>
            Değiştir
          </SignButton>
        </Flex>
        {destination !== undefined && (
          <Box borderTopWidth="1px" borderColor="border" px="3" py="2">
            <NavButton place={destination} />
          </Box>
        )}
      </Card>
    );
  }

  return (
    <Stack gap="3">
      <Flex align="center" gap="2">
        <Text
          flex="1"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="border"
          bg="bg.subtle"
          p="2"
          fontSize="xs"
          fontWeight="semibold"
          color="fg.muted"
        >
          {isDecided
            ? 'Bugünün rotasını seç.'
            : 'Karar verilmedi — planın önerisi gösteriliyor, aşağıdan seç.'}
        </Text>
        {editing && (
          <SignButton flexShrink={0} bg="bg.subtle" onClick={() => setEditing(false)}>
            Kapat
          </SignButton>
        )}
      </Flex>

      <RadioGroup.Root
        value={selected?.id ?? null}
        onValueChange={(event) => {
          if (event.value !== null) {
            chooseOption(day.id, event.value);
            setEditing(false);
          }
        }}
      >
        <RadioGroup.Label srOnly>Bugünün rotası</RadioGroup.Label>
        <Stack gap="3">
          {day.options.map((option) => (
            <OptionCard key={option.id} option={option} isSelected={option.id === selected?.id} />
          ))}
        </Stack>
      </RadioGroup.Root>
    </Stack>
  );
}

function OptionCard({
  option,
  isSelected,
}: {
  readonly option: DayOption;
  readonly isSelected: boolean;
}) {
  const { mode } = useTrip();
  const cost = resolveOptionCost(option.cost, mode);
  const beach =
    option.beach === undefined ? undefined : trip.beaches.find((b) => b.id === option.beach);
  const movesToDay =
    option.movesTo === undefined ? undefined : trip.days.find((d) => d.id === option.movesTo);
  const isBeach = beach !== undefined;

  return (
    <RadioGroup.Item
      value={option.id}
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      gap="2"
      cursor="pointer"
      bg="bg.panel"
      p="3"
      borderWidth={isSelected ? '2px' : '1px'}
      borderColor={isSelected ? (isBeach ? 'plaj' : 'accent') : 'border'}
      rounded="l1"
    >
      <RadioGroup.ItemHiddenInput />

      <Flex align="start" justify="space-between" gap="2">
        <Flex as="span" wrap="wrap" align="center" gap="2" fontFamily="heading" fontWeight="medium">
          <RadioGroup.ItemControl
            boxSize="5"
            flexShrink={0}
            borderColor="border"
            bg="bg.panel"
            _checked={{ bg: 'accent', borderColor: 'accent', color: 'accent.fg' }}
          />
          <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
          <RatingBadge rating={option.rating ?? beach?.rating} />
          {option.recommended === true && (
            <Badge
              variant="plain"
              bg="antimony"
              color="ink"
              px="1.5"
              py="0.5"
              fontSize="xs"
              fontWeight="semibold"
            >
              Planın önerisi
            </Badge>
          )}
          {isBeach && (
            <Badge
              variant="plain"
              bg="plaj.subtle"
              color="plaj"
              px="1.5"
              py="0.5"
              fontSize="xs"
              fontWeight="semibold"
            >
              Plaj
            </Badge>
          )}
        </Flex>
        <Span fontSize="sm" fontWeight="semibold">
          <PriceTag amount={cost} />
        </Span>
      </Flex>

      <Text fontSize="sm">{option.desc}</Text>

      {option.drivingMinutes !== undefined && (
        <Text fontSize="xs" color="fg.muted">
          Sürüş: {formatDriving(option.drivingMinutes)}
        </Text>
      )}

      {(option.pros !== undefined || option.cons !== undefined) && (
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap="2">
          {option.pros !== undefined && option.pros.length > 0 && (
            <List.Root gap="0.5" fontSize="xs" color="safe" listStyle="none" ms="0">
              {option.pros.map((pro) => (
                <List.Item key={pro}>+ {pro}</List.Item>
              ))}
            </List.Root>
          )}
          {option.cons !== undefined && option.cons.length > 0 && (
            <List.Root gap="0.5" fontSize="xs" color="danger" listStyle="none" ms="0">
              {option.cons.map((con) => (
                <List.Item key={con}>− {con}</List.Item>
              ))}
            </List.Root>
          )}
        </Grid>
      )}

      {beach !== undefined && (
        <Box
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="plaj"
          bg="bg.subtle"
          p="2"
          fontSize="xs"
        >
          <Text fontWeight="semibold">
            {beach.name} · {formatDriving(beach.minutesFromBase)}
          </Text>
          <Text mt="0.5" color="fg.muted">
            {beach.notes}
          </Text>
          <Box mt="1">
            <NavButton place={beach} note="Plaja yol tarifi al" />
          </Box>
        </Box>
      )}

      {option.bikes !== undefined && (
        <Text fontSize="xs" color="fg.muted">
          <Span fontWeight="semibold" color="fg">
            Bisiklet:{' '}
          </Span>
          {option.bikes}
        </Text>
      )}

      {option.note !== undefined && (
        <Text fontSize="xs" fontStyle="italic" color="fg.muted">
          {option.note}
        </Text>
      )}

      {movesToDay !== undefined && (
        <Text fontSize="xs" color="fg.muted">
          ↷ Bu seçilirse akşam programı {formatDayMonth(movesToDay.date)}'e ({movesToDay.title})
          taşınır.
        </Text>
      )}

      {option.nav !== undefined && (
        <Box>
          <NavButton place={{ name: option.label, nav: option.nav }} />
        </Box>
      )}
    </RadioGroup.Item>
  );
}
