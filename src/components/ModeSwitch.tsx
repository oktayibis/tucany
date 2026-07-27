import { modeDelta } from '../lib/budget';
import { deltaPhrase } from '../lib/format';
import { MODES, MODE_INFO, otherModes, type Mode } from '../lib/modes';
import { useTrip } from '../state/TripContext';

/**
 * The three-way Keyif/Karma/Ucuz switch. Persistent and central: every price
 * on every screen reads from `useTrip().budget`, which is keyed off this
 * value, so changing it here instantly re-renders the whole trip.
 */
export function ModeSwitch() {
  const { mode, setMode, budget } = useTrip();

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Bütçe modu"
        className="flex gap-1 rounded-full border border-border bg-surface-2 p-1"
      >
        {MODES.map((candidate) => (
          <button
            key={candidate}
            type="button"
            role="radio"
            aria-checked={candidate === mode}
            onClick={() => setMode(candidate)}
            className={`min-h-11 flex-1 rounded-full px-4 py-2 font-display text-sm transition-colors ${
              candidate === mode ? 'bg-accent text-white' : 'text-text-muted'
            }`}
          >
            {MODE_INFO[candidate].label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-text-muted">{MODE_INFO[mode].gist}</p>
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
    <ul className="mt-1 flex flex-col gap-0.5 text-xs text-text-muted">
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
