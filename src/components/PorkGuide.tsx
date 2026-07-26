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
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-28">
      <div className="flex flex-col gap-1">
        <h1 className="text-display-lg font-bold text-text">🚫 Domuz Rehberi</h1>
        <p className="text-xs text-text-muted font-medium">
          İtalya'da garsona göstermek ve domuz etli yemeklerden kaçınmak için hızlı rehber.
        </p>
      </div>

      <div role="tablist" aria-label="Domuz rehberi sekmeleri" className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-2 p-1.5 shadow-xs">
        <TabButton active={tab === 'guide'} onClick={() => onTabChange('guide')}>
          🛡️ Kaçın / Güvenli
        </TabButton>
        <TabButton active={tab === 'phrases'} onClick={() => onTabChange('phrases')}>
          🗣️ Cümleler (Garsona Göster)
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
      className={`min-h-11 flex-1 rounded-lg px-3 py-2 font-display text-xs font-bold transition-all ${
        active ? 'bg-accent text-white shadow-xs' : 'text-text-muted hover:bg-surface hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

function GuideTab({ guide }: { readonly guide: PorkGuideData }) {
  const { avoid, avoidNote, safe, caution } = guide;
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border-2 border-danger bg-danger-bg p-4 shadow-xs">
        <h2 className="font-display text-base font-bold text-danger flex items-center gap-1.5">
          <span>⛔</span> Bunlardan Kaçının
        </h2>
        <p className="mt-1 text-xs font-medium text-danger/90">{avoidNote}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {avoid.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-danger/80 bg-surface-2 px-2.5 py-1 text-xs font-bold text-danger shadow-xs"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border/80 bg-surface-2 p-4 shadow-xs">
        <h2 className="font-display text-base font-bold text-text flex items-center gap-1.5">
          <span>✅</span> Güvenli Yemekler
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left uppercase tracking-wider text-text-muted">
                <th className="py-2 pr-2 font-display font-bold">Yemek</th>
                <th className="py-2 pr-2 font-display font-bold">Açıklama</th>
                <th className="py-2 font-display font-bold">Fiyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {safe.map((dish) => (
                <tr key={dish.dish}>
                  <td className="py-2.5 pr-2 font-bold text-safe">{dish.dish}</td>
                  <td className="py-2.5 pr-2 font-medium text-text">{dish.desc}</td>
                  <td className="py-2.5 tabular-nums font-bold text-text-muted">{dish.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {caution.length > 0 && (
        <section className="rounded-xl border border-warn-border bg-warn-bg p-4 text-warn-text shadow-xs">
          <h2 className="font-display text-base font-bold flex items-center gap-1.5">
            <span>❓</span> Sorun, Emin Olun
          </h2>
          <ul className="mt-2 flex flex-col gap-1.5 text-xs">
            {caution.map((item) => (
              <li key={item.dish} className="leading-snug">
                <strong className="font-bold">{item.dish}:</strong> {item.note}
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
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-text-muted bg-surface p-2.5 rounded-lg border border-border/60">
        💡 Bir cümleye dokun, tam ekran büyüsün — garsona göstermek için telefonu çevirin.
      </p>
      <ul className="flex flex-col gap-2.5">
        {phrases.map((phrase) => (
          <li key={phrase.tr}>
            <button
              type="button"
              onClick={() => setFullscreen(phrase)}
              className="group flex min-h-12 w-full flex-col gap-1 rounded-xl border border-border/80 bg-surface-2 p-3.5 text-left shadow-xs transition-all active:scale-[0.99] hover:border-accent/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {CATEGORY_LABEL[phrase.category]}
                </span>
                <span className="text-xs font-bold text-accent group-hover:translate-x-0.5 transition-transform">
                  Büyüt 🔍
                </span>
              </div>
              <span className="text-base font-bold text-text">{phrase.it}</span>
              <span className="text-xs font-medium text-text-muted">{phrase.tr}</span>
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
