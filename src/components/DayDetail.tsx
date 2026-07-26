import type { ReactNode } from 'react';
import { trip } from '../data/trip';
import { formatDayMonth, weekdayDisplay } from '../lib/dates';
import { gapsForDay } from '../lib/gaps';
import { ALL_CLOSURES, ALL_GAPS } from '../state/derived';
import { useTrip } from '../state/TripContext';
import type { Route } from '../hooks/useRoute';
import { DayNotes } from './DayNotes';
import { FoodSection } from './FoodSection';
import { IntensityMeter } from './IntensityMeter';
import { OptionsSection } from './OptionsSection';
import { RouteSection } from './RouteSection';
import { ShoppingSection } from './ShoppingSection';
import { StopsSection } from './StopsSection';
import { WarningBanner } from './WarningBanner';

function Section({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section aria-labelledby={`section-${title}`} className="border-t border-border pt-4">
      <h2 id={`section-${title}`} className="mb-2 font-display text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DayDetail({
  dayId,
  onBack,
}: {
  readonly dayId: string;
  readonly onBack: () => void;
}) {
  const { today, budget } = useTrip();
  const index = trip.days.findIndex((day) => day.id === dayId);
  const day = trip.days[index];

  if (day === undefined) {
    return (
      <div className="p-4">
        <p>Bu gün bulunamadı.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 min-h-11 border border-border bg-surface-2 px-3 py-2"
        >
          Güne dön
        </button>
      </div>
    );
  }

  const dayBudget = budget.days.find((candidate) => candidate.dayId === dayId);
  const dayClosures = ALL_CLOSURES.find((candidate) => candidate.dayId === dayId);
  const dayGaps = gapsForDay(ALL_GAPS, dayId);
  const isToday = day.date === today;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-24">
      <button
        type="button"
        onClick={onBack}
        className="min-h-11 self-start border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-accent"
      >
        ← Tüm günler
      </button>

      <header>
        <p className="flex items-center gap-2 font-display text-xs font-medium uppercase tracking-wide text-text-muted">
          <span>
            {index + 1}. gün · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
          </span>
          {isToday && (
            <span className="bg-accent px-1.5 py-0.5 font-semibold text-white">Bugün</span>
          )}
          {day.starred === true && (
            <span aria-hidden="true" className="text-accent-2">
              ★
            </span>
          )}
        </p>
        <h1 className="text-display-lg font-semibold">{day.title}</h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-text-muted">
          <IntensityMeter intensity={day.intensity} />
          {!day.elderFriendly && <span>Anne için zorlu gün olabilir</span>}
        </div>
      </header>

      {dayClosures !== undefined && <WarningBanner warnings={day.warnings} closures={dayClosures} />}

      <Section title="Rota / navigasyon">
        <RouteSection day={day} />
      </Section>

      <Section title="Görülecek">
        {day.options !== undefined ? (
          <OptionsSection day={day} />
        ) : (
          <StopsSection day={day} dayItems={dayBudget?.items ?? []} />
        )}
      </Section>

      <Section title="Yemek">
        <FoodSection day={day} />
      </Section>

      <Section title="Alışveriş">
        <ShoppingSection shopping={day.shopping} />
      </Section>

      <Section title="Notlar">
        <DayNotes day={day} gaps={dayGaps} />
      </Section>
    </div>
  );
}

export function dayRoute(dayId: string): Route {
  return { name: 'day', dayId };
}
