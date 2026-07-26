import type { Day, DayOption } from '../data/schema';
import { trip } from '../data/trip';
import { chosenOption, resolveOptionCost } from '../lib/budget';
import { formatDayMonth, formatDriving } from '../lib/dates';
import { NavButton } from './NavButton';
import { PriceTag } from './PriceTag';
import { useTrip } from '../state/TripContext';

/**
 * Renders a day's alternative itineraries as a single-choice picker — day 9's
 * three craft towns, day 7's rest-day-vs-beach choice. Pros/cons sit directly
 * on the card (the brief is explicit: they're the content, not something to
 * hide behind a toggle), and picking a card swaps stops/food/shopping/driving
 * time/budget for the whole day — see effectiveStops/Food/Shopping in
 * src/lib/budget.ts, which DayDetail folds the selection through.
 */
export function OptionsSection({ day }: { readonly day: Day }) {
  const { mode, party, chosenOptions, chooseOption, upgrades } = useTrip();
  if (day.options === undefined) return null;

  const selected = chosenOption(day, { mode, party, chosenOptions, upgrades });
  const isDecided = chosenOptions[day.id] !== undefined;

  return (
    <div className="flex flex-col gap-3">
      {!isDecided && (
        <p className="border border-dashed border-border bg-surface p-2 text-xs font-semibold text-text-muted">
          Karar verilmedi — planın önerisi gösteriliyor, aşağıdan seç.
        </p>
      )}
      <div role="radiogroup" aria-label="Bugünün rotası" className="flex flex-col gap-3">
        {day.options.map((option) => (
          <OptionCard
            key={option.id}
            day={day}
            option={option}
            isSelected={option.id === selected?.id}
            onSelect={() => chooseOption(day.id, option.id)}
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
  const beach = option.beach === undefined ? undefined : trip.beaches.find((b) => b.id === option.beach);
  const movesToDay = option.movesTo === undefined ? undefined : trip.days.find((d) => d.id === option.movesTo);
  const isBeach = beach !== undefined;

  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 border bg-surface-2 p-3 ${
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
          {option.recommended === true && (
            <span className="bg-antimony px-1.5 py-0.5 font-body text-xs font-semibold text-ink">
              Planın önerisi
            </span>
          )}
          {isBeach && (
            <span className="bg-theme-plaj/15 px-1.5 py-0.5 font-body text-xs font-semibold text-theme-plaj">
              🏖 Plaj
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
        <div className="border border-dashed border-theme-plaj bg-surface p-2 text-xs">
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
          ↷ Bu seçilirse akşam programı {formatDayMonth(movesToDay.date)}'e ({movesToDay.title}) taşınır.
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
