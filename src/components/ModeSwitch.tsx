import { List, SegmentGroup, Stack, Text } from '@chakra-ui/react';
import { modeDelta } from '../lib/budget';
import { deltaPhrase } from '../lib/format';
import { MODES, MODE_INFO, otherModes, type Mode } from '../lib/modes';
import { useTrip } from '../state/TripContext';

/**
 * The three-way Keyif/Karma/Ucuz switch. Persistent and central: every price
 * on every screen reads from `useTrip().budget`, which is keyed off this
 * value, so changing it here instantly re-renders the whole trip.
 *
 * `SegmentGroup` brings the roving-focus/arrow-key behaviour a segmented
 * control is supposed to have; the sliding indicator is pinned to a hard
 * cobalt plate so it still reads as enamel signage rather than an iOS pill.
 */
export function ModeSwitch() {
  const { mode, setMode, budget } = useTrip();

  return (
    <Stack gap="1.5">
      <SegmentGroup.Root
        value={mode}
        onValueChange={(event) => {
          if (event.value !== null) setMode(event.value as Mode);
        }}
        aria-label="Bütçe modu"
        layerStyle="card"
        gap="0"
        p="0"
        rounded="l1"
      >
        <SegmentGroup.Indicator bg="accent" rounded="l1" shadow="none" />
        {MODES.map((candidate) => (
          <SegmentGroup.Item
            key={candidate}
            value={candidate}
            flex="1"
            minH="11"
            justifyContent="center"
            px="4"
            py="2"
            fontFamily="heading"
            fontSize="sm"
            fontWeight="semibold"
            color="fg.muted"
            cursor="pointer"
            borderInlineEndWidth="1px"
            borderColor="border"
            _last={{ borderInlineEndWidth: 0 }}
            _checked={{ color: 'accent.fg' }}
          >
            <SegmentGroup.ItemText>{MODE_INFO[candidate].label}</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        ))}
      </SegmentGroup.Root>

      <Text fontSize="xs" color="fg.muted">
        {MODE_INFO[mode].gist}
      </Text>
      <ModeDeltaLine mode={mode} totals={budget.totalsByMode} />
    </Stack>
  );
}

/** "Karma modda €230 daha az" — legible trade-off against the other modes. */
function ModeDeltaLine({
  mode,
  totals,
}: {
  readonly mode: Mode;
  readonly totals: Readonly<Record<Mode, number>>;
}) {
  return (
    <List.Root gap="0.5" fontSize="xs" color="fg.muted" listStyle="none" ms="0">
      {otherModes(mode).map((other) => {
        const delta = modeDelta(totals, mode, other);
        return (
          <List.Item key={other}>
            {MODE_INFO[other].label} modda {deltaPhrase(delta)}
          </List.Item>
        );
      })}
    </List.Root>
  );
}
