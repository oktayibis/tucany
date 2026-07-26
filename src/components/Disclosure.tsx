import { Box, Span, chakra } from '@chakra-ui/react';
import type { ReactNode } from 'react';

/**
 * The day detail's one disclosure primitive. Still a native `<details>` on
 * purpose rather than Chakra's `Accordion`: no state, no aria wiring to get
 * wrong, it survives the print stylesheet, and browsers expand a `<details>`
 * to reveal an in-page find hit — none of which an ARIA accordion gives you.
 * `chakra()` only adds token-aware styling on top of that element.
 *
 * Everything the family does not need *while standing in a piazza* lives
 * inside one of these.
 */
const Details = chakra('details', {
  base: {
    layerStyle: 'card',
    // Native `<details>` exposes no data-state, but `[open]` is a real
    // attribute — Chakra's `_open` condition matches it directly.
    '&[open] .disclosure-chevron': { transform: 'rotate(90deg)' },
  },
});

const Summary = chakra('summary', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minH: '11',
    px: '3',
    py: '2.5',
    cursor: 'pointer',
    listStyle: 'none',
    _hover: { bg: 'bg.subtle' },
    '&::-webkit-details-marker': { display: 'none' },
  },
});

export function Disclosure({
  title,
  count,
  hint,
  defaultOpen = false,
  children,
}: {
  readonly title: string;
  readonly count?: number | undefined;
  readonly hint?: string | undefined;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <Details open={defaultOpen}>
      <Summary>
        <Span
          className="disclosure-chevron"
          aria-hidden="true"
          fontFamily="heading"
          fontSize="md"
          lineHeight="none"
          color="fg.muted"
          transition="transform 150ms"
        >
          ›
        </Span>
        <Span textStyle="eyebrow">{title}</Span>
        {count !== undefined && (
          <Span fontSize="xs" color="fg.muted">
            ({count})
          </Span>
        )}
        {hint !== undefined && (
          <Span ms="auto" fontSize="xs" color="fg.muted">
            {hint}
          </Span>
        )}
      </Summary>
      <Box borderTopWidth="1px" borderColor="border" p="3">
        {children}
      </Box>
    </Details>
  );
}
