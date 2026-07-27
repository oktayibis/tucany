import { useState } from 'react';
import type { Food, MealSlot } from '../data/schema';
import { foodKey, selectFood } from '../lib/budget';
import { euro } from '../lib/format';
import { useTrip } from '../state/TripContext';
import { FoodSheet, SLOT_LABEL, SLOT_ORDER } from './FoodSheet';
import { Icon } from './Icon';
import { PriceTag } from './PriceTag';

/**
 * The day's meals, one slot at a time in eating order, as the mockup's stack
 * of option cards: the venue this mode picked is ringed in terracotta, the
 * rest sit muted underneath with what they would add or save.
 *
 * The data lists several venues per slot and the *mode* picks one — the mockup
 * treats every card as freely clickable, but here the choice belongs to the
 * Keyif/Karma/Ucuz switch and the per-day upgrade toggle, so a card opens its
 * `FoodSheet` (where the upgrade lives) rather than silently overriding the
 * budget model. The alternatives stay behind a per-slot toggle: a Keyif-only
 * booking is worth knowing about while in Karma mode, but showing every one
 * unprompted used to double the length of every day. Nothing removed, ranked.
 */
export function FoodSection({
  dayId,
  food,
}: {
  readonly dayId: string;
  readonly food: readonly Food[];
}) {
  const { mode, upgrades } = useTrip();
  const [open, setOpen] = useState<Food | null>(null);

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
    return <p className="text-body text-neutral-700">Bu gün için yemek planı yok.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {slots.map((slot) => {
          const entries = bySlot.get(slot) ?? [];
          const chosen = entries.filter((entry) => active.has(foodKey(dayId, entry)));
          // A slot can end up with nothing selected in this mode (e.g. a
          // Keyif-only dinner while in Ucuz). Showing the alternatives as the
          // primary cards is better than showing an empty slot.
          const primary = chosen.length > 0 ? chosen : entries;
          const alternatives = entries.filter((entry) => !primary.includes(entry));

          return (
            <SlotGroup
              key={slot}
              slot={slot}
              primary={primary}
              alternatives={alternatives}
              anyChosen={chosen.length > 0}
              dayId={dayId}
              onOpen={setOpen}
            />
          );
        })}
      </div>

      {open !== null && <FoodSheet food={open} dayId={dayId} onClose={() => setOpen(null)} />}
    </>
  );
}

function SlotGroup({
  slot,
  primary,
  alternatives,
  anyChosen,
  dayId,
  onOpen,
}: {
  readonly slot: MealSlot;
  readonly primary: readonly Food[];
  readonly alternatives: readonly Food[];
  readonly anyChosen: boolean;
  readonly dayId: string;
  readonly onOpen: (food: Food) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  // What every other card in the slot is compared against.
  const basePrice = primary[0]?.price ?? 0;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-label uppercase tracking-[0.1em] text-accent-700">
          {SLOT_LABEL[slot]}
        </span>
        {alternatives.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="cursor-pointer text-[11.5px] text-neutral-600 underline underline-offset-2"
          >
            {showAll ? 'Alternatifleri gizle' : `${alternatives.length} alternatif`}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {primary.map((entry) => (
          <FoodOption
            key={foodKey(dayId, entry)}
            entry={entry}
            selected={anyChosen}
            delta={anyChosen ? 'seçili' : 'bu modda seçilmedi'}
            onOpen={onOpen}
          />
        ))}

        {showAll &&
          alternatives.map((entry) => (
            <FoodOption
              key={foodKey(dayId, entry)}
              entry={entry}
              selected={false}
              delta={priceDelta(entry.price, basePrice)}
              onOpen={onOpen}
            />
          ))}
      </div>
    </div>
  );
}

/** "+€155" / "−€40" / "" — what swapping to this venue would do to the day. */
function priceDelta(price: number, basePrice: number): string {
  const diff = price - basePrice;
  if (diff === 0) return '';
  return `${diff > 0 ? '+' : '−'}${euro(Math.abs(diff))}`;
}

function FoodOption({
  entry,
  selected,
  delta,
  onOpen,
}: {
  readonly entry: Food;
  readonly selected: boolean;
  readonly delta: string;
  readonly onOpen: (food: Food) => void;
}) {
  const flags = [
    entry.porkWarning !== undefined ? 'domuz riski' : undefined,
    entry.booking === 'required' ? 'rezervasyon gerekli' : undefined,
    entry.closedToday === true ? 'bugün kapalı' : undefined,
  ].filter((flag): flag is string => flag !== undefined);

  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left ${
        selected ? 'bg-accent-100 ring-2 ring-inset ring-accent' : 'bg-neutral-200 text-neutral-700'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15.5px] font-semibold leading-[1.3]">
          {entry.name}
        </span>
        <span className="mt-[5px] flex flex-wrap items-center gap-2 text-[12px]">
          {entry.rating !== undefined && (
            <span className="inline-flex items-center gap-[3px] text-accent-700">
              <Icon name="star" size={13} />
              {entry.rating.toFixed(1)}
            </span>
          )}
          {entry.michelin === true && <span className="tag tag-accent-2">Michelin</span>}
          {flags.map((flag) => (
            <span key={flag} className="tag tag-neutral">
              {flag}
            </span>
          ))}
        </span>
      </span>
      <span className="flex-none text-right">
        <span className="block font-display text-item font-semibold">
          <PriceTag amount={entry.price} />
        </span>
        {delta !== '' && (
          <span className="mt-[2px] block text-label text-accent-2-700">{delta}</span>
        )}
      </span>
    </button>
  );
}
