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
      beach ??
      (selected.nav === undefined ? undefined : { name: selected.label, nav: selected.nav });

    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-micro uppercase tracking-[0.1em] text-accent-700">Seçilen rota</p>
          <p className="mt-1 font-display text-item font-semibold">{selected.label}</p>
          {beach !== undefined && (
            <p className="mt-[3px] text-meta text-neutral-700">
              {formatDriving(beach.minutesFromBase)}
            </p>
          )}
        </div>
        <div className="flex flex-none flex-col items-stretch gap-[5px]">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn btn-secondary min-h-[36px] whitespace-nowrap border-neutral-400 px-3 text-meta"
          >
            Değiştir
          </button>
          {destination !== undefined && (
            <NavButton place={destination} iconSize={15} className="min-h-[36px] px-3" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-note text-neutral-700">
          {isDecided
            ? 'Bugünün rotasını seç.'
            : 'Karar verilmedi — planın önerisi gösteriliyor, aşağıdan seç.'}
        </p>
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="btn btn-secondary min-h-[36px] flex-none border-neutral-400 px-3 text-meta"
          >
            Kapat
          </button>
        )}
      </div>
      <div role="radiogroup" aria-label="Bugünün rotası" className="flex flex-col gap-2">
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

  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 rounded-xl p-4 ${
        isSelected ? 'bg-accent-100 ring-2 ring-inset ring-accent' : 'bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2 font-display text-item font-semibold">
          <input
            type="radio"
            name={`${day.id}-option`}
            checked={isSelected}
            onChange={onSelect}
            className="h-5 w-5 accent-[var(--color-accent)]"
          />
          {option.label}
          <RatingBadge rating={option.rating ?? beach?.rating} />
          {option.recommended === true && <span className="tag tag-accent-2">planın önerisi</span>}
          {beach !== undefined && <span className="tag tag-neutral">plaj</span>}
        </span>
        <span className="flex-none font-display text-item font-semibold">
          <PriceTag amount={cost} />
        </span>
      </div>

      <p className="text-body">{option.desc}</p>

      {option.drivingMinutes !== undefined && (
        <p className="text-meta text-neutral-700">Sürüş: {formatDriving(option.drivingMinutes)}</p>
      )}

      {(option.pros !== undefined || option.cons !== undefined) && (
        <div className="flex flex-col gap-2">
          {option.pros !== undefined && option.pros.length > 0 && (
            <ul className="flex flex-col gap-[2px] text-meta text-accent-2-700">
              {option.pros.map((pro) => (
                <li key={pro}>+ {pro}</li>
              ))}
            </ul>
          )}
          {option.cons !== undefined && option.cons.length > 0 && (
            <ul className="flex flex-col gap-[2px] text-meta text-danger">
              {option.cons.map((con) => (
                <li key={con}>− {con}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {beach !== undefined && (
        <div className="rounded-lg bg-neutral-200 p-3 text-meta">
          <p className="font-display text-lead font-semibold">
            {beach.name} · {formatDriving(beach.minutesFromBase)}
          </p>
          <p className="mt-1 text-neutral-700">{beach.notes}</p>
          <div className="mt-2">
            <NavButton
              place={beach}
              label="Plaja yol tarifi"
              iconSize={15}
              className="min-h-[36px] px-3"
            />
          </div>
        </div>
      )}

      {option.bikes !== undefined && (
        <p className="text-meta text-neutral-700">
          <span className="font-display font-semibold text-text">Bisiklet: </span>
          {option.bikes}
        </p>
      )}

      {option.note !== undefined && (
        <p className="text-meta italic text-neutral-700">{option.note}</p>
      )}

      {movesToDay !== undefined && (
        <p className="text-meta text-neutral-700">
          ↷ Bu seçilirse akşam programı {formatDayMonth(movesToDay.date)}'e ({movesToDay.title})
          taşınır.
        </p>
      )}

      {option.nav !== undefined && (
        <div>
          <NavButton
            place={{ name: option.label, nav: option.nav }}
            label="Yol tarifi"
            iconSize={15}
            className="min-h-[36px] px-3"
          />
        </div>
      )}
    </label>
  );
}
