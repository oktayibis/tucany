import type { ReactNode } from 'react';

/**
 * The day detail's one disclosure primitive. Native `<details>` on purpose:
 * no state, no aria wiring to get wrong, and it still works in the print
 * stylesheet and with in-page find (browsers expand a `<details>` to reveal a
 * search hit). Everything the family does not need *while standing in a
 * piazza* lives inside one of these.
 */
export function Disclosure({
  title,
  count,
  hint,
  defaultOpen = false,
  children,
}: {
  readonly title: string;
  readonly count?: number | undefined;
  readonly hint?: string | undefined;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border border-border bg-surface-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="font-display text-base leading-none text-text-muted transition-transform group-open:rotate-90"
        >
          ›
        </span>
        <span className="font-display text-xs font-semibold uppercase tracking-wide">{title}</span>
        {count !== undefined && <span className="text-xs text-text-muted">({count})</span>}
        {hint !== undefined && <span className="ml-auto text-xs text-text-muted">{hint}</span>}
      </summary>
      <div className="border-t border-border p-3">{children}</div>
    </details>
  );
}
