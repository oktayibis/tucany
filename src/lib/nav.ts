/**
 * Map links.
 *
 * The `nav` URLs in the data are not decorative: they point at a *specific car
 * park* outside each ZTL zone, which is the whole point of the driving advice.
 * So whenever the author supplied one we reuse its search term verbatim for
 * Apple Maps too, rather than silently sending the family to the town centre
 * and a €100 fine.
 */

export type Place = {
  readonly name: string;
  readonly city?: string | undefined;
  readonly lat?: number | undefined;
  readonly lng?: number | undefined;
  readonly nav?: string | undefined;
};

export type MapLinks = {
  readonly google: string;
  readonly apple: string;
  /** True when the link points at the author's chosen car park, not the sight. */
  readonly isAuthorRoute: boolean;
};

/** Pulls the `query` parameter out of a Google Maps search URL. */
export function queryFromGoogleUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get('query');
  } catch {
    return null;
  }
}

function hasCoords(place: Place): place is Place & { lat: number; lng: number } {
  return typeof place.lat === 'number' && typeof place.lng === 'number';
}

/** Best available search term when there is no author URL. */
function searchTerm(place: Place): string {
  return place.city === undefined ? place.name : `${place.name} ${place.city}`;
}

export function mapLinks(place: Place): MapLinks {
  const authorQuery = place.nav === undefined ? null : queryFromGoogleUrl(place.nav);

  if (place.nav !== undefined && authorQuery !== null) {
    return {
      google: place.nav,
      apple: `https://maps.apple.com/?q=${encodeURIComponent(authorQuery)}`,
      isAuthorRoute: true,
    };
  }

  if (hasCoords(place)) {
    const pair = `${place.lat},${place.lng}`;
    return {
      google: `https://www.google.com/maps/search/?api=1&query=${pair}`,
      apple: `https://maps.apple.com/?ll=${pair}&q=${encodeURIComponent(place.name)}`,
      isAuthorRoute: false,
    };
  }

  const term = encodeURIComponent(searchTerm(place));
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${term}`,
    apple: `https://maps.apple.com/?q=${term}`,
    isAuthorRoute: false,
  };
}

/**
 * iOS detection, including iPadOS 13+, which reports itself as a Mac and can
 * only be told apart by the presence of a touchscreen.
 */
export function isIos(userAgent: string, maxTouchPoints: number): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}

/** Strips a phone number down to something `tel:` will dial. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
