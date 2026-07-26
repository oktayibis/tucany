import { useTrip } from '../state/TripContext';

/**
 * Party-size stepper. Only two prices in the whole trip actually scale with
 * this (see `lib/pricing.ts`), so the tooltip is upfront about the limit
 * rather than implying every euro on screen will move.
 */
export function PartyControl() {
  const { party, setParty, budget } = useTrip();

  const adjustAdults = (delta: number) => {
    setParty({ ...party, adults: Math.max(1, party.adults + delta) });
  };
  const adjustChildren = (delta: number) => {
    setParty({ ...party, children: Math.max(0, party.children + delta) });
  };

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Stepper icon="👨" label="Yetişkin" value={party.adults} onChange={adjustAdults} min={1} />
        <Stepper icon="👶" label="Çocuk" value={party.children} onChange={adjustChildren} min={0} />
      </div>
      <p className="mt-2 text-xs text-text-muted">
        Kişi sayısı sadece kişi başı yazılmış fiyatları değiştirir (şu an €
        {Math.round(budget.partySensitiveTotal)}
        'luk kısım). Bir bistecca veya paylaşılan tabaklar gibi masaya yazılmış fiyatlar sabittir.
      </p>
    </div>
  );
}

function Stepper({
  icon,
  label,
  value,
  onChange,
  min,
}: {
  readonly icon: string;
  readonly label: string;
  readonly value: number;
  readonly onChange: (delta: number) => void;
  readonly min: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1 border border-border/60">
      <span aria-hidden="true">{icon}</span>
      <span className="text-xs font-semibold text-text">{label}</span>
      <div className="flex items-center gap-1 ml-1">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={value <= min}
          aria-label={`${label} sayısını azalt`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-base font-bold text-accent shadow-xs active:scale-95 disabled:opacity-30 disabled:active:scale-100"
        >
          −
        </button>
        <span aria-live="polite" className="min-w-6 text-center font-display text-sm font-bold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(1)}
          aria-label={`${label} sayısını artır`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-base font-bold text-accent shadow-xs active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}
