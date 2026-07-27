import { useEffect, useId, type ReactNode } from 'react';

/**
 * Bottom sheet on phones, centred dialog from `sm:` up. This is where all the
 * per-place depth went when the day detail became a list of rows: the row
 * answers "what and how much", the sheet answers everything else.
 *
 * Header and footer are sticky so the two things worth tapping — close, and
 * the nav buttons — stay reachable however long the body gets.
 */
export function Sheet({
  eyebrow,
  title,
  titleExtra,
  footer,
  onClose,
  children,
}: {
  readonly eyebrow?: string | undefined;
  readonly title: string;
  readonly titleExtra?: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl border border-border bg-surface shadow-xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 rounded-t-3xl border-b border-border bg-surface p-4">
          <div className="min-w-0">
            {eyebrow !== undefined && (
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-text-muted">
                {eyebrow}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="font-display text-display-lg">
                {title}
              </h2>
              {titleExtra}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-lg text-text-muted"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer !== undefined && (
          <div className="rounded-b-3xl border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
