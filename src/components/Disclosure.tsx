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
    <details open={defaultOpen} className="group rounded-xl border border-border/80 bg-surface-2 shadow-xs transition-all">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 px-4 py-3 [&::-webkit-details-marker]:hidden hover:bg-surface/50 rounded-xl">
        <span
          aria-hidden="true"
          className="font-display text-lg font-bold leading-none text-accent transition-transform group-open:rotate-90"
        >
          ›
        </span>
        <span className="font-display text-xs font-bold uppercase tracking-wider text-text">{title}</span>
        {count !== undefined && <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-text-muted border border-border/60">({count})</span>}
        {hint !== undefined && <span className="ml-auto font-display text-xs font-semibold text-text-muted">{hint}</span>}
      </summary>
      <div className="border-t border-border/40 p-4 pt-3">{children}</div>
    </details>
  );
}
