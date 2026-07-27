import { Icon } from './Icon';

/**
 * A Google Maps rating (e.g. ★ 4.7). The design system has no amber in it, so
 * this reads as terracotta-on-page like every other rating in the mockup —
 * a bordered amber chip was the one element still shouting in a different
 * palette from everything around it.
 */
export function RatingBadge({ rating }: { readonly rating: number | undefined }) {
  if (rating === undefined) return null;

  return (
    <span className="inline-flex items-center gap-[3px] text-meta text-accent-700">
      <Icon name="star" size={13} />
      {rating.toFixed(1)}
    </span>
  );
}
