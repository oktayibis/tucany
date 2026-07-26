import { Box, Flex, HStack, Link, List, Span, Stack, Text, Wrap } from '@chakra-ui/react';
import type { Day } from '../data/schema';
import { trip } from '../data/trip';
import { formatDriving } from '../lib/dates';
import { getDayRoute } from '../lib/routes';
import { NavButton, PhoneButton } from './NavButton';
import { RatingBadge } from './RatingBadge';
import { Eyebrow } from './ui/primitives';

/**
 * The driving detail for a day: first leg out of the hotel, the per-leg
 * breakdown, and the hotel's own card.
 *
 * All of it lives inside a collapsed disclosure in `DayDetail`. It used to
 * open every day at full height — including a hotel card identical on all ten
 * days — above the stops the family actually came to see. The one number worth
 * seeing without opening anything (total driving) is hoisted into the day
 * header's stat strip instead.
 */
export function RouteSection({ day }: { readonly day: Day }) {
  const dayRoute = getDayRoute(day);

  return (
    <Stack gap="4" fontSize="sm">
      {dayRoute !== undefined && (
        <Box>
          <Eyebrow>İlk durak</Eyebrow>
          <Text mt="0.5" fontFamily="heading" fontWeight="medium">
            Otel → {dayRoute.starterRoute.destination}
          </Text>
          <Text mt="0.5" fontSize="xs" color="fg.muted">
            {formatDriving(dayRoute.starterRoute.durationMin)} · ~{dayRoute.starterRoute.km} km
          </Text>
          <Box mt="2">
            <NavButton
              place={{
                name: dayRoute.starterRoute.destination,
                nav: dayRoute.starterRoute.navUrl,
              }}
            />
          </Box>
        </Box>
      )}

      {dayRoute !== undefined && dayRoute.legs.length > 0 && (
        <Box>
          <Eyebrow>Etaplar (~{dayRoute.totalKm} km)</Eyebrow>
          <List.Root mt="1" gap="0" listStyle="none" ms="0">
            {dayRoute.legs.map((leg) => (
              <List.Item
                key={`${leg.from}-${leg.to}`}
                borderBottomWidth="1px"
                borderColor="border"
                py="1.5"
                fontSize="xs"
                _last={{ borderBottomWidth: 0 }}
              >
                <Flex wrap="wrap" align="center" justify="space-between" gap="2">
                  <Span fontWeight="medium">
                    {leg.from} → {leg.to}
                  </Span>
                  <HStack gap="2" color="fg.muted">
                    <Span fontWeight="semibold" color="accent">
                      {formatDriving(leg.durationMin)}
                    </Span>
                    <Span>{leg.km} km</Span>
                    {leg.navUrl !== undefined && (
                      <Link
                        href={leg.navUrl}
                        target="_blank"
                        rel="noreferrer"
                        fontWeight="semibold"
                        color="accent"
                        textDecoration="underline"
                      >
                        Aç
                      </Link>
                    )}
                  </HStack>
                </Flex>
              </List.Item>
            ))}
          </List.Root>
        </Box>
      )}

      <Box borderTopWidth="1px" borderColor="border" pt="3">
        <Eyebrow>Otel (başlangıç &amp; dönüş)</Eyebrow>
        <HStack mt="0.5" gap="2">
          <Text fontFamily="heading" fontWeight="medium">
            {trip.base.name}
          </Text>
          <RatingBadge rating={trip.base.rating} />
        </HStack>
        <Text fontSize="xs" color="fg.muted">
          {trip.base.address}
        </Text>
        <Wrap mt="2" gap="2" align="center">
          <NavButton place={trip.base} />
          <PhoneButton phone={trip.base.phone} />
        </Wrap>
      </Box>
    </Stack>
  );
}
