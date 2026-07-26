import { Box, Flex, Heading, Link, List, Span, Stack, Wrap } from '@chakra-ui/react';
import type { Booking, Priority } from '../data/schema';
import { trip } from '../data/trip';
import { euro } from '../lib/format';
import { telHref } from '../lib/nav';
import { bookingKey, packingKey, type PackingCategory } from '../state/keys';
import { useTrip } from '../state/TripContext';
import { CheckRow, Eyebrow } from './ui/primitives';

const PACKING_LABEL: Readonly<Record<PackingCategory, string>> = {
  documents: 'Belgeler',
  tech: 'Teknoloji',
  heat: 'Sıcak + anne için',
  emergency: 'Acil durum',
};

const PRIORITY_STYLE: Readonly<
  Record<Priority, { readonly borderColor: string; readonly bg: string; readonly color: string }>
> = {
  high: { borderColor: 'danger', bg: 'danger.bg', color: 'danger' },
  medium: { borderColor: 'warn.border', bg: 'warn.bg', color: 'warn.fg' },
  low: { borderColor: 'border', bg: 'bg.subtle', color: 'fg.muted' },
  optional: { borderColor: 'border', bg: 'bg.subtle', color: 'fg.muted' },
};

/**
 * "Listeler": the three checklists the brief asks for — bookings, packing,
 * and (as a trip-wide overview) which stops are already ticked "gezildi" from
 * the day-detail screens. Everything persists to localStorage keyed by
 * `DATA_VERSION`, so a data update never silently wipes progress already made.
 */
export function Checklists() {
  const { bookingsDone, packingDone, visited } = useTrip();

  const visitableStops = trip.days.flatMap((day) =>
    day.stops
      .filter((stop) => stop.tier === 'core' || stop.tier === 'optional')
      .map((stop) => ({ dayTitle: day.title, stop })),
  );
  const visitedCount = visitableStops.filter(({ stop }) => visited.has(stop.id)).length;

  return (
    <Stack mx="auto" maxW="2xl" gap="6" p="4" pb="24">
      <Heading as="h1" textStyle="displayLg">
        Listeler
      </Heading>

      <Box as="section">
        <Heading as="h2" fontSize="md" fontWeight="semibold">
          Rezervasyonlar
        </Heading>
        <List.Root mt="2" gap="2" listStyle="none" ms="0">
          {trip.bookings.map((booking) => (
            <BookingRow
              key={bookingKey(booking)}
              booking={booking}
              done={bookingsDone.has(bookingKey(booking))}
              onToggle={() => bookingsDone.toggle(bookingKey(booking))}
            />
          ))}
        </List.Root>
      </Box>

      <Box as="section">
        <Heading as="h2" fontSize="md" fontWeight="semibold">
          Bavul listesi
        </Heading>
        <Stack mt="2" gap="4">
          {(Object.keys(trip.packing) as PackingCategory[]).map((category) => (
            <Box key={category}>
              <Eyebrow as="h3">{PACKING_LABEL[category]}</Eyebrow>
              <List.Root mt="1" gap="1" listStyle="none" ms="0">
                {trip.packing[category].map((item, index) => {
                  const key = packingKey(category, index);
                  const done = packingDone.has(key);
                  return (
                    <List.Item key={key} layerStyle="card" px="3" py="2" fontSize="sm">
                      <CheckRow checked={done} onToggle={() => packingDone.toggle(key)} w="full">
                        <Span
                          color={done ? 'fg.muted' : 'fg'}
                          textDecoration={done ? 'line-through' : 'none'}
                        >
                          {item}
                        </Span>
                      </CheckRow>
                    </List.Item>
                  );
                })}
              </List.Root>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box as="section">
        <Heading as="h2" fontSize="md" fontWeight="semibold">
          Gezilenler ({visitedCount}/{visitableStops.length})
        </Heading>
        <List.Root mt="2" gap="1" listStyle="none" ms="0">
          {visitableStops.map(({ dayTitle, stop }) => {
            const done = visited.has(stop.id);
            return (
              <List.Item key={stop.id} layerStyle="card" px="3" py="2" fontSize="sm">
                <CheckRow checked={done} onToggle={() => visited.toggle(stop.id)} w="full">
                  <Stack as="span" gap="0">
                    <Span
                      color={done ? 'fg.muted' : 'fg'}
                      textDecoration={done ? 'line-through' : 'none'}
                    >
                      {stop.name}
                    </Span>
                    <Span fontSize="xs" color="fg.muted">
                      {dayTitle}
                    </Span>
                  </Stack>
                </CheckRow>
              </List.Item>
            );
          })}
        </List.Root>
      </Box>
    </Stack>
  );
}

function BookingRow({
  booking,
  done,
  onToggle,
}: {
  readonly booking: Booking;
  readonly done: boolean;
  readonly onToggle: () => void;
}) {
  const priority = PRIORITY_STYLE[booking.priority];

  return (
    <List.Item layerStyle="card" p="3">
      <Flex wrap="wrap" align="start" justify="space-between" gap="2">
        <CheckRow checked={done} onToggle={onToggle} fontFamily="heading" fontWeight="medium">
          <Span color={done ? 'fg.muted' : 'fg'} textDecoration={done ? 'line-through' : 'none'}>
            {booking.what}
          </Span>
        </CheckRow>
        <Span fontSize="sm" fontWeight="semibold" fontVariantNumeric="tabular-nums">
          {euro(booking.cost)}
        </Span>
      </Flex>

      <Wrap mt="1.5" ps="7" align="center" gap="2">
        <Span
          borderWidth="1px"
          borderColor={priority.borderColor}
          bg={priority.bg}
          color={priority.color}
          px="1.5"
          py="0.5"
          fontSize="xs"
          fontWeight="semibold"
        >
          {booking.when}
        </Span>
        <Span fontSize="xs" color="fg.muted">
          {booking.how}
        </Span>
      </Wrap>

      {/\+\d/.test(booking.how) && (
        <Link
          href={telHref(booking.how)}
          ms="7"
          mt="1"
          display="inline-block"
          fontSize="xs"
          fontWeight="semibold"
          color="accent"
        >
          Telefonu ara
        </Link>
      )}
    </List.Item>
  );
}
