import type { Food, MealSlot } from '../data/schema';
import { foodKey } from '../lib/budget';
import { NavButton, PhoneButton } from './NavButton';
import { PorkSafeNote, PorkWarningNote } from './PorkWarningNote';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';
import { Sheet } from './Sheet';
import { FoodTierBadge } from './TierBadge';
import { useTrip } from '../state/TripContext';

export const SLOT_LABEL: Readonly<Record<MealSlot, string>> = {
  coffee: 'Kahve',
  lunch: 'Öğle',
  aperitivo: 'Aperitivo',
  dinner: 'Akşam',
  snack: 'Atıştırmalık',
};

export const SLOT_ORDER: readonly MealSlot[] = ['coffee', 'lunch', 'aperitivo', 'dinner', 'snack'];

const BOOKING_LABEL: Readonly<Record<NonNullable<Food['booking']>, string>> = {
  required: 'Gerekli',
  recommended: 'Önerilir',
  'phone-only': 'Sadece telefonla',
};

/** Everything about one meal that no longer fits on its row in the day flow. */
export function FoodSheet({
  food,
  dayId,
  onClose,
}: {
  readonly food: Food;
  readonly dayId: string;
  readonly onClose: () => void;
}) {
  const { mode, upgrades, toggleUpgrade } = useTrip();
  const key = foodKey(dayId, food);
  const canUpgrade = mode === 'mixed' && food.tier === 'a';
  const isUpgraded = upgrades.includes(key);

  return (
    <Sheet
      eyebrow={SLOT_LABEL[food.slot]}
      title={food.name}
      titleExtra={<RatingBadge rating={food.rating} />}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <NavButton place={food} />
          {food.phone !== undefined && <PhoneButton phone={food.phone} />}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <FoodTierBadge tier={food.tier} />
        {food.michelin === true && (
          <span className="border border-accent px-1.5 py-0.5 text-xs font-semibold text-accent">
            ★ Michelin
          </span>
        )}
        <span className="ml-auto text-base font-semibold">
          <PriceTag amount={food.price} />
        </span>
      </div>
      {food.priceNote !== undefined && (
        <p className="mt-1 text-xs text-text-muted">Fiyat notu: {food.priceNote}</p>
      )}

      {food.closedToday === true && (
        <p className="mt-4 border border-danger bg-danger-bg p-3 text-sm font-semibold text-danger">
          Bugün kapalı.
        </p>
      )}

      {food.why !== undefined && <p className="mt-4 text-sm leading-relaxed">{food.why}</p>}

      <dl className="mt-4 flex flex-col gap-1.5 text-sm">
        {food.hours !== undefined && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-text-muted">Saatler</dt>
            <dd className="min-w-0 flex-1">{food.hours}</dd>
          </div>
        )}
        {food.closedOn !== undefined && food.closedOn.length > 0 && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-text-muted">Kapalı</dt>
            <dd className="min-w-0 flex-1">{food.closedOn.join(', ')}</dd>
          </div>
        )}
        {food.booking !== undefined && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-text-muted">Rezervasyon</dt>
            <dd className="min-w-0 flex-1">
              {BOOKING_LABEL[food.booking]}
              {food.bookingNote !== undefined && ` — ${food.bookingNote}`}
            </dd>
          </div>
        )}
      </dl>

      {food.porkWarning !== undefined && (
        <div className="mt-4">
          <PorkWarningNote warning={food.porkWarning} />
        </div>
      )}
      {food.porkSafe === true && (
        <div className="mt-4">
          <PorkSafeNote />
        </div>
      )}

      {canUpgrade && (
        <div className="mt-5 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => toggleUpgrade(key)}
            className={`min-h-11 rounded-full border px-3 py-2 text-xs font-semibold ${
              isUpgraded ? 'border-accent-2 bg-olive text-ink' : 'border-border text-text-muted'
            }`}
          >
            {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : 'Karma’ya ekle'}
          </button>
        </div>
      )}
    </Sheet>
  );
}
