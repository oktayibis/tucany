import { useMemo } from 'react';
import { isIos, mapLinks, telHref, type Place } from '../lib/nav';

/**
 * Opens a place in the phone's map app. Offers Apple Maps alongside Google
 * Maps on iOS — the brief calls this out explicitly, and it is the last
 * external link the app should ever produce: everything else stays put.
 */
export function NavButton({
  place,
  note,
}: {
  readonly place: Place;
  readonly note?: string | undefined;
}) {
  const links = useMemo(() => mapLinks(place), [place]);
  const showApple = useMemo(
    () => isIos(window.navigator.userAgent, window.navigator.maxTouchPoints),
    [],
  );

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <a
        href={links.google}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center rounded border px-3 py-2 text-sm font-medium"
      >
        Google Maps’te aç
      </a>
      {showApple && (
        <a
          href={links.apple}
          className="inline-flex min-h-11 items-center rounded border px-3 py-2 text-sm font-medium"
        >
          Apple Maps’te aç
        </a>
      )}
      {note !== undefined && <span className="text-xs opacity-75">{note}</span>}
    </span>
  );
}

export function PhoneButton({ phone }: { readonly phone: string }) {
  return (
    <a
      href={telHref(phone)}
      className="inline-flex min-h-11 items-center rounded border px-3 py-2 text-sm font-medium"
    >
      {phone} — ara
    </a>
  );
}
