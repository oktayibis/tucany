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
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <Stepper label="Yetişkin" value={party.adults} onChange={adjustAdults} min={1} />
        <Stepper label="Çocuk" value={party.children} onChange={adjustChildren} min={0} />
      </div>
      <p className="mt-1 max-w-prose text-xs text-text-muted">
        Kişi sayısı sadece kişi başı yazılmış fiyatları değiştirir (şu an €
        {Math.round(budget.partySensitiveTotal)}
        'luk kısım). Bir bistecca veya paylaşılan bir tabak gibi "masaya" yazılmış fiyatlar sabit
        kalır — grup büyüse de küçülse de aynı yemeği paylaşırsınız.
      </p>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
}: {
  readonly label: string;
  readonly value: number;
  readonly onChange: (delta: number) => void;
  readonly min: number;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(-1)}
        disabled={value <= min}
        aria-label={`${label} sayısını azalt`}
        className="min-h-11 min-w-11 border border-border bg-surface-2 text-lg font-semibold text-accent disabled:opacity-40"
      >
        −
      </button>
      <span aria-live="polite" className="min-w-6 text-center font-display text-base tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        aria-label={`${label} sayısını artır`}
        className="min-h-11 min-w-11 border border-border bg-surface-2 text-lg font-semibold text-accent"
      >
        +
      </button>
    </div>
  );
}
