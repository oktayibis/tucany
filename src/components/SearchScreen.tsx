import { useMemo, useState, type ReactNode } from 'react';
import { trip } from '../data/trip';
import type { StopTier, Theme } from '../data/schema';
import { EMPTY_FILTERS, hasActiveFilter, search, type SearchFilters, type SearchResultKind } from '../lib/search';

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

export function SearchScreen({ onOpenDay }: { readonly onOpenDay: (dayId: string) => void }) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const results = useMemo(() => search(trip, filters), [filters]);

  return (
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 pb-8">
      <h1 className="text-display-lg font-semibold">Ara</h1>

      <input
        type="search"
        value={filters.query}
        onChange={(event) => setFilters({ ...filters, query: event.target.value })}
        placeholder="Durak, yemek, alışveriş, cümle ara…"
        className="min-h-[44px] rounded-full border border-border bg-surface-2 px-4 py-2 text-base"
        aria-label="Ara"
      />

      <div className="flex flex-col gap-2">
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
            onClick={() => setFilters({ ...filters, tag: filters.tag === 'market' ? null : 'market' })}
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
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="min-h-11 self-start text-sm font-semibold text-accent"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {results.map((result, index) => {
          const dayId = result.dayId;
          return (
            <li key={`${result.kind}-${result.title}-${index}`}>
              {dayId !== undefined ? (
                <button
                  type="button"
                  onClick={() => onOpenDay(dayId)}
                  className="flex min-h-[44px] w-full cursor-pointer flex-col gap-0.5 rounded-xl bg-surface p-4 text-left"
                >
                  <ResultMeta kind={result.kind} subtitle={result.subtitle} />
                  <span className="font-medium">{result.title}</span>
                </button>
              ) : (
                <div className="flex flex-col gap-0.5 rounded-xl bg-surface p-4">
                  <ResultMeta kind={result.kind} subtitle={result.subtitle} />
                  <span className="font-medium">{result.title}</span>
                </div>
              )}
            </li>
          );
        })}
        {results.length === 0 && (
          <p className="text-sm text-text-muted">
            {hasActiveFilter(filters)
              ? 'Bununla eşleşen bir şey yok.'
              : 'Aramak için yazmaya başla ya da yukarıdan filtre seç.'}
          </p>
        )}
      </ul>
    </div>
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
    <span className="font-display text-xs font-medium uppercase tracking-wide text-text-muted">
      {KIND_LABEL[kind]}
      {subtitle !== undefined && ` · ${subtitle}`}
    </span>
  );
}

function FilterRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-semibold text-text-muted">{label}:</span>
      {children}
    </div>
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
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`btn min-h-[44px] px-4 text-meta ${
        active ? 'btn-primary' : 'btn-secondary text-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}
