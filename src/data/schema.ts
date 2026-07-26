import { z } from 'zod';

/**
 * Zod schema for toskana-data.json.
 *
 * Every object is `.strict()` on purpose: if the data file grows a field we
 * have not modelled, validation fails loudly instead of the UI silently
 * dropping trip information. Optional fields below are optional *in the data*,
 * not "maybe we forgot" — the gap detector in src/lib/gaps.ts reports the ones
 * whose absence actually costs the family something.
 */

/* ------------------------------------------------------------------ */
/* Discriminated-union tag vocabularies                                */
/* ------------------------------------------------------------------ */

/** Weekday names exactly as the data spells them (Turkish, no diacritics). */
export const WEEKDAYS = [
  'Pazar',
  'Pazartesi',
  'Sali',
  'Carsamba',
  'Persembe',
  'Cuma',
  'Cumartesi',
] as const;
export const weekdaySchema = z.enum(WEEKDAYS);

/** How a stop is treated by the plan. Drives card rendering. */
export const stopTierSchema = z.enum(['core', 'optional', 'skip', 'removed']);

/** Which budget mode a food option belongs to. `both` = eaten in every mode. */
export const foodTierSchema = z.enum(['a', 'b', 'both']);

export const themeSchema = z.enum([
  'arrival',
  'local',
  'city',
  'market',
  'rest',
  'scenic',
  'craft',
  'departure',
]);

export const intensitySchema = z.enum(['low', 'low-medium', 'medium', 'medium-high', 'high']);

export const severitySchema = z.enum(['info', 'warning', 'critical']);

export const prioritySchema = z.enum(['high', 'medium', 'low', 'optional']);

export const mealSlotSchema = z.enum(['coffee', 'lunch', 'aperitivo', 'dinner', 'snack']);

export const bookingKindSchema = z.enum(['required', 'recommended', 'phone-only']);

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/** ISO calendar date, YYYY-MM-DD. */
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD bekleniyor');

/** 24h wall clock, HH:MM. */
export const clockSchema = z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM bekleniyor');

const eur = z.number().nonnegative();
const minutes = z.number().int().nonnegative();

/* ------------------------------------------------------------------ */
/* Trip header                                                         */
/* ------------------------------------------------------------------ */

export const partySchema = z
  .object({
    adults: z.number().int().positive(),
    children: z.number().int().nonnegative(),
    childAgeApprox: z.number().int().nonnegative(),
  })
  .strict();

export const tripMetaSchema = z
  .object({
    title: z.string(),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    nights: z.number().int().positive(),
    currency: z.literal('EUR'),
    locale: z.string(),
    party: partySchema,
    constraints: z.array(z.string()),
  })
  .strict();

export const baseSchema = z
  .object({
    name: z.string(),
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    placeId: z.string().optional(),
    phone: z.string(),
    amenities: z.array(z.string()),
    checkInFrom: clockSchema,
  })
  .strict();

export const flightSchema = z
  .object({
    dir: z.enum(['out', 'back']),
    date: isoDateSchema,
    from: z.string(),
    to: z.string(),
    dep: clockSchema,
    arr: clockSchema,
    carrier: z.string(),
  })
  .strict();

export const carSchema = z.object({ model: z.string(), note: z.string() }).strict();

/* ------------------------------------------------------------------ */
/* Budget                                                              */
/* ------------------------------------------------------------------ */

/**
 * Headline figures written by the plan author. These are round estimates and
 * are NOT the sum of the per-item prices — see src/lib/gaps.ts, which reports
 * the divergence rather than papering over it.
 */
export const budgetSchema = z
  .object({
    modes: z
      .object({
        a: z.object({ label: z.string(), foodAndTickets: eur }).strict(),
        mixed: z.object({ label: z.string(), foodAndTickets: eur }).strict(),
        b: z.object({ label: z.string(), foodAndTickets: eur }).strict(),
      })
      .strict(),
    fixed: z
      .object({ fuel: eur, tolls: eur, parking: eur, totalKm: z.number().positive() })
      .strict(),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* Day content                                                         */
/* ------------------------------------------------------------------ */

export const stopSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    city: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    placeId: z.string().optional(),
    tier: stopTierSchema,
    /** Total euros for the whole party unless `costNote` says otherwise. */
    cost: eur.optional(),
    /** Free/cheaper way to do the same stop. */
    costAlt: eur.optional(),
    costAltNote: z.string().optional(),
    /** How the price is composed, e.g. "3 yetiskin; 18 yas alti UCRETSIZ". */
    costNote: z.string().optional(),
    durationMin: minutes.optional(),
    hours: z.string().optional(),
    bestTime: z.string().optional(),
    phone: z.string().optional(),
    booking: bookingKindSchema.optional(),
    why: z.string().optional(),
    skipReason: z.string().optional(),
    removedReason: z.string().optional(),
    nav: z.url().optional(),
    navNote: z.string().optional(),
    tags: z.array(z.enum(['market', 'shopping'])).optional(),
  })
  .strict();

