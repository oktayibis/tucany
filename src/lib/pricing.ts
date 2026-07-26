import type { Party } from '../data/schema';

/**
 * How a price in the data relates to the number of people.
 *
 * The data almost never says. Rather than guess, this module only treats a
 * price as per-person when the data *states* it in a price note, and treats
 * everything else as a single figure for the whole table. The UI shows which
 * is which, so nobody trusts a number that was never split.
 */
export type PriceBasis =
  | {
      readonly kind: 'group';
      /** Why we are not scaling it — shown in the party-size tooltip. */
      readonly reason: 'stated-total' | 'assumed-total';
    }
  | {
      readonly kind: 'perAdult';
      /** Number of adults the written price covers. */
      readonly baselineAdults: number;
      /** Price for one adult. */
      readonly unit: number;
      /**
       * Whether the data *says* the child is not charged, or we merely inferred
       * it from the price arithmetic. Both real cases in this trip divide
       * cleanly by the adult count, but only Accademia states the exemption —
       * the other is an assumption the UI has to own.
       */
      readonly childExemption: 'stated' | 'inferred-from-total';
      /** The sentence in the data that established this. */
      readonly evidence: string;
    };

/** Matches "3 yetiskin", "3 yetişkin". */
const ADULT_COUNT = /(\d+)\s*yeti[sş]kin/i;
/** Matches "50 EUR/kisi", "50 EUR / kişi", "kisi basi". */
const PER_PERSON = /\/\s*ki[sş]i|ki[sş]i\s*ba[sş][iı]/i;
/** Matches "18 yas alti UCRETSIZ" and friends. */
const CHILDREN_FREE = /18\s*ya[sş]\s*alt[iı].*(?:[uü]cretsiz|bedava)/i;

/**
 * Classify a written price.
 *
 * `note` should be the field that describes the *price* (`costNote` /
 * `priceNote`) — deliberately not `why`, because prose like "3 yetişkin tek
 * bir bistecca'yı rahat paylaşır" says the opposite of per-person and would
 * triple a shared steak.
 */
export function classifyPrice(
  amount: number,
  note: string | undefined,
  defaultAdults: number,
): PriceBasis {
  if (note === undefined || note.trim() === '') {
    return { kind: 'group', reason: 'assumed-total' };
  }

  const adultMatch = ADULT_COUNT.exec(note);
  const perPerson = PER_PERSON.test(note);
  if (adultMatch === null && !perPerson) {
    return { kind: 'group', reason: 'assumed-total' };
  }

  const stated = adultMatch?.[1];
  const baselineAdults = stated === undefined ? defaultAdults : Number(stated);
  if (!Number.isFinite(baselineAdults) || baselineAdults <= 0) {
    return { kind: 'group', reason: 'assumed-total' };
  }

  return {
    kind: 'perAdult',
    baselineAdults,
    unit: amount / baselineAdults,
    childExemption: CHILDREN_FREE.test(note) ? 'stated' : 'inferred-from-total',
    evidence: note.trim(),
  };
}

/**
 * Apply the party size.
 *
 * Group prices are returned untouched — a €25 roast chicken that feeds four
 * does not become €31 because a fifth person joined, and pretending otherwise
 * would be fake precision.
 *
 * Per-adult prices scale by adult count only. Both per-adult prices in this
 * trip are written as `adults × unit` with the six-year-old already left out
 * (Accademia because under-18s are free, Officina because the author counted
 * three covers), so adding the child here would make the default party size
 * disagree with the plan it is supposed to be reporting.
 */
export function applyParty(base: number, basis: PriceBasis, party: Party): number {
  return basis.kind === 'group' ? base : basis.unit * party.adults;
}

/** True when changing the party size would move this price at all. */
export function scalesWithParty(basis: PriceBasis): boolean {
  return basis.kind === 'perAdult';
}
