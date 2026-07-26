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
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border/80 bg-surface-2 px-3.5 py-2 font-display text-xs font-bold text-accent shadow-xs active:scale-95 transition-all hover:bg-surface"
      >
        <span>🗺️</span>
        <span>Google Maps’te aç</span>
      </a>
      {showApple && (
        <a
          href={links.apple}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border/80 bg-surface-2 px-3.5 py-2 font-display text-xs font-bold text-accent shadow-xs active:scale-95 transition-all hover:bg-surface"
        >
          <span>🧭</span>
          <span>Apple Maps’te aç</span>
        </a>
      )}
      {note !== undefined && <span className="text-xs text-text-muted">{note}</span>}
    </span>
  );
}

export function PhoneButton({ phone }: { readonly phone: string }) {
  return (
    <a
      href={telHref(phone)}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border/80 bg-surface-2 px-3.5 py-2 font-display text-xs font-bold text-text shadow-xs active:scale-95 transition-all hover:bg-surface"
    >
      <span>📞</span>
      <span>{phone} (Ara)</span>
    </a>
  );
}
