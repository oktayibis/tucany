import { trip } from '../data/trip';
import { allDayClosures } from '../lib/closures';
import { findGaps } from '../lib/gaps';

/**
 * Derivation that depends only on the static trip data, not on anything the
 * user chooses. Computed once at module load instead of on every render.
 */
export const ALL_GAPS = findGaps(trip);
export const ALL_CLOSURES = allDayClosures(trip);
