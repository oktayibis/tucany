import { Text } from '@chakra-ui/react';

/**
 * Inline pork callout attached to a specific food or stop entry.
 *
 * This is deliberately separate from the full pork guide (bottom-bar, step 6)
 * — the brief is explicit that the guidance must never be more than one tap
 * away, and repeating the specific trap right next to the dish that carries
 * it is more useful in the moment than sending the family off to a separate
 * screen.
 */
export function PorkWarningNote({ warning }: { readonly warning: string }) {
  return (
    <Text role="note" fontSize="sm" fontWeight="semibold" color="danger">
      ⚠ {warning}
    </Text>
  );
}

export function PorkSafeNote() {
  return (
    <Text fontSize="sm" fontWeight="medium" color="safe">
      ✓ Domuzsuz olduğu doğrulanmış
    </Text>
  );
}