export const foodSchema = z
  .object({
    slot: mealSlotSchema,
    tier: foodTierSchema,
    name: z.string(),
    /** Total euros for the whole table unless `priceNote` says per person. */
    price: eur,
    priceNote: z.string().optional(),
    why: z.string().optional(),
    hours: z.string().optional(),
    phone: z.string().optional(),
    booking: bookingKindSchema.optional(),
    bookingNote: z.string().optional(),
    closedOn: z.array(weekdaySchema).optional(),
    /** Author-asserted closure for this specific day. Cross-checked in lib/closures.ts. */
    closedToday: z.boolean().optional(),
    michelin: z.boolean().optional(),
    /** Explicitly verified as containing no pork. */
    porkSafe: z.boolean().optional(),
    /** Pork trap at this venue and how to order around it. */
    porkWarning: z.string().optional(),
    /** Author flagged this as non-negotiable in every mode. */
    keep: z.boolean().optional(),
    nav: z.url().optional(),
  })
  .strict();

export const shoppingSchema = z
  .object({
    name: z.string(),
    for: z.string(),
    address: z.string().optional(),
    cost: eur.nullable().optional(),
    tip: z.string().optional(),
    highlight: z.boolean().optional(),
    nav: z.url().optional(),
  })
  .strict();

/** Day 9 offers three mutually exclusive itineraries instead of a stop list. */
export const dayOptionSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    desc: z.string(),
    cost: eur,
    recommended: z.boolean().optional(),
    nav: z.url().optional(),
  })
  .strict();

/** Departure-day minute-by-minute schedule. */
export const timelineEntrySchema = z.object({ time: clockSchema, what: z.string() }).strict();

export const daySchema = z
  .object({
    id: z.string(),
    date: isoDateSchema,
    weekday: weekdaySchema,
    title: z.string(),
    theme: themeSchema,
    intensity: intensitySchema,
    elderFriendly: z.boolean(),
    drivingMinutes: minutes,
    /** Author's headline day budget. Cross-checked against item sums. */
    budget: z.object({ a: eur, b: eur }).strict(),
    warnings: z.array(z.string()),
    elderNote: z.string().optional(),
    highlight: z.string().optional(),
    /** Explains a change already applied to the plan. */
    revised: z.string().optional(),
    starred: z.boolean().optional(),
    stops: z.array(stopSchema),
    food: z.array(foodSchema),
    shopping: z.array(shoppingSchema),
    options: z.array(dayOptionSchema).optional(),
    timeline: z.array(timelineEntrySchema).optional(),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* Cross-cutting sections                                              */
/* ------------------------------------------------------------------ */

export const bookingSchema = z
  .object({
    priority: prioritySchema,
    what: z.string(),
    date: isoDateSchema,
    how: z.string(),
    when: z.string(),
    cost: eur,
  })
  .strict();

export const porkGuideSchema = z
  .object({
    avoid: z.array(z.string()).nonempty(),
    avoidNote: z.string(),
    safe: z
      .array(z.object({ dish: z.string(), desc: z.string(), price: z.string() }).strict())
      .nonempty(),
    caution: z.array(z.object({ dish: z.string(), note: z.string() }).strict()),
  })
  .strict();

export const phraseSchema = z
  .object({
    tr: z.string(),
    it: z.string(),
    category: z.enum(['pork', 'market', 'restaurant', 'general']),
  })
  .strict();

export const tipSchema = z
  .object({
    id: z.string(),
    icon: z.string(),
    title: z.string(),
    body: z.string(),
    severity: severitySchema,
  })
  .strict();

export const closureSchema = z
  .object({
    place: z.string(),
    closed: z.array(weekdaySchema),
    note: z.string().optional(),
  })
  .strict();

export const packingSchema = z
  .object({
    documents: z.array(z.string()),
    tech: z.array(z.string()),
    heat: z.array(z.string()),
    emergency: z.array(z.string()),
  })
  .strict();

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

export const tripDataSchema = z
  .object({
    $schema: z.string().optional(),
    trip: tripMetaSchema,
    base: baseSchema,
    flights: z.array(flightSchema),
    car: carSchema,
    budget: budgetSchema,
    days: z.array(daySchema).nonempty(),
    bookings: z.array(bookingSchema),
    porkGuide: porkGuideSchema,
    phrases: z.array(phraseSchema).nonempty(),
    tips: z.array(tipSchema),
    closures: z.array(closureSchema),
    packing: packingSchema,
  })
  .strict();

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */

export type Weekday = z.infer<typeof weekdaySchema>;
export type StopTier = z.infer<typeof stopTierSchema>;
export type FoodTier = z.infer<typeof foodTierSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Intensity = z.infer<typeof intensitySchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type MealSlot = z.infer<typeof mealSlotSchema>;
export type BookingKind = z.infer<typeof bookingKindSchema>;

export type Party = z.infer<typeof partySchema>;
export type TripMeta = z.infer<typeof tripMetaSchema>;
export type Base = z.infer<typeof baseSchema>;
export type Flight = z.infer<typeof flightSchema>;
export type Car = z.infer<typeof carSchema>;
export type Budget = z.infer<typeof budgetSchema>;

export type Stop = z.infer<typeof stopSchema>;
export type Food = z.infer<typeof foodSchema>;
export type Shopping = z.infer<typeof shoppingSchema>;
export type DayOption = z.infer<typeof dayOptionSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;
export type Day = z.infer<typeof daySchema>;

export type Booking = z.infer<typeof bookingSchema>;
export type PorkGuide = z.infer<typeof porkGuideSchema>;
export type Phrase = z.infer<typeof phraseSchema>;
export type Tip = z.infer<typeof tipSchema>;
export type Closure = z.infer<typeof closureSchema>;
export type Packing = z.infer<typeof packingSchema>;
export type TripData = z.infer<typeof tripDataSchema>;
