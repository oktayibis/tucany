import { Box, Circle, HStack, List, Span, chakra } from '@chakra-ui/react';
import type { ReactNode } from 'react';

/**
 * One tappable line in the day's flow — a stop or a meal. The whole row opens
 * a detail sheet, so a row carries only what you scan for while moving: what
 * it is, roughly how long, what it costs. Everything else (why, hours, pork
 * notes, nav, phone) is one tap away and nothing is lost.
 *
 * Rows are hairline-separated inside a single bordered card rather than being
 * cards themselves; a ten-stop day used to be ten stacked boxes.
 */
const RowButton = chakra('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    w: 'full',
    minH: '11',
    px: '3',
    py: '3',
    textAlign: 'start',
    cursor: 'pointer',
    _hover: { bg: 'bg.subtle' },
  },
});

export function FlowRow({
  marker,
  name,
  meta,
  trailing,
  dimmed = false,
  onOpen,
}: {
  readonly marker?: ReactNode;
  readonly name: ReactNode;
  readonly meta?: ReactNode;
  readonly trailing?: ReactNode;
  readonly dimmed?: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <List.Item borderBottomWidth="1px" borderColor="border" _last={{ borderBottomWidth: 0 }}>
      <RowButton type="button" onClick={onOpen} opacity={dimmed ? 0.6 : 1}>
        {/* Always reserved, even when empty, so meal names line up with stop names. */}
        <Span display="flex" w="6" flexShrink={0} justifyContent="center">
          {marker}
        </Span>
        <Box minW="0" flex="1">
          <Span display="block" fontFamily="heading" fontWeight="medium">
            {name}
          </Span>
          {meta !== undefined && (
            <Span display="block" mt="0.5" fontSize="xs" color="fg.muted">
              {meta}
            </Span>
          )}
        </Box>
        {trailing !== undefined && (
          <Span flexShrink={0} textAlign="end" fontSize="sm" fontWeight="semibold">
            {trailing}
          </Span>
        )}
        <Span aria-hidden="true" flexShrink={0} fontFamily="heading" fontSize="md" color="fg.muted">
          ›
        </Span>
      </RowButton>
    </List.Item>
  );
}

/** The numbered dot in a stop row's marker slot; fills in once marked visited. */
export function StopMarker({
  index,
  visited,
}: {
  readonly index: number;
  readonly visited: boolean;
}) {
  return (
    <Circle
      aria-hidden="true"
      size="6"
      borderWidth="1px"
      fontFamily="heading"
      fontSize="xs"
      fontWeight="semibold"
      borderColor={visited ? 'safe' : 'accent'}
      bg={visited ? 'safe' : 'transparent'}
      color={visited ? 'white' : 'accent'}
    >
      {visited ? '✓' : index}
    </Circle>
  );
}

/** A single card wrapping a run of `FlowRow`s. */
export function FlowList({ children }: { readonly children: ReactNode }) {
  return (
    <List.Root layerStyle="card" listStyle="none" ms="0" gap="0">
      {children}
    </List.Root>
  );
}

/** The slot heading inside a `FlowList` ("Öğle", "Akşam") — a row, not a card. */
export function FlowGroupLabel({ children }: { readonly children: ReactNode }) {
  return (
    <List.Item borderBottomWidth="1px" borderColor="border" bg="bg.subtle" px="3" py="1.5">
      <HStack as="span" textStyle="eyebrow" color="fg.muted">
        {children}
      </HStack>
    </List.Item>
  );
}
