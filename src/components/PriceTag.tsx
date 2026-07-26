import { Span, type SpanProps } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { euro } from '../lib/format';

/**
 * A price that pulses briefly when its value changes — the one motion the
 * brief asks for done well: "a mode-switch transition on the numbers is
 * worth doing well. Nothing else needs to move." Every price on screen
 * routes through this so switching Keyif/Karma/Ucuz reads as the numbers
 * visibly reacting, not silently swapping.
 *
 * Remounting on every change (via `key`) is what makes the animation restart
 * reliably; `prefers-reduced-motion` zeroes the duration globally in the
 * theme's `globalCss`, so this degrades to an instant value change with no
 * extra code path.
 */
export function PriceTag({ amount, ...rest }: { readonly amount: number } & SpanProps) {
  const previous = useRef(amount);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (previous.current !== amount) {
      previous.current = amount;
      setPulseKey((current) => current + 1);
    }
  }, [amount]);

  return (
    <Span
      key={pulseKey}
      display="inline-block"
      fontVariantNumeric="tabular-nums"
      animation="pricePulse 320ms ease-out"
      {...rest}
    >
      {euro(amount)}
    </Span>
  );
}
