import { useState } from 'react';
import type { Food, MealSlot } from '../data/schema';
import { foodKey, selectFood } from '../lib/budget';
import { useTrip } from '../state/TripContext';
import { FlowList, FlowRow } from './FlowRow';
import { FoodSheet, SLOT_LABEL, SLOT_ORDER } from './FoodSheet';
import { PriceTag } from './PriceTag';
import { RatingBadge } from './RatingBadge';

/**
 * The day's meals, one slot at a time in eating order.
 *
 * The data lists several venues per slot and the mode picks one. That full
 * list is still worth having — a Keyif-only booking is worth knowing about
 * while in Karma mode — but it used to double the length of every day. So the
 * chosen venue is the row you see, and the rest sit behind a per-slot
 * "N alternatif" toggle. Nothing was removed, only ranked.
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
    return <p className="text-sm text-text-muted">Bu gün için yemek planı yok.</p>;
  }

  return (
    <>
      <FlowList>
        {slots.map((slot) => {
          const entries = bySlot.get(slot) ?? [];
          const chosen = entries.filter((entry) => active.has(foodKey(dayId, entry)));
          // A slot can end up with nothing selected in this mode (e.g. a
          // Keyif-only dinner while in Ucuz). Showing the alternatives as the
          // primary rows is better than showing an empty slot.
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
      </FlowList>

      {open !== null && (
        <FoodSheet food={open} dayId={dayId} onClose={() => setOpen(null)} />
      )}
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

  return (
    <>
      <li className="border-b border-border bg-surface px-3 py-1.5">
        <span className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
          {SLOT_LABEL[slot]}
        </span>
      </li>

      {primary.map((entry) => (
        <FoodFlowRow
          key={foodKey(dayId, entry)}
          entry={entry}
          dimmed={!anyChosen}
          note={anyChosen ? undefined : 'bu modda seçilmedi'}
          onOpen={onOpen}
        />
      ))}

      {showAll &&
        alternatives.map((entry) => (
          <FoodFlowRow
            key={foodKey(dayId, entry)}
            entry={entry}
            dimmed
            note={entry.tier === 'a' ? 'sadece Keyif modunda' : 'bu modda seçilmedi'}
            onOpen={onOpen}
          />
        ))}

      {alternatives.length > 0 && (
        <li className="border-b border-border last:border-b-0">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-accent"
          >
            <span aria-hidden="true" className="w-6 text-center font-display text-base">
              {showAll ? '−' : '+'}
            </span>
            {showAll ? 'Alternatifleri gizle' : `${alternatives.length} alternatif`}
          </button>
        </li>
      )}
    </>
  );
}

function FoodFlowRow({
  entry,
  dimmed,
  note,
  onOpen,
}: {
  readonly entry: Food;
  readonly dimmed: boolean;
  readonly note: string | undefined;
  readonly onOpen: (food: Food) => void;
}) {
  const meta = [
    note,
    entry.porkWarning !== undefined ? '⚠ domuz riski' : undefined,
    entry.booking === 'required' ? 'rezervasyon gerekli' : undefined,
    entry.closedToday === true ? 'bugün kapalı' : undefined,
  ].filter((part): part is string => part !== undefined);

  return (
    <FlowRow
      name={
        <span className="flex flex-wrap items-center gap-1.5">
          {entry.name}
          <RatingBadge rating={entry.rating} />
          {entry.michelin === true && (
            <span className="font-body text-xs font-semibold text-accent">★ Michelin</span>
          )}
        </span>
      }
      meta={meta.length > 0 ? meta.join(' · ') : undefined}
      trailing={<PriceTag amount={entry.price} />}
      dimmed={dimmed}
      onOpen={() => onOpen(entry)}
    />
  );
}
