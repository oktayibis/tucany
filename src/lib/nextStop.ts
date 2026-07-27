import type { Stop } from '../data/schema';

/**
 * The one stop worth surfacing without opening the day: the first visible
 * (core/optional) stop not yet marked visited, in the order the plan lists
 * them — the same order-without-invented-clock-times `StopsSection` already
 * uses. Once everything is visited, falls back to the last one rather than
 * disappearing, so the day's closing action (usually "back to the hotel") is
 * always the standing suggestion.
 */
export function nextStop(
  stops: readonly Stop[],
  visited: { has: (id: string) => boolean },
): Stop | undefined {
  const visible = stops.filter((stop) => stop.tier === 'core' || stop.tier === 'optional');
  if (visible.length === 0) return undefined;
  return visible.find((stop) => !visited.has(stop.id)) ?? visible[visible.length - 1];
}
