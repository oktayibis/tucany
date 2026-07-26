import { useEffect, useRef, useState } from 'react';
import { euro } from '../lib/format';

/**
 * A price that pulses briefly when its value changes — the one motion the
 * brief asks for done well: "a mode-switch transition on the numbers is
 * worth doing well. Nothing else needs to move." Every price on screen
 * routes through this so switching Keyif/Karma/Ucuz reads as the numbers
 * visibly reacting, not silently swapping.
 *
 * Remounting on every change (via `key`) is what makes the CSS animation
 * restart reliably; `prefers-reduced-motion` zeroes the animation duration
 * globally, so this degrades to an instant value change with no extra code.
 */
export function PriceTag({
  amount,
  className = '',
}: {
  readonly amount: number;
  readonly className?: string;
}) {
  const previous = useRef(amount);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (previous.current !== amount) {
      previous.current = amount;
      setPulseKey((current) => current + 1);
    }
  }, [amount]);

  return (
    <span key={pulseKey} className={`price-pulse inline-block tabular-nums ${className}`}>
      {euro(amount)}
    </span>
  );
}
