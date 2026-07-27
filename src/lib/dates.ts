import type { Day, TripMeta, Weekday } from '../data/schema';

/**
 * Calendar-date helpers.
 *
 * Everything here treats an ISO date as a *calendar day in the traveller's own
 * timezone*, never as an instant. `new Date('2026-07-29')` parses as UTC
 * midnight, which in Copenhagen is 02:00 on the 29th but in Los Angeles is
 * 17:00 on the 28th — that bug would put "Bugün" on the wrong day. So we
 * always build dates from explicit local components.
 */

/** Index 0 = Sunday, matching `Date.prototype.getDay()`. */
const WEEKDAY_BY_INDEX = [
  'Pazar',
  'Pazartesi',
  'Sali',
  'Carsamba',
  'Persembe',
  'Cuma',
  'Cumartesi',
] as const satisfies readonly Weekday[];

const MONTHS_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

/** Chip-sized month names, for the header's date range where "Ağustos" won't fit. */
const MONTHS_SHORT_TR = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
] as const;

/** Human-readable weekday with proper Turkish spelling, for display only. */
const WEEKDAY_DISPLAY: Readonly<Record<Weekday, string>> = {
  Pazar: 'Pazar',
  Pazartesi: 'Pazartesi',
  Sali: 'Salı',
  Carsamba: 'Çarşamba',
  Persembe: 'Perşembe',
  Cuma: 'Cuma',
  Cumartesi: 'Cumartesi',
};

/** Parses `YYYY-MM-DD` to local midnight. Throws on malformed input. */
export function parseIsoDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) throw new Error(`Geçersiz tarih: ${iso}`);
  const [, year, month, day] = match;
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Geçersiz tarih: ${iso}`);
  }
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** The local calendar date of `now` as `YYYY-MM-DD`. */
export function toIsoDate(now: Date): string {
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Weekday derived from the date itself, in the data's spelling. */
export function weekdayOf(iso: string): Weekday {
  const index = parseIsoDate(iso).getDay();
  const weekday = WEEKDAY_BY_INDEX[index];
  if (weekday === undefined) throw new Error(`Hafta günü çözülemedi: ${iso}`);
  return weekday;
}

export function weekdayDisplay(weekday: Weekday): string {
  return WEEKDAY_DISPLAY[weekday];
}

/** "29 Temmuz" — the way the family would say it. */
export function formatDayMonth(iso: string): string {
  const date = parseIsoDate(iso);
  const month = MONTHS_TR[date.getMonth()];
  if (month === undefined) throw new Error(`Ay çözülemedi: ${iso}`);
  return `${date.getDate()} ${month}`;
}

/**
 * "29 Tem – 7 Ağu 2026" — the trip's span as one chip-sized string. The year
 * is printed once at the end, and the month is dropped from the start when
 * both ends fall in the same one ("3 – 7 Ağu 2026").
 */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const startMonth = MONTHS_SHORT_TR[start.getMonth()];
  const endMonth = MONTHS_SHORT_TR[end.getMonth()];
  if (startMonth === undefined || endMonth === undefined) {
    throw new Error(`Ay çözülemedi: ${startIso} – ${endIso}`);
  }
  const sameMonth = start.getFullYear() === end.getFullYear() && startMonth === endMonth;
  const left = sameMonth ? `${start.getDate()}` : `${start.getDate()} ${startMonth}`;
  return `${left} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const millisPerDay = 86_400_000;
  const start = parseIsoDate(from).getTime();
  const end = parseIsoDate(to).getTime();
  return Math.round((end - start) / millisPerDay);
}

export function isToday(iso: string, today: string): boolean {
  return iso === today;
}

export function isWithinTrip(trip: TripMeta, iso: string): boolean {
  return iso >= trip.startDate && iso <= trip.endDate;
}

/**
 * Which day to open on. Today's day when the family is actually on the trip,
 * otherwise day 1 — so the app is useful both while planning and while there.
 */
export function activeDayIndex(days: readonly Day[], today: string): number {
  const index = days.findIndex((day) => day.date === today);
  return index === -1 ? 0 : index;
}

/** Days until departure. Zero on the day itself, negative once under way. */
export function daysUntilStart(trip: TripMeta, today: string): number {
  return daysBetween(today, trip.startDate);
}

/** "2 sa 15 dk" · "30 dk" · "yolculuk yok". */
export function formatDriving(totalMinutes: number): string {
  if (totalMinutes <= 0) return 'yolculuk yok';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} dk`;
  if (minutes === 0) return `${hours} sa`;
  return `${hours} sa ${minutes} dk`;
}
