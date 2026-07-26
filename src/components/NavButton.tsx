import { Text, Wrap } from '@chakra-ui/react';
import { useMemo } from 'react';
import { isIos, mapLinks, telHref, type Place } from '../lib/nav';
import { SignButton } from './ui/primitives';

/**
 * Opens a place in the phone's map app. Offers Apple Maps alongside Google
 * Maps on iOS — the brief calls this out explicitly, and it is the last
 * external link the app should ever produce: everything else stays put.
 *
 * `asChild` keeps these real anchors (long-press to copy, open in a new tab,
 * "Add to Home Screen" behaviour) while taking the button's tap-target size.
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
    <Wrap gap="2" align="center">
      <SignButton asChild>
        <a href={links.google} target="_blank" rel="noreferrer">
          Google Maps’te aç
        </a>
      </SignButton>
      {showApple && (
        <SignButton asChild>
          <a href={links.apple}>Apple Maps’te aç</a>
        </SignButton>
      )}
      {note !== undefined && (
        // `inherit` rather than `fg.muted`: this note also appears on the brown
        // signage plate in the day-list header, where a fixed muted grey is
        // unreadable. Inheriting plus opacity gives a muted note on any ground.
        <Text fontSize="xs" color="inherit" opacity={0.75}>
          {note}
        </Text>
      )}
    </Wrap>
  );
}

export function PhoneButton({ phone }: { readonly phone: string }) {
  return (
    <SignButton asChild color="fg" fontWeight="medium">
      <a href={telHref(phone)}>{phone} — ara</a>
    </SignButton>
  );
}
