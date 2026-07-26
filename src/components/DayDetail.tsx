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
    <section aria-labelledby={`section-${title}`} className="border-t pt-4">
      <h2 id={`section-${title}`} className="mb-2 text-lg font-bold">
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
        <button type="button" onClick={onBack} className="mt-2 min-h-11 rounded border px-3 py-2">
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
      <button type="button" onClick={onBack} className="min-h-11 self-start rounded border px-3 py-2 text-sm">
        ← Tüm günler
      </button>

      <header>
        <p className="text-sm opacity-75">
          {index + 1}. gün · {weekdayDisplay(day.weekday)} · {formatDayMonth(day.date)}
          {isToday && <span className="ml-2 rounded bg-current/10 px-1.5 py-0.5 font-semibold">Bugün</span>}
          {day.starred === true && <span className="ml-2">★</span>}
        </p>
        <h1 className="text-2xl font-extrabold">{day.title}</h1>
        <div className="mt-1 flex items-center gap-3 text-sm opacity-75">
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
