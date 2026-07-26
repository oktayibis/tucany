import { useEffect } from 'react';
import type { Food, MealSlot } from '../data/schema';
import { foodKey } from '../lib/budget';
import { FoodTierBadge } from './TierBadge';
import { NavButton, PhoneButton } from './NavButton';
import { PorkSafeNote, PorkWarningNote } from './PorkWarningNote';
import { PriceTag } from './PriceTag';
import { useTrip } from '../state/TripContext';

const SLOT_LABEL: Readonly<Record<MealSlot, string>> = {
  coffee: 'Kahve',
  lunch: 'Öğle Yemeği',
  aperitivo: 'Aperitivo',
  dinner: 'Akşam Yemeği',
  snack: 'Atıştırmalık',
};

import { RatingBadge } from './RatingBadge';

export function FoodModal({
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-modal-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border bg-surface p-5 shadow-xl transition-all sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div>
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-text-muted">
              {SLOT_LABEL[food.slot]}
            </span>
            <div className="flex items-center gap-2">
              <h2 id="food-modal-title" className="font-display text-xl font-semibold text-ink">
                {food.name}
              </h2>
              <RatingBadge rating={food.rating} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-border text-lg font-bold text-text-muted hover:bg-surface-2"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FoodTierBadge tier={food.tier} />
          {food.michelin === true && (
            <span className="inline-flex items-center rounded border border-accent bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              ★ Michelin
            </span>
          )}
          <span className="ml-auto text-base font-bold">
            <PriceTag amount={food.price} />
          </span>
        </div>

        {food.priceNote !== undefined && (
          <p className="mt-1 text-xs text-text-muted">Fiyat notu: {food.priceNote}</p>
        )}

        {food.why !== undefined && (
          <div className="mt-4 rounded bg-surface-2 p-3 text-sm text-ink">
            <p className="font-semibold text-xs text-text-muted uppercase mb-1">💡 Mekan Türü & Neden Önerildi?</p>
            <p className="leading-relaxed">{food.why}</p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 text-sm">
          {food.hours !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-muted">Saatler:</span>
              <span>{food.hours}</span>
            </div>
          )}

          {food.closedToday === true && (
            <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
              ⚠️ Uyarı: Bu restoran bugün kapalı!
            </div>
          )}

          {food.closedOn !== undefined && food.closedOn.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-medium">Kapalı günler:</span>
              <span>{food.closedOn.join(', ')}</span>
            </div>
          )}

          {food.booking !== undefined && (
            <div className="rounded bg-surface-2 p-2.5 text-xs text-text-muted">
              <span className="font-semibold">Rezervasyon: </span>
              <span>
                {food.booking === 'required'
                  ? 'Gerekli'
                  : food.booking === 'recommended'
                    ? 'Önerilir'
                    : 'Sadece telefonla'}
              </span>
              {food.bookingNote !== undefined && <span> — {food.bookingNote}</span>}
            </div>
          )}
        </div>

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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <NavButton place={food} />
            {food.phone !== undefined && <PhoneButton phone={food.phone} />}
          </div>

          {canUpgrade && (
            <button
              type="button"
              onClick={() => toggleUpgrade(key)}
              className={`min-h-11 border px-3 py-2 text-xs font-semibold ${
                isUpgraded ? 'border-accent-2 bg-antimony text-ink' : 'border-border text-text-muted'
              }`}
            >
              {isUpgraded ? '✓ Karma’ya eklendi — kaldır' : 'Karma’ya ekle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
