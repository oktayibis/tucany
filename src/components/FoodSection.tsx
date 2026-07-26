import type { Day, Food, MealSlot } from '../data/schema';
import { foodKey, selectFood } from '../lib/budget';
import { euro } from '../lib/format';
import { FoodTierBadge } from './TierBadge';
import { PhoneButton } from './NavButton';
import { PorkSafeNote, PorkWarningNote } from './PorkWarningNote';
import { useTrip } from '../state/TripContext';

const SLOT_LABEL: Readonly<Record<MealSlot, string>> = {
  coffee: 'Kahve',
  lunch: 'Öğle',
  aperitivo: 'Aperitivo',
  dinner: 'Akşam',
  snack: 'Atıştırmalık',
};

const SLOT_ORDER: readonly MealSlot[] = ['coffee', 'lunch', 'aperitivo', 'dinner', 'snack'];

/**
 * "Yemek". Shows every option the data lists per slot, not just the one this
 * mode picks — a Keyif-only booking like Osteria di Passignano is still worth
 * seeing while the family is in Karma mode, so they know it exists and why
 * it's not tonight's plan.
 */
export function FoodSection({ day }: { readonly day: Day }) {
  const { mode, upgrades } = useTrip();
  const active = new Set(selectFood(day.food, mode, day.id, upgrades).map((entry) => foodKey(day.id, entry)));

  const bySlot = new Map<MealSlot, Food[]>();
  for (const entry of day.food) {
    const list = bySlot.get(entry.slot);
    if (list === undefined) bySlot.set(entry.slot, [entry]);
    else list.push(entry);
  }

  const slots = SLOT_ORDER.filter((slot) => bySlot.has(slot));
  if (slots.length === 0) return <p className="text-sm opacity-75">Bu gün için yemek planı yok.</p>;

  return (
    <div className="flex flex-col gap-4">
      {slots.map((slot) => (
        <div key={slot}>
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-75">
            {SLOT_LABEL[slot]}
          </h3>
          <ul className="mt-1 flex flex-col gap-2">
            {(bySlot.get(slot) ?? []).map((entry) => (
              <FoodRow
                key={foodKey(day.id, entry)}
                dayId={day.id}
                entry={entry}
                isActive={active.has(foodKey(day.id, entry))}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FoodRow({
  dayId,
  entry,
  isActive,
}: {
  readonly dayId: string;
  readonly entry: Food;
  readonly isActive: boolean;
}) {
  const { mode, upgrades, toggleUpgrade } = useTrip();
  const key = foodKey(dayId, entry);
  const canUpgrade = mode === 'mixed' && entry.tier === 'a';
  const isUpgraded = upgrades.includes(key);

  return (
    <li className={`rounded border p-3 ${isActive ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold">{entry.name}</p>
        <div className="flex items-center gap-2">
          <FoodTierBadge tier={entry.tier} />
          <span className="text-sm font-semibold tabular-nums">{euro(entry.price)}</span>
        </div>
      </div>

      {!isActive && (
        <p className="text-xs opacity-75">
          {entry.tier === 'a' ? 'Sadece Keyif modunda' : 'Bu modda seçilmedi'}
        </p>
      )}

      {entry.why !== undefined && <p className="mt-1 text-sm">{entry.why}</p>}
      {entry.hours !== undefined && <p className="text-xs opacity-75">Saatler: {entry.hours}</p>}
      {entry.priceNote !== undefined && (
        <p className="text-xs opacity-75">Fiyat notu: {entry.priceNote}</p>
      )}

      {entry.porkWarning !== undefined && <PorkWarningNote warning={entry.porkWarning} />}
      {entry.porkSafe === true && <PorkSafeNote />}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {entry.phone !== undefined && <PhoneButton phone={entry.phone} />}
        {entry.booking !== undefined && (
          <span className="text-xs opacity-75">
            Rezervasyon: {entry.booking === 'required' ? 'gerekli' : entry.booking === 'recommended' ? 'önerilir' : 'sadece telefonla'}
            {entry.bookingNote !== undefined && ` — ${entry.bookingNote}`}
          </span>
        )}
        {canUpgrade && (
          <button
            type="button"
            onClick={() => toggleUpgrade(key)}
            className="ml-auto min-h-11 rounded border px-3 py-2 text-xs font-medium"
          >
            {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : 'Karma’ya ekle'}
          </button>
        )}
      </div>
    </li>
  );
}
