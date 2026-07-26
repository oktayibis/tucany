import {
  Box,
  Dialog,
  Heading,
  List,
  Portal,
  Span,
  Stack,
  Table,
  Tabs,
  Text,
  Wrap,
  chakra,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { Phrase, PorkGuide as PorkGuideData } from '../data/schema';
import { trip } from '../data/trip';
import { Eyebrow, SignButton } from './ui/primitives';

type Tab = 'guide' | 'phrases';

const CATEGORY_LABEL: Readonly<Record<Phrase['category'], string>> = {
  pork: 'Domuz',
  market: 'Pazar',
  restaurant: 'Restoran',
  general: 'Genel',
};

/**
 * Reachable from the bottom bar on every screen — this is the one thing that
 * must never take more than one tap, since the whole point is being usable
 * mid-order, not after looking something up first.
 */
export function PorkGuide({
  tab,
  onTabChange,
}: {
  readonly tab: Tab;
  readonly onTabChange: (tab: Tab) => void;
}) {
  const { porkGuide, phrases } = trip;

  return (
    <Stack mx="auto" maxW="2xl" gap="4" p="4" pb="24">
      <Heading as="h1" textStyle="displayLg">
        Domuz rehberi
      </Heading>

      <Tabs.Root
        value={tab}
        onValueChange={(event) => onTabChange(event.value as Tab)}
        variant="plain"
        lazyMount
      >
        <Tabs.List layerStyle="card" w="full" gap="0" rounded="l1">
          <PorkTab value="guide">Kaçın / Güvenli</PorkTab>
          <PorkTab value="phrases">Cümleler</PorkTab>
        </Tabs.List>

        <Tabs.Content value="guide" pt="4" px="0">
          <GuideTab guide={porkGuide} />
        </Tabs.Content>
        <Tabs.Content value="phrases" pt="4" px="0">
          <PhrasesTab phrases={phrases} />
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}

function PorkTab({ value, children }: { readonly value: Tab; readonly children: string }) {
  return (
    <Tabs.Trigger
      value={value}
      flex="1"
      justifyContent="center"
      minH="11"
      fontFamily="heading"
      fontSize="sm"
      fontWeight="semibold"
      color="fg.muted"
      rounded="l1"
      _selected={{ bg: 'accent', color: 'accent.fg' }}
    >
      {children}
    </Tabs.Trigger>
  );
}

function GuideTab({ guide }: { readonly guide: PorkGuideData }) {
  const { avoid, avoidNote, safe, caution } = guide;
  return (
    <Stack gap="5">
      <Box as="section" borderWidth="2px" borderColor="danger" bg="danger.bg" p="3">
        <Heading as="h2" fontSize="md" fontWeight="semibold" color="danger">
          Bunlardan kaçının
        </Heading>
        <Text mt="1" fontSize="sm" color="danger">
          {avoidNote}
        </Text>
        <Wrap as="ul" mt="2" gap="1.5" listStyleType="none">
          {avoid.map((item) => (
            <chakra.li
              key={item}
              borderWidth="1px"
              borderColor="danger"
              bg="bg.panel"
              px="2"
              py="1"
              fontSize="sm"
              fontWeight="medium"
              color="danger"
            >
              {item}
            </chakra.li>
          ))}
        </Wrap>
      </Box>

      <Box as="section">
        <Heading as="h2" fontSize="md" fontWeight="semibold">
          Güvenli yemekler
        </Heading>
        {/* Plain `overflowX` rather than `Table.ScrollArea`: the scroll area
            sizes the table to its content, which pushes the price column off
            a phone screen. A full-width table wraps the description instead,
            so all three columns stay visible without sideways scrolling. */}
        <Box mt="2" overflowX="auto">
          <Table.Root w="full" size="sm" variant="line" fontSize="sm" tableLayout="auto">
            <Table.Header>
              <Table.Row bg="transparent">
                <TableHead>Yemek</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Fiyat</TableHead>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {safe.map((dish) => (
                <Table.Row key={dish.dish} bg="transparent" borderColor="border">
                  <Table.Cell py="2" pe="2" fontWeight="semibold" color="safe">
                    {dish.dish}
                  </Table.Cell>
                  <Table.Cell py="2" pe="2">
                    {dish.desc}
                  </Table.Cell>
                  <Table.Cell py="2" fontVariantNumeric="tabular-nums" color="fg.muted">
                    {dish.price}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      {caution.length > 0 && (
        <Box
          as="section"
          borderWidth="1px"
          borderColor="warn.border"
          bg="warn.bg"
          color="warn.fg"
          p="3"
        >
          <Heading as="h2" fontSize="md" fontWeight="semibold">
            Sor, emin olma
          </Heading>
          <List.Root mt="1" gap="1" fontSize="sm" listStyle="none" ms="0">
            {caution.map((item) => (
              <List.Item key={item.dish}>
                <Span fontWeight="semibold">{item.dish}:</Span> {item.note}
              </List.Item>
            ))}
          </List.Root>
        </Box>
      )}
    </Stack>
  );
}

function TableHead({ children }: { readonly children: string }) {
  return (
    <Table.ColumnHeader
      py="1.5"
      pe="2"
      textAlign="start"
      textStyle="eyebrow"
      fontWeight="medium"
      color="fg.muted"
      borderColor="border"
    >
      {children}
    </Table.ColumnHeader>
  );
}

const PhraseButton = chakra('button', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    w: 'full',
    minH: '11',
    layerStyle: 'card',
    p: '3',
    textAlign: 'start',
    cursor: 'pointer',
    _hover: { bg: 'bg.subtle' },
  },
});

function PhrasesTab({ phrases }: { readonly phrases: readonly Phrase[] }) {
  const [fullscreen, setFullscreen] = useState<Phrase | null>(null);

  return (
    <Stack gap="2">
      <Text fontSize="sm" color="fg.muted">
        Bir cümleye dokun, tam ekran büyüsün — telefonu çevirip garsona göster.
      </Text>
      <List.Root gap="2" listStyle="none" ms="0">
        {phrases.map((phrase) => (
          <List.Item key={phrase.tr}>
            <PhraseButton type="button" onClick={() => setFullscreen(phrase)}>
              <Eyebrow fontWeight="medium">{CATEGORY_LABEL[phrase.category]}</Eyebrow>
              <Span fontSize="md" fontWeight="semibold">
                {phrase.it}
              </Span>
              <Span fontSize="sm" color="fg.muted">
                {phrase.tr}
              </Span>
            </PhraseButton>
          </List.Item>
        ))}
      </List.Root>

      {fullscreen !== null && (
        <FullscreenPhrase phrase={fullscreen} onClose={() => setFullscreen(null)} />
      )}
    </Stack>
  );
}

function FullscreenPhrase({
  phrase,
  onClose,
}: {
  readonly phrase: Phrase;
  readonly onClose: () => void;
}) {
  // Short phrases ("Il conto, per favore") get the full dramatic size; the
  // one long explanatory sentence about pork needs to actually fit, so size
  // steps down by length rather than using one fixed size for everything.
  const fontSize = phrase.it.length <= 40 ? '6xl' : phrase.it.length <= 80 ? '5xl' : '3xl';

  return (
    <Dialog.Root
      open
      onOpenChange={(event) => {
        if (!event.open) onClose();
      }}
      size="full"
      motionPreset="none"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Positioner>
          <Dialog.Content bg="bg.panel" color="fg" rounded="none" aria-label="Büyütülmüş cümle">
            {/* Body owns the scroll; the inner stack uses min-height rather
                than a fixed height so a short phrase centres while the one
                long one can grow and scroll without stranding its top edge. */}
            <Dialog.Body display="flex" p="0">
              <Stack minH="full" w="full" align="center" justify="center" gap="8" p="6">
                <Dialog.Title
                  textAlign="center"
                  fontFamily="body"
                  fontSize={fontSize}
                  fontWeight="bold"
                  lineHeight="1.1"
                  textWrap="balance"
                >
                  {phrase.it}
                </Dialog.Title>
                <Text textAlign="center" fontSize="xl" color="fg.muted">
                  {phrase.tr}
                </Text>
                <Dialog.CloseTrigger asChild position="static">
                  <SignButton flexShrink={0} bg="bg.subtle" color="fg" px="6" py="3">
                    Kapat
                  </SignButton>
                </Dialog.CloseTrigger>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
