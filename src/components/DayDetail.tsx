import { Badge, Box, Flex, Grid, Heading, List, Span, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { trip } from '../data/trip';
import type { Route } from '../hooks/useRoute';
import {
  chosenOption,
  effectiveDrivingMinutes,
  effectiveFood,
  effectiveShopping,
  effectiveStops,
  isStopVisible,
} from '../lib/budget';
import { formatDayMonth, formatDriving, weekdayDisplay } from '../lib/dates';
import { gapsForDay } from '../lib/gaps';
import { ALL_CLOSURES, ALL_GAPS } from '../state/derived';
import { useTrip } from '../state/TripContext';
import { DayHeadNotes, DayNotes, hasTailNotes } from './DayNotes';
import { Disclosure } from './Disclosure';
import { FoodSection } from './FoodSection';
import { INTENSITY_SHORT } from './IntensityMeter';
import { OptionsSection } from './OptionsSection';
import { PriceTag } from './PriceTag';
import { RouteSection } from './RouteSection';
import { ShoppingSection } from './ShoppingSection';
import { StopsSection } from './StopsSection';
import { WarningBanner } from './WarningBanner';
import { Eyebrow, SignButton } from './ui/primitives';

/**
 * One day, ordered by what the family needs while standing in it.
 *
 * The page is deliberately shallow: a header that answers "how hard, how far,
 * how much", the decision if the day has one, then the day itself as two runs
 * of tappable rows (stops, then meals). Everything else — driving legs, the
 * hotel, shopping, skipped stops, archival notes — is a closed disclosure at
 * the bottom. Per-place depth lives in the sheet a row opens, not on the page.
 */
export function DayDetail({
  dayId,
  onBack,
}: {
  readonly dayId: string;
  readonly onBack: () => void;
}) {
  const { today, budget, mode, party, chosenOptions, upgrades } = useTrip();
  const index = trip.days.findIndex((day) => day.id === dayId);
  const day = trip.days[index];

  if (day === undefined) {
    return (
      <Box p="4">
        <Text>Bu gün bulunamadı.</Text>
        <SignButton mt="2" color="fg" onClick={onBack}>
          Güne dön
        </SignButton>
      </Box>
    );
  }

  const dayBudget = budget.days.find((candidate) => candidate.dayId === dayId);
  const dayClosures = ALL_CLOSURES.find((candidate) => candidate.dayId === dayId);
  const dayGaps = gapsForDay(ALL_GAPS, dayId);
  const isToday = day.date === today;

  const option = chosenOption(day, { mode, party, chosenOptions, upgrades });
  const stops = effectiveStops(day, option).filter((stop) =>
    isStopVisible(stop, trip.days, chosenOptions),
  );
  const food = effectiveFood(day, option);
  const shopping = effectiveShopping(day, option);
  const drivingMinutes = effectiveDrivingMinutes(day, option);

  return (
    <Box mx="auto" maxW="2xl" px="4" pb="24">
      <Flex
        position="sticky"
        top="0"
        zIndex="20"
        mx="-4"
        align="center"
        gap="2"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg/95"
        backdropFilter="blur(8px)"
        px="4"
        py="2"
      >
        <SignButton
          ms="-2"
          borderWidth="0"
          bg="transparent"
          px="2"
          fontFamily="heading"
          onClick={onBack}
        >
          ← Günler
        </SignButton>
        <Span truncate textStyle="eyebrow" fontWeight="medium" color="fg.muted">
          {index + 1}. gün · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </Span>
        {isToday && (
          <Badge
            variant="plain"
            ms="auto"
            flexShrink={0}
            bg="accent"
            color="accent.fg"
            px="1.5"
            py="0.5"
            textStyle="eyebrow"
          >
            Bugün
          </Badge>
        )}
      </Flex>

      <Box as="header" pt="4">
        <Heading as="h1" textStyle="displayXl">
          {day.title}
          {day.starred === true && (
            <Span aria-hidden="true" ms="2" color="accentAlt">
              ★
            </Span>
          )}
        </Heading>

        <Grid as="dl" mt="3" templateColumns="repeat(3, 1fr)" layerStyle="card">
          <Stat label="Sürüş" value={formatDriving(drivingMinutes)} />
          <Stat label="Tempo" value={INTENSITY_SHORT[day.intensity]} />
          <Stat label="Bütçe" value={<PriceTag amount={dayBudget?.total ?? 0} />} last />
        </Grid>

        {!day.elderFriendly && (
          <Text
            mt="2"
            borderWidth="1px"
            borderColor="warn.border"
            bg="warn.bg"
            color="warn.fg"
            px="3"
            py="1.5"
            fontSize="xs"
            fontWeight="semibold"
          >
            Anne için zorlu gün olabilir
          </Text>
        )}
      </Box>

      <Stack mt="4" gap="4">
        {dayClosures !== undefined && (
          <WarningBanner warnings={day.warnings} closures={dayClosures} />
        )}

        <DayHeadNotes day={day} />

        {day.options !== undefined && <OptionsSection day={day} />}

        {day.timeline !== undefined && day.timeline.length > 0 && (
          <Box as="section" aria-labelledby="day-timeline">
            <SectionLabel id="day-timeline">Saat saat</SectionLabel>
            <List.Root as="ol" layerStyle="card" listStyle="none" ms="0" gap="0">
              {day.timeline.map((entry) => (
                <List.Item
                  key={entry.time}
                  display="flex"
                  gap="3"
                  borderBottomWidth="1px"
                  borderColor="border"
                  px="3"
                  py="2"
                  fontSize="sm"
                  _last={{ borderBottomWidth: 0 }}
                >
                  <Span fontFamily="heading" fontWeight="semibold" fontVariantNumeric="tabular-nums" color="accent">
                    {entry.time}
                  </Span>
                  <Span>{entry.what}</Span>
                </List.Item>
              ))}
            </List.Root>
          </Box>
        )}

        {stops.length > 0 && (
          <Box as="section" aria-labelledby="day-stops">
            <SectionLabel id="day-stops">Görülecek</SectionLabel>
            <StopsSection stops={stops} dayItems={dayBudget?.items ?? []} />
          </Box>
        )}

        {food.length > 0 && (
          <Box as="section" aria-labelledby="day-food">
            <SectionLabel id="day-food">Yemek</SectionLabel>
            <FoodSection dayId={day.id} food={food} />
          </Box>
        )}

        <Stack gap="2">
          {shopping.length > 0 && (
            <Disclosure title="Alışveriş" count={shopping.length}>
              <ShoppingSection shopping={shopping} />
            </Disclosure>
          )}
          <Disclosure title="Rota & sürüş" hint={formatDriving(drivingMinutes)}>
            <RouteSection day={day} />
          </Disclosure>
          {hasTailNotes(day, dayGaps) && (
            <Disclosure title="Notlar">
              <DayNotes day={day} gaps={dayGaps} />
            </Disclosure>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function SectionLabel({ id, children }: { readonly id: string; readonly children: ReactNode }) {
  return (
    <Heading as="h2" id={id} mb="1.5" textStyle="eyebrow" color="fg.muted">
      {children}
    </Heading>
  );
}

function Stat({
  label,
  value,
  last = false,
}: {
  readonly label: string;
  readonly value: ReactNode;
  readonly last?: boolean;
}) {
  return (
    <Box px="3" py="2" borderInlineEndWidth={last ? '0' : '1px'} borderColor="border">
      <Eyebrow as="dt" fontWeight="normal">
        {label}
      </Eyebrow>
      <Box as="dd" textStyle="displayMd">
        {value}
      </Box>
    </Box>
  );
}

export function dayRoute(dayId: string): Route {
  return { name: 'day', dayId };
}
