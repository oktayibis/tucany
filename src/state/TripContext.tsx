import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { Party } from '../data/schema';
import { trip, DATA_VERSION } from '../data/trip';
import { tripBudget, type TripBudget } from '../lib/budget';
import { activeDayIndex, isWithinTrip } from '../lib/dates';
import { MODE_INFO, type Mode } from '../lib/modes';
import { useLocalStorage, usePersistentSet } from '../hooks/useLocalStorage';
import { useToday } from '../hooks/useToday';

/**
 * All state the app needs to share across screens: the mode switch, party
 * size, per-day choices, and the three persisted checklists. Lives in one
 * context so the bottom bar, the day list and a day detail all read the same
 * numbers without prop-drilling five levels deep.
 *
 * Everything here is either a plain persisted value or a `useMemo` derivation
 * over it — no component computes a price or a closure itself.
 */
export type TripContextValue = {
  readonly today: string;
  readonly isOnTrip: boolean;
  readonly activeDayId: string;

  readonly mode: Mode;
  readonly setMode: (mode: Mode) => void;

  readonly party: Party;
  readonly setParty: (party: Party) => void;

  readonly chosenOptions: Readonly<Record<string, string>>;
  readonly chooseOption: (dayId: string, optionId: string) => void;

  readonly upgrades: readonly string[];
  readonly toggleUpgrade: (key: string) => void;

  readonly visited: { readonly has: (id: string) => boolean; readonly toggle: (id: string) => void };
  readonly bookingsDone: {
    readonly has: (id: string) => boolean;
    readonly toggle: (id: string) => void;
  };
  readonly packingDone: {
    readonly has: (id: string) => boolean;
    readonly toggle: (id: string) => void;
  };

  readonly budget: TripBudget;
};

const TripContext = createContext<TripContextValue | null>(null);

const DEFAULT_PARTY: Party = trip.trip.party;

export function TripProvider({ children }: { readonly children: ReactNode }) {
  const today = useToday();
  const [mode, setMode] = useLocalStorage<Mode>(`${DATA_VERSION}.mode`, 'mixed');
  const [party, setParty] = useLocalStorage<Party>(`${DATA_VERSION}.party`, DEFAULT_PARTY);
  const [chosenOptions, setChosenOptions] = useLocalStorage<Readonly<Record<string, string>>>(
    `${DATA_VERSION}.options`,
    {},
  );
  const [upgradeList, setUpgradeList] = useLocalStorage<readonly string[]>(
    `${DATA_VERSION}.upgrades`,
    [],
  );

  const visited = usePersistentSet(`${DATA_VERSION}.visited`);
  const bookingsDone = usePersistentSet(`${DATA_VERSION}.bookings-done`);
  const packingDone = usePersistentSet(`${DATA_VERSION}.packing-done`);

  const chooseOption = useCallback(
    (dayId: string, optionId: string) => {
      setChosenOptions((current) => ({ ...current, [dayId]: optionId }));
    },
    [setChosenOptions],
  );

  const toggleUpgrade = useCallback(
    (key: string) => {
      setUpgradeList((current) =>
        current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
      );
    },
    [setUpgradeList],
  );

  const isOnTrip = isWithinTrip(trip.trip, today);
  const activeDayId = trip.days[activeDayIndex(trip.days, today)]?.id ?? trip.days[0]?.id ?? '';

  const budget = useMemo(
    () => tripBudget(trip, { mode, party, chosenOptions, upgrades: upgradeList }),
    [mode, party, chosenOptions, upgradeList],
  );

  const value: TripContextValue = {
    today,
    isOnTrip,
    activeDayId,
    mode,
    setMode,
    party,
    setParty,
    chosenOptions,
    chooseOption,
    upgrades: upgradeList,
    toggleUpgrade,
    visited,
    bookingsDone,
    packingDone,
    budget,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const value = useContext(TripContext);
  if (value === null) throw new Error('useTrip, TripProvider dışında çağrıldı');
  return value;
}

/** Convenience re-export so components importing mode info don't need two imports. */
export { MODE_INFO };
