import { useState } from 'react';
import type { Day, DayOption } from '../data/schema';
import { trip } from '../data/trip';
import { chosenOption, resolveOptionCost } from '../lib/budget';
import { formatDayMonth, formatDriving } from '../lib/dates';
import { NavButton } from './NavButton';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';
import { useTrip } from '../state/TripContext';

/**
 * A day's alternative itineraries — day 9's craft towns, day 7's
 * rest-day-vs-beach choice. Picking one swaps stops/food/shopping/driving
 * time/budget for the whole day (see effectiveStops/Food/Shopping in
 * src/lib/budget.ts), so this sits above the flow it rewrites.
 *
 * Once the choice is made it collapses to a single line: a decided day should
 * cost one row, not three cards of pros and cons the family already weighed.
 * Undecided, it opens the full picker — and pros/cons stay inline on the cards
 * there, never behind another toggle, because they *are* the content.
 */
export function OptionsSection({ day }: { readonly day: Day }) {
  const { mode, party, chosenOptions, chooseOption, upgrades } = useTrip();
  const [editing, setEditing] = useState(false);

  if (day.options === undefined) return null;

  const selected = chosenOption(day, { mode, party, chosenOptions, upgrades });
  const isDecided = chosenOptions[day.id] !== undefined;

  if (isDecided && !editing && selected !== null) {
    // The chosen option's destination has to stay reachable from the collapsed
    // bar. On a beach day "take me to the beach" is the single most-used action
    // of the day, and it would otherwise be buried behind "Değiştir".
    const beach =
      selected.beach === undefined
        ? undefined
        : trip.beaches.find((candidate) => candidate.id === selected.beach);
    const destination =
      beach ?? (selected.nav === undefined ? undefined : { name: selected.label, nav: selected.nav });

    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
        <div className="flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
              Seçilen rota
            </p>
            <p className="font-display font-medium">{selected.label}</p>
            {beach !== undefined && (
              <p className="text-xs text-text-muted">{formatDriving(beach.minutesFromBase)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="min-h-11 shrink-0 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold text-accent"
          >
            Değiştir
          </button>
        </div>
        {destination !== undefined && (
          <div className="border-t border-border px-3 py-2">
            <NavButton place={destination} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="flex-1 rounded-2xl border border-dashed border-border bg-surface p-2 text-xs font-semibold text-text-muted">
          {isDecided
            ? 'Bugünün rotasını seç.'
            : 'Karar verilmedi — planın önerisi gösteriliyor, aşağıdan seç.'}
        </p>
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="min-h-11 shrink-0 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold text-accent"
          >
            Kapat
          </button>
        )}
      </div>
      <div role="radiogroup" aria-label="Bugünün rotası" className="flex flex-col gap-3">
        {day.options.map((option) => (
          <OptionCard
            key={option.id}
            day={day}
            option={option}
            isSelected={option.id === selected?.id}
            onSelect={() => {
              chooseOption(day.id, option.id);
              setEditing(false);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function OptionCard({
  day,
  option,
  isSelected,
  onSelect,
}: {
  readonly day: Day;
  readonly option: DayOption;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  const { mode } = useTrip();
  const cost = resolveOptionCost(option.cost, mode);
  const beach =
    option.beach === undefined ? undefined : trip.beaches.find((b) => b.id === option.beach);
  const movesToDay =
    option.movesTo === undefined ? undefined : trip.days.find((d) => d.id === option.movesTo);
  const isBeach = beach !== undefined;

  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 rounded-2xl border bg-surface-2 p-3 ${
        isSelected
          ? isBeach
            ? 'border-2 border-theme-plaj'
            : 'border-2 border-accent'
          : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2 font-display font-medium">
          <input
            type="radio"
            name={`${day.id}-option`}
            checked={isSelected}
            onChange={onSelect}
            className="h-5 w-5 accent-accent"
          />
          {option.label}
          <RatingBadge rating={option.rating ?? beach?.rating} />
          {option.recommended === true && (
            <span className="rounded-full bg-olive px-1.5 py-0.5 font-body text-xs font-semibold text-ink">
              Planın önerisi
            </span>
          )}
          {isBeach && (
            <span className="rounded-full bg-theme-plaj/15 px-1.5 py-0.5 font-body text-xs font-semibold text-theme-plaj">
              Plaj
            </span>
          )}
        </span>
        <span className="text-sm font-semibold">
          <PriceTag amount={cost} />
        </span>
      </div>

      <p className="text-sm">{option.desc}</p>

      {option.drivingMinutes !== undefined && (
        <p className="text-xs text-text-muted">Sürüş: {formatDriving(option.drivingMinutes)}</p>
      )}

      {(option.pros !== undefined || option.cons !== undefined) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {option.pros !== undefined && option.pros.length > 0 && (
            <ul className="flex flex-col gap-0.5 text-xs text-safe">
              {option.pros.map((pro) => (
                <li key={pro}>+ {pro}</li>
              ))}
            </ul>
          )}
          {option.cons !== undefined && option.cons.length > 0 && (
            <ul className="flex flex-col gap-0.5 text-xs text-danger">
              {option.cons.map((con) => (
                <li key={con}>− {con}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {beach !== undefined && (
        <div className="rounded-2xl border border-dashed border-theme-plaj bg-surface p-2 text-xs">
          <p className="font-semibold">
            {beach.name} · {formatDriving(beach.minutesFromBase)}
          </p>
          <p className="mt-0.5 text-text-muted">{beach.notes}</p>
          <div className="mt-1">
            <NavButton place={beach} note="Plaja yol tarifi al" />
          </div>
        </div>
      )}

      {option.bikes !== undefined && (
        <p className="text-xs text-text-muted">
          <span className="font-semibold text-text">Bisiklet: </span>
          {option.bikes}
        </p>
      )}

      {option.note !== undefined && <p className="text-xs italic text-text-muted">{option.note}</p>}

      {movesToDay !== undefined && (
        <p className="text-xs text-text-muted">
          ↷ Bu seçilirse akşam programı {formatDayMonth(movesToDay.date)}'e ({movesToDay.title})
          taşınır.
        </p>
      )}

      {option.nav !== undefined && (
        <div>
          <NavButton place={{ name: option.label, nav: option.nav }} />
        </div>
      )}
    </label>
  );
}
