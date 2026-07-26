import { Badge, Span } from '@chakra-ui/react';

/**
 * A Google Maps rating (e.g. ★ 4.7).
 *
 * Antimony gold on a tinted ground rather than a stock amber: gold is already
 * the app's "worth noticing" colour (starred days, the plan's recommendation),
 * so a rating reads as part of that family instead of introducing a third
 * accent that answers to nothing in the theme.
 */
export function RatingBadge({ rating }: { readonly rating: number | undefined }) {
  if (rating === undefined) return null;

  return (
    <Badge
      variant="plain"
      bg="accentAlt.subtle"
      color="warn.fg"
      borderWidth="1px"
      borderColor="accentAlt"
      px="1.5"
      py="0.5"
      gap="1"
      fontSize="xs"
      fontWeight="semibold"
      flexShrink={0}
    >
      <Span aria-hidden="true" color="accentAlt">
        ★
      </Span>
      <Span fontVariantNumeric="tabular-nums">{rating.toFixed(1)}</Span>
    </Badge>
  );
}
