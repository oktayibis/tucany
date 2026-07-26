import { useState } from 'react';
import { trip } from '../data/trip';
import type { Phrase, PorkGuide as PorkGuideData } from '../data/schema';

type Tab = 'guide' | 'phrases';

const CATEGORY_LABEL: Readonly<Record<Phrase['category'], string>> = {
  pork: 'Domuz',
  market: 'Pazar',
  restaurant: 'Restoran',
  general: 'Genel',
};

/**
 * Reachable from the bottom bar on every screen — this is the one thing that
 * must never take more than one tap, since the whole point is being usable
 * mid-order, not after looking something up first.
 */
export function PorkGuide({
  tab,
  onTabChange,
}: {
  readonly tab: Tab;
  readonly onTabChange: (tab: Tab) => void;
}) {
  const { porkGuide, phrases } = trip;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-24">
      <h1 className="text-display-lg font-semibold">Domuz rehberi</h1>

      <div role="tablist" aria-label="Domuz rehberi sekmeleri" className="flex border border-border bg-surface-2">
        <TabButton active={tab === 'guide'} onClick={() => onTabChange('guide')}>
          Kaçın / Güvenli
        </TabButton>
        <TabButton active={tab === 'phrases'} onClick={() => onTabChange('phrases')}>
          Cümleler
        </TabButton>
      </div>

      {tab === 'guide' ? <GuideTab guide={porkGuide} /> : <PhrasesTab phrases={phrases} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-11 flex-1 font-display text-sm font-semibold ${
        active ? 'bg-accent text-white' : 'text-text-muted'
      }`}
    >
      {children}
    </button>
  );
}

function GuideTab({ guide }: { readonly guide: PorkGuideData }) {
  const { avoid, avoidNote, safe, caution } = guide;
  return (
    <div className="flex flex-col gap-5">
      <section className="border-2 border-danger bg-danger-bg p-3">
        <h2 className="font-display text-base font-semibold text-danger">Bunlardan kaçının</h2>
        <p className="mt-1 text-sm text-danger">{avoidNote}</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {avoid.map((item) => (
            <li
              key={item}
              className="border border-danger bg-surface-2 px-2 py-1 text-sm font-medium text-danger"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-base font-semibold">Güvenli yemekler</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="py-1.5 pr-2 font-display font-medium">Yemek</th>
                <th className="py-1.5 pr-2 font-display font-medium">Açıklama</th>
                <th className="py-1.5 font-display font-medium">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {safe.map((dish) => (
                <tr key={dish.dish} className="border-b border-border">
                  <td className="py-2 pr-2 font-semibold text-safe">{dish.dish}</td>
                  <td className="py-2 pr-2">{dish.desc}</td>
                  <td className="py-2 tabular-nums text-text-muted">{dish.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {caution.length > 0 && (
        <section className="border border-warn-border bg-warn-bg p-3 text-warn-text">
          <h2 className="font-display text-base font-semibold">Sor, emin olma</h2>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {caution.map((item) => (
              <li key={item.dish}>
                <span className="font-semibold">{item.dish}:</span> {item.note}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PhrasesTab({ phrases }: { readonly phrases: readonly Phrase[] }) {
  const [fullscreen, setFullscreen] = useState<Phrase | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-text-muted">
        Bir cümleye dokun, tam ekran büyüsün — telefonu çevirip garsona göster.
      </p>
      <ul className="flex flex-col gap-2">
        {phrases.map((phrase) => (
          <li key={phrase.tr}>
            <button
              type="button"
              onClick={() => setFullscreen(phrase)}
              className="flex min-h-11 w-full flex-col gap-1 border border-border bg-surface-2 p-3 text-left"
            >
              <span className="font-display text-xs font-medium uppercase tracking-wide text-text-muted">
                {CATEGORY_LABEL[phrase.category]}
              </span>
              <span className="text-base font-semibold">{phrase.it}</span>
              <span className="text-sm text-text-muted">{phrase.tr}</span>
            </button>
          </li>
        ))}
      </ul>

      {fullscreen !== null && (
        <FullscreenPhrase phrase={fullscreen} onClose={() => setFullscreen(null)} />
      )}
    </div>
  );
}

function FullscreenPhrase({
  phrase,
  onClose,
}: {
  readonly phrase: Phrase;
  readonly onClose: () => void;
}) {
  // Short phrases ("Il conto, per favore") get the full dramatic size; the
  // one long explanatory sentence about pork needs to actually fit, so size
  // steps down by length rather than using one fixed size for everything.
  const sizeClass =
    phrase.it.length <= 40 ? 'text-6xl' : phrase.it.length <= 80 ? 'text-5xl' : 'text-3xl';

  return (
    // Outer element is the scroll container with normal block flow; the
    // inner flex uses min-height (not a fixed height) to centre short
    // phrases while letting the rare long one grow and scroll normally —
    // `justify-center` combined directly with `overflow-auto` on the same
    // element can strand the top of tall content off-screen with no way to
    // scroll to it, which is exactly what happened before this fix.
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Büyütülmüş cümle"
      className="fixed inset-0 z-20 overflow-y-auto bg-surface-2 text-ink"
    >
      <div className="flex min-h-full flex-col items-center justify-center gap-8 p-6">
        <p className={`text-center font-bold leading-tight text-balance ${sizeClass}`}>
          {phrase.it}
        </p>
        <p className="text-center text-xl text-text-muted">{phrase.tr}</p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 border border-border bg-surface px-6 py-3 font-semibold text-text"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
