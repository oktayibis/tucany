import { useEffect, useState } from 'react';
import { toIsoDate } from '../lib/dates';

/**
 * Today's date, re-read periodically so the app notices when midnight passes
 * without needing a reload — relevant for a trip that runs multiple days with
 * the phone rarely closed.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => toIsoDate(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setToday((current) => {
        const next = toIsoDate(new Date());
        return next === current ? current : next;
      });
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return today;
}
