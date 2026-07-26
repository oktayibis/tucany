import { modeDelta } from '../lib/budget';
import { deltaPhrase } from '../lib/format';
import { MODES, MODE_INFO, otherModes, type Mode } from '../lib/modes';
import { useTrip } from '../state/TripContext';

const MODE_ICONS: Readonly<Record<Mode, string>> = {
  a: '✨',
  mixed: '⚖️',
  b: '🏷️',
};

/**
 * The three-way Keyif/Karma/Ucuz switch. Persistent and central: every price
 * on every screen reads from `useTrip().budget`, which is keyed off this
 * value, so changing it here instantly re-renders the whole trip.
 */
export function ModeSwitch() {
  const { mode, setMode, budget } = useTrip();

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-1.5 shadow-xs">
      <div
        role="radiogroup"
        aria-label="Bütçe modu"
        className="grid grid-cols-3 gap-1 rounded-lg bg-surface p-1"
      >
        {MODES.map((candidate) => {
          const active = candidate === mode;
          return (
            <button
              key={candidate}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(candidate)}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-md px-2 py-2 font-display text-sm font-semibold transition-all ${
                active
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text'
              }`}
            >
              <span aria-hidden="true">{MODE_ICONS[candidate]}</span>
              {MODE_INFO[candidate].label}
            </button>
          );
        })}
      </div>
      <div className="px-1.5 pt-2">
        <p className="text-xs font-medium text-text">{MODE_INFO[mode].gist}</p>
        <ModeDeltaLine mode={mode} totals={budget.totalsByMode} />
      </div>
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
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
      {otherModes(mode).map((other) => {
        const delta = modeDelta(totals, mode, other);
        return (
          <span
            key={other}
            className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 font-medium border border-border/60"
          >
            {MODE_INFO[other].label}: <strong className="ml-1 text-text">{deltaPhrase(delta)}</strong>
          </span>
        );
      })}
    </div>
  );
}
