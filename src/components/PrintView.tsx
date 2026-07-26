import { Box, Heading, List, Span, Table, Text } from '@chakra-ui/react';
import { trip } from '../data/trip';
import {
  chosenOption,
  dayLineItems,
  effectiveDrivingMinutes,
  effectiveFood,
  effectiveShopping,
  effectiveStops,
  resolveOptionCost,
} from '../lib/budget';
import { effectiveWeekday } from '../lib/closures';
import { formatDayMonth, formatDriving, weekdayDisplay } from '../lib/dates';
import { euro } from '../lib/format';
import { gapsForDay } from '../lib/gaps';
import { MODE_INFO } from '../lib/modes';
import { ALL_CLOSURES, ALL_GAPS } from '../state/derived';
import { useTrip } from '../state/TripContext';

/**
 * The whole trip as one linear paper document — a PDF backup for when the
 * phone is dead or signal is gone entirely. Always mounted (see App.tsx),
 * hidden on screen and the only thing visible when printing (the app shell
 * gets the mirror-image `_print={{ display: 'none' }}`). Deliberately not the
 * interactive components: no buttons, no checkboxes that do nothing on paper,
 * no nav chrome — just what the brief asks for, one day per page.
 */
export function PrintView() {
  const { mode, party, chosenOptions, upgrades, budget } = useTrip();
  const input = { mode, party, chosenOptions, upgrades };

  return (
    <Box display="none" _print={{ display: 'block', color: 'black' }}>
      <Box as="header" mb="6">
        <Heading as="h1" fontSize="3xl" fontWeight="bold">
          {trip.trip.title}
        </Heading>
        <Text fontSize="sm">
          {formatDayMonth(trip.trip.startDate)} – {formatDayMonth(trip.trip.endDate)} ·{' '}
          {trip.trip.nights} gece · {trip.base.name} · {trip.base.phone}
        </Text>
        <Text fontSize="sm">
          Bütçe modu: {MODE_INFO[mode].label} · {party.adults} yetişkin + {party.children} çocuk ·
          Toplam: {euro(budget.grandTotal)} (yakıt/otoyol/otopark dahil)
        </Text>
        <List.Root mt="2" fontSize="sm" listStyle="none" ms="0">
          {trip.trip.constraints.map((constraint) => (
            <List.Item key={constraint}>• {constraint}</List.Item>
          ))}
        </List.Root>
      </Box>

      {trip.days.map((day, index) => {
        const closures = ALL_CLOSURES.find((candidate) => candidate.dayId === day.id);
        const gaps = gapsForDay(ALL_GAPS, day.id);
        const items = dayLineItems(day, input);
        const option = chosenOption(day, input);
        const weekday = closures?.weekday ?? effectiveWeekday(day);
        const stops = effectiveStops(day, option);
        const food = effectiveFood(day, option);
        const shopping = effectiveShopping(day, option);

        return (
          <Box as="section" key={day.id} css={{ breakAfter: 'page' }}>
            <Heading as="h2" fontSize="2xl" fontWeight="bold">
              {index + 1}. Gün · {weekdayDisplay(weekday)} · {formatDayMonth(day.date)} — {day.title}
            </Heading>
            <Text fontSize="sm">Sürüş: {formatDriving(effectiveDrivingMinutes(day, option))}</Text>

            {(day.warnings.length > 0 || (closures?.blocking.length ?? 0) > 0) && (
              <Box mt="1" borderWidth="1px" borderColor="black" p="2" fontSize="sm">
                <Span fontWeight="bold">Dikkat:</Span>
                <List.Root listStyle="none" ms="0">
                  {day.warnings.map((warning) => (
                    <List.Item key={warning}>⚠ {warning}</List.Item>
                  ))}
                  {closures?.blocking.map((thing) => (
                    <List.Item key={thing.name}>
                      ⚠ {thing.name} bugün ({weekdayDisplay(weekday)}) kapalı.
                    </List.Item>
                  ))}
                </List.Root>
              </Box>
            )}

            <PrintHeading>Rota / navigasyon</PrintHeading>
            {day.timeline !== undefined && (
              <List.Root as="ol" fontSize="sm" listStyle="none" ms="0">
                {day.timeline.map((entry) => (
                  <List.Item key={entry.time}>
                    {entry.time} — {entry.what}
                  </List.Item>
                ))}
              </List.Root>
            )}

            <PrintHeading>Görülecek</PrintHeading>
            {day.options !== undefined && (
              <List.Root fontSize="sm" listStyle="none" ms="0">
                {day.options.map((opt) => (
                  <List.Item key={opt.id}>
                    {opt.id === option?.id ? '☑' : '☐'} <Span fontWeight="bold">{opt.label}</Span> (
                    {euro(resolveOptionCost(opt.cost, mode))}) — {opt.desc}
                  </List.Item>
                ))}
              </List.Root>
            )}
            {stops.length > 0 && (
              <List.Root fontSize="sm" listStyle="none" ms="0">
                {stops.map((stop) => {
                  const item = items.find((line) => line.id === stop.id);
                  const dropped = stop.tier === 'skip' || stop.tier === 'removed';
                  return (
                    <List.Item key={stop.id} fontStyle={dropped ? 'italic' : 'normal'}>
                      ☐ <Span fontWeight="bold">{stop.name}</Span>
                      {item !== undefined && ` — ${euro(item.amount)}`}
                      {dropped && ` — atlandı: ${stop.skipReason ?? stop.removedReason ?? ''}`}
                      {stop.why !== undefined && ` — ${stop.why}`}
                    </List.Item>
                  );
                })}
              </List.Root>
            )}

            <PrintHeading>Yemek</PrintHeading>
            <List.Root fontSize="sm" listStyle="none" ms="0">
              {food.map((entry) => (
                <List.Item key={`${entry.slot}-${entry.name}`}>
                  <Span fontWeight="bold">{entry.name}</Span> ({euro(entry.price)})
                  {entry.porkWarning !== undefined && ` — ⚠ ${entry.porkWarning}`}
                  {entry.porkSafe === true && ' — ✓ domuzsuz'}
                  {entry.phone !== undefined && ` — Tel: ${entry.phone}`}
                </List.Item>
              ))}
            </List.Root>

            <PrintHeading>Alışveriş</PrintHeading>
            {shopping.length === 0 ? (
              <Text fontSize="sm">—</Text>
            ) : (
              <List.Root fontSize="sm" listStyle="none" ms="0">
                {shopping.map((entry) => (
                  <List.Item key={entry.name}>
                    <Span fontWeight="bold">{entry.name}</Span> — {entry.for}
                  </List.Item>
                ))}
              </List.Root>
            )}

            <PrintHeading>Notlar</PrintHeading>
            <List.Root fontSize="sm" listStyle="none" ms="0">
              {day.highlight !== undefined && <List.Item>★ {day.highlight}</List.Item>}
              {day.elderNote !== undefined && <List.Item>Anne için: {day.elderNote}</List.Item>}
              {day.revised !== undefined && <List.Item>Değişiklik: {day.revised}</List.Item>}
              {gaps.map((gap) => (
                <List.Item key={gap.id}>ⓘ {gap.what}</List.Item>
              ))}
            </List.Root>
          </Box>
        );
      })}

      <Box as="section">
        <Heading as="h2" fontSize="2xl" fontWeight="bold">
          Domuz rehberi
        </Heading>
        <Text fontSize="sm">
          <Span fontWeight="bold">Kaçının:</Span> {trip.porkGuide.avoid.join(', ')}
        </Text>
        <Text fontSize="sm">{trip.porkGuide.avoidNote}</Text>
        <Table.Root mt="1" w="full" size="sm" variant="line" fontSize="sm">
          <Table.Body>
            {trip.porkGuide.safe.map((dish) => (
              <Table.Row key={dish.dish} bg="transparent">
                <Table.Cell pe="2" fontWeight="semibold">
                  {dish.dish}
                </Table.Cell>
                <Table.Cell pe="2">{dish.desc}</Table.Cell>
                <Table.Cell>{dish.price}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <PrintHeading>Cümleler</PrintHeading>
        <List.Root fontSize="sm" listStyle="none" ms="0">
          {trip.phrases.map((phrase) => (
            <List.Item key={phrase.tr}>
              <Span fontWeight="bold">{phrase.it}</Span> — {phrase.tr}
            </List.Item>
          ))}
        </List.Root>
      </Box>
    </Box>
  );
}

function PrintHeading({ children }: { readonly children: string }) {
  return (
    <Heading as="h3" mt="3" fontSize="lg" fontWeight="semibold">
      {children}
    </Heading>
  );
}
