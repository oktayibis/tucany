import { HStack, List, Span, Stack } from '@chakra-ui/react';
import type { DayClosures } from '../lib/closures';

/**
 * Surfaces the day's own `warnings[]` plus anything the closure guard derived
 * from cross-referencing today's weekday against the closures table. Both are
 * shown the same way — this is not decoration, it's the reason a plan can be
 * trusted at all.
 */
export function WarningBanner({
  warnings,
  closures,
}: {
  readonly warnings: readonly string[];
  readonly closures: DayClosures;
}) {
  const items = [
    ...warnings,
    ...closures.blocking.map((thing) =>
      thing.note === undefined
        ? `${thing.name} bugün (${closures.weekday}) kapalı.`
        : `${thing.name} bugün (${closures.weekday}) kapalı. ${thing.note}`,
    ),
  ];

  if (items.length === 0) return null;

  return (
    <Stack
      role="alert"
      borderWidth="2px"
      borderColor="warn.border"
      bg="warn.bg"
      color="warn.fg"
      p="3"
    >
      <List.Root gap="1.5" fontSize="sm" fontWeight="semibold" listStyle="none" ms="0">
        {items.map((text) => (
          <List.Item key={text}>
            <HStack align="start" gap="2">
              <Span aria-hidden="true">⚠</Span>
              <Span>{text}</Span>
            </HStack>
          </List.Item>
        ))}
      </List.Root>
    </Stack>
  );
}
