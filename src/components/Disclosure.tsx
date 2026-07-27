import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/**
 * The day detail's one disclosure primitive, drawn as the mockup's 56px pill
 * row: leading icon, title, an optional right-aligned hint, and a chevron that
 * rotates when open.
 *
 * Native `<details>` on purpose: no state, no aria wiring to get wrong, and it
 * still works in the print stylesheet and with in-page find (browsers expand a
 * `<details>` to reveal a search hit). Everything the family does not need
 * *while standing in a piazza* lives inside one of these.
 */
export function Disclosure({
  title,
  icon,
  count,
  hint,
  defaultOpen = false,
  children,
}: {
  readonly title: string;
  readonly icon?: IconName | undefined;
  readonly count?: number | undefined;
  readonly hint?: string | undefined;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-2 rounded-xl bg-surface px-4 font-display text-body font-semibold [&::-webkit-details-marker]:hidden">
        {icon !== undefined && <Icon name={icon} size={18} className="text-accent-700" />}
        <span>{title}</span>
        {count !== undefined && (
          <span className="font-body text-note font-normal text-neutral-700">({count})</span>
        )}
        {hint !== undefined && (
          <span className="ml-auto font-body text-note font-normal text-neutral-700">{hint}</span>
        )}
        <Icon
          name="chevronDown"
          size={18}
          className={`text-neutral-700 transition-transform duration-150 group-open:rotate-180 ${
            hint === undefined ? 'ml-auto' : ''
          }`}
        />
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
