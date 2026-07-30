import { useId } from 'react';
import { MAP_APPS, MAP_APP_INFO } from '../lib/nav';
import { useTrip } from '../state/TripContext';

/**
 * Google Maps / Apple Haritalar, picked once for the whole trip.
 *
 * Every navigation affordance in the app — the header's "Otele yol tarifi",
 * the next-stop bar, and the bare arrow buttons on stop, food, shopping and
 * leg rows — reads this one value, so the family sets it on the first morning
 * and never thinks about it again. Offering a second button next to each link
 * instead would have worked only where there is room for one; the inline
 * arrows have none, and those are most of the links in the app.
 *
 * Same construction as `ModeSwitch`: real radios inside labels, so the checked
 * state, keyboard arrows and screen-reader semantics come from the platform.
 */
export function MapAppSwitch({ className = '' }: { readonly className?: string }) {
  const { mapApp, setMapApp } = useTrip();
  /* One control per day panel plus the home header — see the note in ModeSwitch. */
  const groupName = useId();
  const labelId = useId();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/*
        * Colour is inherited, not fixed: this control sits both on the plain
        * page and on the header's light `plate`, whose text colour differs —
        * and `neutral-700` inverts to a pale tan in dark mode, which would be
        * unreadable on the plate (it stays light in both themes).
        */}
      <span id={labelId} className="text-micro uppercase tracking-[0.1em] opacity-70">
        Harita
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="seg">
        {MAP_APPS.map((candidate) => (
          <label
            key={candidate}
            className="seg-opt min-h-[38px] px-3 text-meta"
            title={MAP_APP_INFO[candidate].full}
          >
            <input
              type="radio"
              name={groupName}
              value={candidate}
              checked={candidate === mapApp}
              onChange={() => setMapApp(candidate)}
              aria-label={`Bağlantıları ${MAP_APP_INFO[candidate].full} ile aç`}
            />
            {MAP_APP_INFO[candidate].label}
          </label>
        ))}
      </div>
    </div>
  );
}
