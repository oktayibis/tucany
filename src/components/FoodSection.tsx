import { useState } from 'react';
import type { Food, MealSlot } from '../data/schema';
import { foodKey, selectFood } from '../lib/budget';
import { FoodTierBadge } from './TierBadge';
import { NavButton, PhoneButton } from './NavButton';
import { PorkSafeNote, PorkWarningNote } from './PorkWarningNote';
import { PriceTag } from './PriceTag';
import { FoodModal } from './FoodModal';
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
export function FoodSection({
  dayId,
  food,
}: {
  readonly dayId: string;
  readonly food: readonly Food[];
}) {
  const { mode, upgrades } = useTrip();
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const active = new Set(
    selectFood(food, mode, dayId, upgrades).map((entry) => foodKey(dayId, entry)),
  );

  const bySlot = new Map<MealSlot, Food[]>();
  for (const entry of food) {
    const list = bySlot.get(entry.slot);
    if (list === undefined) bySlot.set(entry.slot, [entry]);
    else list.push(entry);
  }

  const slots = SLOT_ORDER.filter((slot) => bySlot.has(slot));
  if (slots.length === 0) {
    return <p className="text-sm text-text-muted">Bu gün için yemek planı yok.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {slots.map((slot) => (
        <div key={slot}>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
            {SLOT_LABEL[slot]}
          </h3>
          <ul className="mt-1 flex flex-col gap-2">
            {(bySlot.get(slot) ?? []).map((entry) => (
              <FoodRow
                key={foodKey(dayId, entry)}
                dayId={dayId}
                entry={entry}
                isActive={active.has(foodKey(dayId, entry))}
                onOpenModal={() => setSelectedFood(entry)}
              />
            ))}
          </ul>
        </div>
      ))}
      {selectedFood !== null && (
        <FoodModal
          food={selectedFood}
          dayId={dayId}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}

import { RatingBadge } from './RatingBadge';

function FoodRow({
  dayId,
  entry,
  isActive,
  onOpenModal,
}: {
  readonly dayId: string;
  readonly entry: Food;
  readonly isActive: boolean;
  readonly onOpenModal: () => void;
}) {
  const { mode, upgrades, toggleUpgrade } = useTrip();
  const key = foodKey(dayId, entry);
  const canUpgrade = mode === 'mixed' && entry.tier === 'a';
  const isUpgraded = upgrades.includes(key);

  return (
    <li
      className={`border bg-surface-2 p-3 ${isActive ? 'border-border' : 'border-dashed border-border opacity-70'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenModal}
            className="text-left font-display font-medium hover:underline hover:text-accent focus:outline-none"
          >
            {entry.name}
            {entry.michelin === true && (
              <span className="ml-2 inline-flex items-center text-xs text-accent">★ Michelin</span>
            )}
          </button>
          <RatingBadge rating={entry.rating} />
        </div>
        <div className="flex items-center gap-2">
          <FoodTierBadge tier={entry.tier} />
          <span className="text-sm font-semibold">
            <PriceTag amount={entry.price} />
          </span>
        </div>
      </div>

      {!isActive && (
        <p className="text-xs font-medium text-text-muted">
          {entry.tier === 'a' ? 'Sadece Keyif modunda' : 'Bu modda seçilmedi'}
        </p>
      )}

      {entry.why !== undefined && <p className="mt-1 text-sm">{entry.why}</p>}
      {entry.hours !== undefined && (
        <p className="text-xs text-text-muted">Saatler: {entry.hours}</p>
      )}
      {entry.priceNote !== undefined && (
        <p className="text-xs text-text-muted">Fiyat notu: {entry.priceNote}</p>
      )}

      {entry.porkWarning !== undefined && <PorkWarningNote warning={entry.porkWarning} />}
      {entry.porkSafe === true && <PorkSafeNote />}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <NavButton place={entry} />
        {entry.phone !== undefined && <PhoneButton phone={entry.phone} />}
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex min-h-11 items-center border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink"
        >
          Detaylar
        </button>
        {entry.booking !== undefined && (
          <span className="text-xs text-text-muted">
            Rezervasyon:{' '}
            {entry.booking === 'required'
              ? 'gerekli'
              : entry.booking === 'recommended'
                ? 'önerilir'
                : 'sadece telefonla'}
            {entry.bookingNote !== undefined && ` — ${entry.bookingNote}`}
          </span>
        )}
        {canUpgrade && (
          <button
            type="button"
            onClick={() => toggleUpgrade(key)}
            className={`ml-auto min-h-11 border px-3 py-2 text-xs font-semibold ${
              isUpgraded ? 'border-accent-2 bg-antimony text-ink' : 'border-border text-text-muted'
            }`}
          >
            {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : 'Karma’ya ekle'}
          </button>
        )}
      </div>
    </li>
  );
}

