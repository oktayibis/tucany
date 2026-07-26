import type { Booking, Packing } from '../data/schema';

/**
 * Stable ids for the two checklists that have no `id` field in the data.
 * Position-based (`documents:0`) rather than text-based, so a later edit to
 * the wording of a packing line does not silently reset its tick — only
 * reordering or removing a line does, which is the honest boundary given
 * the data has no other identity to anchor to.
 */

export function bookingKey(booking: Booking): string {
  return `${booking.what}@${booking.date}`;
}

export type PackingCategory = keyof Packing;

export function packingKey(category: PackingCategory, index: number): string {
  return `${category}:${index}`;
}
