import { useMemo } from 'react';
import { Icon } from './Icon';
import { mapHref, MAP_APP_INFO, telHref, type Place } from '../lib/nav';
import { useTrip } from '../state/TripContext';

/**
 * Opens a place in the map app the family chose. Everywhere the mockup draws a
 * navigation affordance it is this button: a terracotta pill carrying the
 * Lucide `navigation` arrow, sometimes with a label, sometimes just the arrow
 * squeezed in beside a stop row.
 *
 * Google Maps or Apple Haritalar is a single setting (`MapAppSwitch`), not a
 * per-link pair of buttons: most of these buttons are bare arrows wedged into
 * a row with no space for a second control, so a pair would have been offered
 * only in the few roomy places and missing exactly where the family taps most.
 * These are the last external links the app produces; everything else stays
 * put.
 */
export function NavButton({
  place,
  label,
  note,
  variant = 'primary',
  iconSize = 17,
  className = '',
}: {
  readonly place: Place;
  readonly label?: string | undefined;
  /** Free-text hint from the data (`stop.navNote`), e.g. where to actually park. */
  readonly note?: string | undefined;
  readonly variant?: 'primary' | 'secondary';
  readonly iconSize?: number;
  readonly className?: string;
}) {
  const { mapApp } = useTrip();
  const href = useMemo(() => mapHref(place, mapApp), [place, mapApp]);

  const shell = variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary';
  const button = (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={
        label === undefined
          ? `${place.name} için ${MAP_APP_INFO[mapApp].full}'te yol tarifi`
          : undefined
      }
      className={`${shell} ${className}`}
    >
      <Icon
        name="nav"
        size={iconSize}
        className={variant === 'secondary' ? 'text-accent-700' : ''}
      />
      {label}
    </a>
  );

  if (note === undefined) return button;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {button}
      <span className="text-meta text-neutral-700">{note}</span>
    </span>
  );
}

/** The hotel's phone number as a square icon button, matching the mockup's header pair. */
export function PhoneButton({
  phone,
  className = '',
}: {
  readonly phone: string;
  readonly className?: string;
}) {
  return (
    <a
      href={telHref(phone)}
      aria-label={`${phone} numarasını ara`}
      className={`btn btn-secondary border-accent-700 text-accent-800 ${className}`}
    >
      <PhoneGlyph />
    </a>
  );
}

/**
 * Lucide's `phone` is the one glyph the app needs at a single call site, so it
 * is drawn inline rather than widening the icon module for one button.
 */
function PhoneGlyph() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
