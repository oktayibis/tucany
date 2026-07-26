import { Badge, List, Span, Stack, Text, Wrap } from '@chakra-ui/react';
import { useState } from 'react';
import type { Stop } from '../data/schema';
import type { LineItem } from '../lib/budget';
import { euro } from '../lib/format';
import { useTrip } from '../state/TripContext';
import { Disclosure } from './Disclosure';
import { FlowList, FlowRow, StopMarker } from './FlowRow';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';
import { StopSheet } from './StopSheet';

/**
 * The visitable part of the day, as numbered rows in visiting order (the order
 * the plan author wrote them in — the data carries no clock times for stops,
 * so nothing here invents one). Tapping a row opens `StopSheet`.
 *
 * `skip`/`removed` stops still collapse into one "Neden atlıyoruz" disclosure:
 * the reasoning is half the value of the plan, it just isn't worth scrolling
 * past on the way to what you *are* doing.
 *
 * `stops` is already resolved by the caller (day + selected option merged,
 * conditional stops filtered) — this component just renders what it is given.
 */
export function StopsSection({
  stops,
  dayItems,
}: {
  readonly stops: readonly Stop[];
  readonly dayItems: readonly LineItem[];
}) {
  const { visited } = useTrip();
  const [open, setOpen] = useState<Stop | null>(null);

  const visible = stops.filter((stop) => stop.tier === 'core' || stop.tier === 'optional');
  const dropped = stops.filter((stop) => stop.tier === 'skip' || stop.tier === 'removed');
  const savedTotal = dropped.reduce((sum, stop) => sum + (stop.cost ?? 0), 0);

  return (
    <Stack gap="3">
      {visible.length > 0 && (
        <FlowList>
          {visible.map((stop, index) => {
            const item = dayItems.find((candidate) => candidate.id === stop.id);
            return (
              <FlowRow
                key={stop.id}
                marker={<StopMarker index={index + 1} visited={visited.has(stop.id)} />}
                name={
                  <Wrap as="span" align="center" gap="1.5">
                    {stop.name}
                    <RatingBadge rating={stop.rating} />
                    {stop.badge !== undefined && (
                      <Badge
                        variant="plain"
                        bg="accentAlt.subtle"
                        color="warn.fg"
                        px="1.5"
                        py="0.5"
                        fontSize="xs"
                        fontWeight="semibold"
                      >
                        {stop.badge}
                      </Badge>
                    )}
                  </Wrap>
                }
                meta={<StopMeta stop={stop} />}
                trailing={<StopPrice stop={stop} item={item} />}
                dimmed={visited.has(stop.id)}
                onOpen={() => setOpen(stop)}
              />
            );
          })}
        </FlowList>
      )}

      {dropped.length > 0 && (
        <Disclosure
          title="Neden atlıyoruz?"
          count={dropped.length}
          hint={savedTotal > 0 ? `${euro(savedTotal)} tasarruf` : undefined}
        >
          <List.Root gap="3" listStyle="none" ms="0">
            {dropped.map((stop) => (
              <List.Item key={stop.id}>
                <Text fontSize="sm" fontWeight="semibold">
                  {stop.name}
                  {stop.cost !== undefined && stop.cost > 0 && (
                    <Span ms="2" fontWeight="normal" color="fg.muted">
                      ({euro(stop.cost)} tasarruf)
                    </Span>
                  )}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {stop.skipReason ?? stop.removedReason ?? stop.why}
                </Text>
              </List.Item>
            ))}
          </List.Root>
        </Disclosure>
      )}

      {open !== null && (
        <StopSheet
          stop={open}
          item={dayItems.find((candidate) => candidate.id === open.id)}
          onClose={() => setOpen(null)}
        />
      )}
    </Stack>
  );
}

/** The one muted line under a stop's name: duration, then whichever timing hint exists. */
function StopMeta({ stop }: { readonly stop: Stop }) {
  const parts = [
    stop.durationMin === undefined ? undefined : `${stop.durationMin} dk`,
    stop.bestTime === undefined ? undefined : `en iyi ${stop.bestTime}`,
    stop.tier === 'optional' ? 'opsiyonel' : undefined,
  ].filter((part): part is string => part !== undefined);

  if (parts.length === 0) return null;
  return <>{parts.join(' · ')}</>;
}

function StopPrice({ stop, item }: { readonly stop: Stop; readonly item: LineItem | undefined }) {
  if (item !== undefined) return <PriceTag amount={item.amount} />;
  if (stop.cost === undefined || stop.cost === 0)
    return (
      <Span fontWeight="normal" color="fg.muted">
        Ücretsiz
      </Span>
    );
  return (
    <Span fontSize="xs" fontWeight="normal" color="fg.muted">
      dahil değil
    </Span>
  );
}
