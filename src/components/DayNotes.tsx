import { List, Span, Stack, Text } from '@chakra-ui/react';
import type { Day } from '../data/schema';
import type { Gap } from '../lib/gaps';

/**
 * The two notes worth reading before the day starts, kept above the fold in
 * `DayDetail`: what makes this day the day, and what Anne needs to know.
 * Everything more archival (`revised`, data gaps) is in `DayNotes` below.
 */
export function DayHeadNotes({ day }: { readonly day: Day }) {
  if (day.highlight === undefined && day.elderNote === undefined) return null;

  return (
    <Stack gap="2" fontSize="sm">
      {day.highlight !== undefined && (
        <Text
          borderStartWidth="2px"
          borderColor="accentAlt"
          bg="warn.bg"
          color="warn.fg"
          fontWeight="medium"
          px="3"
          py="2"
        >
          ★ {day.highlight}
        </Text>
      )}
      {day.elderNote !== undefined && (
        <Text borderStartWidth="2px" borderColor="border" color="fg.muted" px="3" py="2">
          <Span fontFamily="heading" fontWeight="semibold" color="fg">
            Anne için:{' '}
          </Span>
          {day.elderNote}
        </Text>
      )}
    </Stack>
  );
}

/** Returns whether `DayNotes` would render anything, so the caller can skip the disclosure. */
export function hasTailNotes(day: Day, gaps: readonly Gap[]): boolean {
  return day.revised !== undefined || gaps.length > 0;
}

/** The archival half: a change already applied to the plan, and this day's data gaps. */
export function DayNotes({ day, gaps }: { readonly day: Day; readonly gaps: readonly Gap[] }) {
  return (
    <Stack gap="3" fontSize="sm">
      {day.revised !== undefined && (
        <Text color="fg.muted">
          <Span fontFamily="heading" fontWeight="semibold" color="fg">
            Değişiklik:{' '}
          </Span>
          {day.revised}
        </Text>
      )}
      {gaps.length > 0 && (
        <List.Root gap="1" fontSize="xs" color="fg.muted" listStyle="none" ms="0">
          {gaps.map((gap) => (
            <List.Item key={gap.id}>ⓘ {gap.what}</List.Item>
          ))}
        </List.Root>
      )}
    </Stack>
  );
}
