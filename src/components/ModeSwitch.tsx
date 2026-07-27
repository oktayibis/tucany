import { useId } from 'react';
import { modeDelta } from '../lib/budget';
import { deltaPhrase } from '../lib/format';
import { MODES, MODE_INFO, otherModes, type Mode } from '../lib/modes';
import { useTrip } from '../state/TripContext';

/**
 * The three-way Keyif/Karma/Ucuz switch, as the mockup's full-width segmented
 * control. Persistent and central: every price on every screen reads from
 * `useTrip().budget`, which is keyed off this value, so changing it here
 * instantly re-renders the whole trip.
 *
 * Built on real radio inputs inside labels — the design system's `.seg` styles
 * the checked state with `:has(input:checked)`, which means keyboard and
 * screen-reader semantics come from the platform rather than from hand-rolled
 * `role="radio"` wiring.
 */
export function ModeSwitch() {
  const { mode, setMode, budget } = useTrip();
  /*
   * The day pager mounts one of these per day panel, and the day list mounts
   * another — a dozen live copies of the same control. Radio `name` is
   * document-global, so a shared name would make the browser treat all twelve
   * as ONE group and uncheck every copy but the last one clicked, leaving the
   * off-screen panels visually blank. A per-instance name keeps each copy its
   * own group; they stay in sync through `mode`, not through the DOM.
   */
  const groupName = useId();

  return (
    <div>
      <div role="radiogroup" aria-label="Bütçe modu" className="seg flex w-full">
        {MODES.map((candidate) => (
          <label key={candidate} className="seg-opt min-h-[46px] flex-1 justify-center">
            <input
              type="radio"
              name={groupName}
              value={candidate}
              checked={candidate === mode}
              onChange={() => setMode(candidate)}
            />
            {MODE_INFO[candidate].label}
          </label>
        ))}
      </div>
      <p className="mt-2 text-note text-neutral-700">{MODE_INFO[mode].gist}</p>
      <ModeDeltaLine mode={mode} totals={budget.totalsByMode} />
    </div>
  );
}

/** "Karma modda €230 daha az" — legible trade-off against the other modes. */
function ModeDeltaLine({
  mode,
  totals,
}: {
  readonly mode: Mode;
  readonly totals: Readonly<Record<Mode, number>>;
}) {
  return (
    <ul className="mt-1 flex flex-col gap-[2px] text-meta text-neutral-600">
      {otherModes(mode).map((other) => {
        const delta = modeDelta(totals, mode, other);
        return (
          <li key={other}>
            {MODE_INFO[other].label} modda {deltaPhrase(delta)}
          </li>
        );
      })}
    </ul>
  );
}
