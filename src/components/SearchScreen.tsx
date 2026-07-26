import { Button, Heading, Input, List, Span, Stack, Text, Wrap, chakra } from '@chakra-ui/react';
import { useMemo, useState, type ReactNode } from 'react';
import type { StopTier, Theme } from '../data/schema';
import { trip } from '../data/trip';
import {
  EMPTY_FILTERS,
  hasActiveFilter,
  search,
  type SearchFilters,
  type SearchResultKind,
} from '../lib/search';

const THEME_LABEL: Readonly<Record<Theme, string>> = {
  arrival: 'Varış',
  local: 'Yerel',
  city: 'Şehir',
  market: 'Pazar',
  rest: 'Dinlenme',
  scenic: 'Manzara',
  craft: 'Zanaat',
  departure: 'Dönüş',
  plaj: 'Plaj',
};

const TIER_LABEL: Readonly<Record<StopTier, string>> = {
  core: 'Ana durak',
  optional: 'Opsiyonel',
  skip: 'Atlanan',
  removed: 'Çıkarılan',
};

const KIND_LABEL: Readonly<Record<SearchResultKind, string>> = {
  stop: 'Durak',
  food: 'Yemek',
  shopping: 'Alışveriş',
  phrase: 'Cümle',
};

const THEMES = Object.keys(THEME_LABEL) as Theme[];
const TIERS = Object.keys(TIER_LABEL) as StopTier[];

const ResultButton = chakra('button', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    w: 'full',
    minH: '11',
    layerStyle: 'card',
    p: '3',
    textAlign: 'start',
    cursor: 'pointer',
    _hover: { bg: 'bg.subtle' },
  },
});

export function SearchScreen({ onOpenDay }: { readonly onOpenDay: (dayId: string) => void }) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const results = useMemo(() => search(trip, filters), [filters]);

  return (
    <Stack mx="auto" maxW="2xl" gap="4" p="4" pb="24">
      <Heading as="h1" textStyle="displayLg">
        Ara
      </Heading>

      <Input
        type="search"
        value={filters.query}
        onChange={(event) => setFilters({ ...filters, query: event.target.value })}
        placeholder="Durak, yemek, alışveriş, cümle ara…"
        aria-label="Ara"
        minH="11"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
        rounded="l1"
        fontSize="md"
        px="3"
      />

      <Stack gap="2">
        <FilterRow label="Tema">
          {THEMES.map((theme) => (
            <FilterChip
              key={theme}
              active={filters.theme === theme}
              onClick={() =>
                setFilters({ ...filters, theme: filters.theme === theme ? null : theme })
              }
            >
              {THEME_LABEL[theme]}
            </FilterChip>
          ))}
        </FilterRow>

        <FilterRow label="Tier">
          {TIERS.map((tier) => (
            <FilterChip
              key={tier}
              active={filters.tier === tier}
              onClick={() => setFilters({ ...filters, tier: filters.tier === tier ? null : tier })}
            >
              {TIER_LABEL[tier]}
            </FilterChip>
          ))}
        </FilterRow>

        <FilterRow label="Diğer">
          <FilterChip
            active={filters.elderFriendlyOnly}
            onClick={() => setFilters({ ...filters, elderFriendlyOnly: !filters.elderFriendlyOnly })}
          >
            Anne için uygun
          </FilterChip>
          <FilterChip
            active={filters.tag === 'market'}
            onClick={() =>
              setFilters({ ...filters, tag: filters.tag === 'market' ? null : 'market' })
            }
          >
            Pazar
          </FilterChip>
          <FilterChip
            active={filters.tag === 'shopping'}
            onClick={() =>
              setFilters({ ...filters, tag: filters.tag === 'shopping' ? null : 'shopping' })
            }
          >
            Alışveriş
          </FilterChip>
        </FilterRow>

        {hasActiveFilter(filters) && (
          <Button
            variant="plain"
            alignSelf="start"
            minH="11"
            px="0"
            fontSize="sm"
            fontWeight="semibold"
            color="accent"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Filtreleri temizle
          </Button>
        )}
      </Stack>

      <List.Root gap="2" listStyle="none" ms="0">
        {results.map((result, index) => {
          const dayId = result.dayId;
          return (
            <List.Item key={`${result.kind}-${result.title}-${index}`}>
              {dayId !== undefined ? (
                <ResultButton type="button" onClick={() => onOpenDay(dayId)}>
                  <ResultMeta kind={result.kind} subtitle={result.subtitle} />
                  <Span fontWeight="medium">{result.title}</Span>
                </ResultButton>
              ) : (
                <Stack layerStyle="card" gap="0.5" p="3">
                  <ResultMeta kind={result.kind} subtitle={result.subtitle} />
                  <Span fontWeight="medium">{result.title}</Span>
                </Stack>
              )}
            </List.Item>
          );
        })}
        {results.length === 0 && (
          <Text fontSize="sm" color="fg.muted">
            {hasActiveFilter(filters)
              ? 'Bununla eşleşen bir şey yok.'
              : 'Aramak için yazmaya başla ya da yukarıdan filtre seç.'}
          </Text>
        )}
      </List.Root>
    </Stack>
  );
}

function ResultMeta({
  kind,
  subtitle,
}: {
  readonly kind: SearchResultKind;
  readonly subtitle: string | undefined;
}) {
  return (
    <Span textStyle="eyebrow" fontWeight="medium" color="fg.muted">
      {KIND_LABEL[kind]}
      {subtitle !== undefined && ` · ${subtitle}`}
    </Span>
  );
}

function FilterRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <Wrap align="center" gap="1.5">
      <Span me="1" fontSize="xs" fontWeight="semibold" color="fg.muted">
        {label}:
      </Span>
      {children}
    </Wrap>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: string;
}) {
  return (
    <Button
      variant="plain"
      onClick={onClick}
      aria-pressed={active}
      minH="11"
      px="2.5"
      py="1.5"
      fontSize="xs"
      fontWeight="semibold"
      rounded="l1"
      borderWidth="1px"
      borderColor={active ? 'accent' : 'border'}
      bg={active ? 'accent' : 'transparent'}
      color={active ? 'accent.fg' : 'fg.muted'}
      _hover={{ bg: active ? 'accent' : 'bg.subtle' }}
    >
      {children}
    </Button>
  );
}
