import { useCallback, useEffect, useState } from 'react';

/**
 * Persisted state.
 *
 * The key carries a *storage* version, not the data version. That is the point:
 * editing toskana-data.json must not wipe the ticks the family already made.
 * Bump STORAGE_VERSION only when the stored shape itself changes, and old
 * entries are ignored rather than misread.
 */
const STORAGE_VERSION = 'v1';

const storageKey = (name: string): string => `toskana.${STORAGE_VERSION}.${name}`;

function read<T>(name: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(storageKey(name));
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Private browsing, a full disk, or a value from an older shape.
    return fallback;
  }
}

export function useLocalStorage<T>(name: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(name, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(name), JSON.stringify(value));
    } catch {
      // Nothing useful to do offline on a full device; keep the app running.
    }
  }, [name, value]);

  return [value, setValue] as const;
}

/**
 * A persisted set of ids — visited stops, ticked checklist rows.
 * Stored as an array because Sets do not survive JSON.
 */
export function usePersistentSet(name: string) {
  const [ids, setIds] = useLocalStorage<readonly string[]>(name, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      setIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
    },
    [setIds],
  );

  const clear = useCallback(() => setIds([]), [setIds]);

  return { ids, has, toggle, clear, size: ids.length } as const;
}
