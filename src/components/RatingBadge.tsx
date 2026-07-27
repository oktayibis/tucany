/**
 * Renders a Google Maps rating badge with a golden star (e.g. ⭐ 4.7).
 */
export function RatingBadge({ rating }: { readonly rating: number | undefined }) {
  if (rating === undefined) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
      <span aria-hidden="true" className="text-amber-500">★</span>
      <span>{rating.toFixed(1)}</span>
    </span>
  );
}
