import raw from '../../toskana-data.json';
import { tripDataSchema, type TripData } from './schema';

/**
 * The single source of truth, parsed once at module load.
 *
 * Parsing here (rather than lazily) means a malformed data file fails at the
 * first import — during `npm run build`, or on the first dev page load — not
 * halfway down a day detail screen while someone is standing in a street in
 * Arezzo.
 */
export const trip: TripData = tripDataSchema.parse(raw);

export const DATA_VERSION = `${trip.trip.title}@${trip.trip.startDate}`;
