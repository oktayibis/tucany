import { Box, Circle, Flex, Heading, List, Span, Stack, Text, Wrap, chakra } from '@chakra-ui/react';
import { trip } from '../data/trip';
import { chosenOption, effectiveDrivingMinutes } from '../lib/budget';
import { formatDriving } from '../lib/dates';
import { euro } from '../lib/format';
import { useTrip } from '../state/TripContext';
import { DayCard } from './DayCard';
import { ModeSwitch } from './ModeSwitch';
import { NavButton, PhoneButton } from './NavButton';
import { PartyControl } from './PartyControl';
import { PriceTag } from './PriceTag';
import { Eyebrow, SignButton } from './ui/primitives';

/** The cold-start shortcut into today, shown only while the trip is running. */
const TodayButton = chakra('button', {
  base: {
    minH: '11',
    borderWidth: '2px',
    borderColor: 'accent',
    bg: 'bg.panel',
    p: '3',
    textAlign: 'start',
    cursor: 'pointer',
    _hover: { bg: 'bg.subtle' },
  },
});

/**
 * Home. The signature element: a continuous vertical route where each day is
 * a waypoint and the segment before it is drawn tall or short in proportion
 * to that day's driving minutes — so the two heavy driving days (Arezzo,
 * Val d'Orcia) visibly widen the line and the near-zero days sit close
 * together, legible at a glance before reading a single number.
 */
export function DayList({ onOpenDay }: { readonly onOpenDay: (dayId: string) => void }) {
  const { today, isOnTrip, activeDayId, budget, mode, party, chosenOptions, upgrades } = useTrip();

  return (
    <Flex direction="column" mx="auto" maxW="2xl" pb="24">
      <Box as="header" layerStyle="plate" px="4" pt="6" pb="5">
        <Heading as="h1" textStyle="displayXl">
          {trip.trip.title}
        </Heading>
        <Text fontSize="sm" opacity={0.85}>
          🏨 {trip.base.name} · {trip.trip.nights} gece
        </Text>
        <Wrap mt="3" align="center" gap="2">
          <NavButton place={trip.base} note="Otele yol tarifi al" />
          <PhoneButton phone={trip.base.phone} />
        </Wrap>
      </Box>

      {/* Pulled up so the switch overlaps the plate's bottom edge, the way a
          route marker is bolted onto a signpost rather than floating under it. */}
      <Box mt="-3.5" px="4">
        <ModeSwitch />
      </Box>

      <Stack gap="4" px="4" pt="4">
        <PartyControl />

        {isOnTrip && (
          <TodayButton type="button" onClick={() => onOpenDay(activeDayId)}>
            <Eyebrow color="accent">Bugün</Eyebrow>
            <Text fontFamily="heading" fontWeight="medium">
              {trip.days.find((day) => day.id === activeDayId)?.title ?? ''}
            </Text>
          </TodayButton>
        )}
      </Stack>

      <List.Root
        as="ol"
        position="relative"
        display="flex"
        flexDirection="column"
        gap="0"
        listStyle="none"
        ms="0"
        px="4"
        ps="9"
        pt="6"
        _before={{
          content: '""',
          position: 'absolute',
          insetBlock: '1.5rem 2rem',
          insetInlineStart: '1.4rem',
          w: '0.125rem',
          bg: 'border',
        }}
      >
        {trip.days.map((day, index) => {
          const dayTotal = budget.days.find((candidate) => candidate.dayId === day.id)?.total ?? 0;
          const isToday = day.date === today;
          const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
          const drivingMinutes = effectiveDrivingMinutes(day, option);
          const undecided = day.options !== undefined && chosenOptions[day.id] === undefined;
          return (
            <List.Item key={day.id} display="flex" flexDirection="column" gap="2">
              {index > 0 && (
                // The segment's height *is* the driving time — this is the one
                // piece of information the list encodes spatially rather than
                // in text, so the heavy days are obvious before you read a number.
                <Flex
                  aria-hidden="true"
                  align="center"
                  ps="1"
                  fontSize="xs"
                  color="fg.muted"
                  h={`${0.9 + drivingMinutes * 0.032}rem`}
                >
                  <Span bg="bg" pe="2">
                    ↓ {formatDriving(drivingMinutes)} sürüş
                  </Span>
                </Flex>
              )}
              <Box position="relative">
                <Circle
                  aria-hidden="true"
                  position="absolute"
                  insetInlineStart="-1.35rem"
                  top="0.5"
                  size="3.5"
                  borderWidth="2px"
                  borderColor={day.starred === true ? 'accentAlt' : 'accent'}
                  bg={
                    day.starred === true ? 'antimony' : isToday ? 'cobalt' : 'bg.panel'
                  }
                />
                <DayCard
                  day={day}
                  index={index}
                  total={dayTotal}
                  drivingMinutes={drivingMinutes}
                  undecided={undecided}
                  isToday={isToday}
                  onOpen={() => onOpenDay(day.id)}
                />
              </Box>
            </List.Item>
          );
        })}
      </List.Root>

      <Stack
        as="footer"
        mt="4"
        gap="3"
        borderTopWidth="1px"
        borderColor="border"
        px="4"
        pt="4"
        fontSize="sm"
        color="fg.muted"
      >
        <Text>
          Toplam ({budget.mode}):{' '}
          <PriceTag amount={budget.grandTotal} fontWeight="semibold" color="fg" /> · Atlanan:{' '}
          {euro(budget.savedTotal)}
        </Text>
        <SignButton alignSelf="start" onClick={() => window.print()}>
          Yazdır / PDF olarak kaydet
        </SignButton>
      </Stack>
    </Flex>
  );
}
