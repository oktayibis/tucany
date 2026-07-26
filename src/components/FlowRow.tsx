import type { ReactNode } from 'react';

/**
 * One tappable line in the day's flow — a stop or a meal. The whole row opens
 * a detail sheet, so a row carries only what you scan for while moving: what
 * it is, roughly how long, what it costs. Everything else (why, hours, pork
 * notes, nav, phone) is one tap away and nothing is lost.
 *
 * Rows are hairline-separated inside a single bordered card rather than being
 * cards themselves; a ten-stop day used to be ten stacked boxes.
 */
export function FlowRow({
  marker,
  name,
  meta,
  trailing,
  dimmed = false,
  onOpen,
}: {
  readonly marker?: ReactNode;
  readonly name: ReactNode;
  readonly meta?: ReactNode;
  readonly trailing?: ReactNode;
  readonly dimmed?: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <li className="border-b border-border/40 last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className={`group flex min-h-12 w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface/50 active:bg-surface ${
          dimmed ? 'opacity-55' : ''
        }`}
      >
        {/* Always reserved, even when empty, so meal names line up with stop names. */}
        <span className="flex w-6 shrink-0 justify-center">{marker}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-semibold text-text group-hover:text-accent transition-colors">{name}</span>
          {meta !== undefined && (
            <span className="mt-0.5 block text-xs font-medium text-text-muted">{meta}</span>
          )}
        </span>
        {trailing !== undefined && (
          <span className="shrink-0 text-right font-display text-sm font-bold text-text">{trailing}</span>
        )}
        <span aria-hidden="true" className="shrink-0 font-display text-base font-bold text-accent group-hover:translate-x-0.5 transition-transform">
          ›
        </span>
      </button>
    </li>
  );
}

/** The numbered dot in a stop row's marker slot; fills in once marked visited. */
export function StopMarker({ index, visited }: { readonly index: number; readonly visited: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border font-display text-xs font-bold shadow-xs ${
        visited ? 'border-safe bg-safe text-white' : 'border-accent bg-surface text-accent'
      }`}
    >
      {visited ? '✓' : index}
    </span>
  );
}

/** A single card wrapping a run of `FlowRow`s. */
export function FlowList({ children }: { readonly children: ReactNode }) {
  return <ul className="rounded-xl border border-border/80 bg-surface-2 shadow-xs overflow-hidden">{children}</ul>;
}
