import { Badge, Flex, Heading, Span, Wrap, chakra } from '@chakra-ui/react';
import type { Day } from '../data/schema';
import { formatDayMonth, weekdayDisplay } from '../lib/dates';
import { IntensityMeter } from './IntensityMeter';
import { PriceTag } from './PriceTag';

const CardButton = chakra('button', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5',
    w: 'full',
    minH: '11',
    p: '3',
    textAlign: 'start',
    bg: 'bg.panel',
    cursor: 'pointer',
    _hover: { bg: 'bg.subtle' },
  },
});

/**
 * One waypoint's content on the route. The dot and connecting line live in
 * `DayList` (they're a property of the list, not of one card); this is just
 * the signage-plate card sitting next to that dot.
 */
export function DayCard({
  day,
  index,
  total,
  drivingMinutes,
  undecided,
  isToday,
  onOpen,
}: {
  readonly day: Day;
  readonly index: number;
  readonly total: number;
  readonly drivingMinutes: number;
  readonly undecided: boolean;
  readonly isToday: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <CardButton
      type="button"
      onClick={onOpen}
      aria-current={isToday ? 'date' : undefined}
      borderWidth={isToday ? '2px' : '1px'}
      borderColor={isToday ? 'accent' : 'border'}
    >
      <Flex align="center" justify="space-between" gap="2" w="full">
        <Span textStyle="eyebrow" fontWeight="medium" color="fg.muted">
          {index + 1}. gün · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
        </Span>
        <Flex as="span" align="center" gap="1.5">
          {isToday && (
            <Badge variant="plain" bg="accent" color="accent.fg" px="1.5" py="0.5" textStyle="eyebrow">
              Bugün
            </Badge>
          )}
          {day.starred === true && (
            <Span aria-hidden="true" color="accentAlt">
              ★
            </Span>
          )}
        </Flex>
      </Flex>

      <Heading as="h2" fontSize="md" fontWeight="medium">
        {day.title}
      </Heading>

      {undecided && (
        <Badge
          variant="plain"
          alignSelf="start"
          bg="warn.bg"
          color="warn.fg"
          px="1.5"
          py="0.5"
          fontSize="xs"
          fontWeight="semibold"
        >
          Karar verilmedi
        </Badge>
      )}

      <Wrap align="center" gap="3" w="full" fontSize="sm" color="fg.muted">
        <IntensityMeter intensity={day.intensity} />
        <Span>{drivingMinutes} dk sürüş</Span>
        <Span ms="auto" fontFamily="heading" fontSize="md" fontWeight="semibold" color="fg">
          <PriceTag amount={total} />
        </Span>
      </Wrap>
    </CardButton>
  );
}
