import type { Day } from '../data/schema';
import { chosenOption } from '../lib/budget';
import { NavButton } from './NavButton';
import { PriceTag } from './PriceTag';
import { useTrip } from '../state/TripContext';

/**
 * Day 9 replaces a stop list with three whole alternative itineraries. This
 * renders them as a single-choice picker rather than three stop cards, since
 * only one is actually happening.
 */
export function OptionsSection({ day }: { readonly day: Day }) {
  const { mode, party, chosenOptions, chooseOption, upgrades } = useTrip();
  if (day.options === undefined) return null;

  const selected = chosenOption(day, { mode, party, chosenOptions, upgrades });

  return (
    <div role="radiogroup" aria-label="Bugünün rotası" className="flex flex-col gap-3">
      {day.options.map((option) => {
        const isSelected = option.id === selected?.id;
        return (
          <label
            key={option.id}
            className={`flex cursor-pointer flex-col gap-1 border bg-surface-2 p-3 ${
              isSelected ? 'border-2 border-accent' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-2 font-display font-medium">
                <input
                  type="radio"
                  name={`${day.id}-option`}
                  checked={isSelected}
                  onChange={() => chooseOption(day.id, option.id)}
                  className="h-5 w-5 accent-accent"
                />
                {option.label}
                {option.recommended === true && (
                  <span className="bg-antimony px-1.5 py-0.5 font-body text-xs font-semibold text-ink">
                    Planın önerisi
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold">
                <PriceTag amount={option.cost} />
              </span>
            </div>
            <p className="text-sm">{option.desc}</p>
            {option.nav !== undefined && (
              <div>
                <NavButton place={{ name: option.label, nav: option.nav }} />
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
}
