import {
  Box,
  Button,
  Checkbox,
  Text,
  type BoxProps,
  type ButtonProps,
  type CheckboxRootProps,
  type TextProps,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';

/**
 * The three shapes that repeat everywhere in this app, so no screen has to
 * restate them.
 *
 * These are thin wrappers rather than theme recipe variants on purpose: recipe
 * variants need Chakra's typegen step to become type-safe props, and the app
 * only has three of them. A wrapper is typed for free and reads the same at
 * the call site.
 */

/** The small uppercase run-in label above every section, card and stat. */
export function Eyebrow(props: TextProps) {
  return <Text textStyle="eyebrow" color="fg.muted" {...props} />;
}

/** The bordered plate that lists, cards and disclosures sit on. */
export function Card(props: BoxProps) {
  return <Box layerStyle="card" {...props} />;
}

/**
 * The app's standard tap target: a flat bordered plate with cobalt text.
 * `minH="11"` (44px) is the floor for every interactive element here — this is
 * used one-handed, outdoors, while walking.
 */
export function SignButton(props: ButtonProps) {
  return (
    <Button
      variant="plain"
      minH="11"
      px="3"
      py="2"
      fontSize="sm"
      fontWeight="semibold"
      color="accent"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      rounded="l1"
      _hover={{ bg: 'bg.subtle' }}
      _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
      {...props}
    />
  );
}

/**
 * The app's one checkbox: "gezildi", packing items, bookings.
 *
 * Chakra's checked fill is driven by `colorPalette`, which expects a full
 * 50→950 scale. The signage palette is a set of exact single colours rather
 * than generated ramps, so the checked state is pinned to `accent` directly —
 * same reasoning as the tier chips in TierBadge.
 */
export function CheckRow({
  checked,
  onToggle,
  children,
  ...rest
}: {
  readonly checked: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
} & Omit<CheckboxRootProps, 'checked' | 'onCheckedChange' | 'children'>) {
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={onToggle}
      minH="11"
      gap="2"
      alignItems="center"
      cursor="pointer"
      {...rest}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control
        boxSize="5"
        flexShrink={0}
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
        rounded="l1"
        _checked={{ bg: 'accent', borderColor: 'accent', color: 'accent.fg' }}
      />
      <Checkbox.Label fontWeight="inherit">{children}</Checkbox.Label>
    </Checkbox.Root>
  );
}
