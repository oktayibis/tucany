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
    <p role="note" className="text-sm font-medium text-red-700 dark:text-red-400">
      ⚠ {warning}
    </p>
  );
}

export function PorkSafeNote() {
  return (
    <p className="text-sm text-emerald-700 dark:text-emerald-400">✓ Domuzsuz olduğu doğrulanmış</p>
  );
}
