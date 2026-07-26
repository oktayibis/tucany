import type { Intensity } from '../data/schema';

const LEVEL: Readonly<Record<Intensity, number>> = {
  low: 1,
  'low-medium': 2,
  medium: 3,
  'medium-high': 4,
  high: 5,
};

const LABEL: Readonly<Record<Intensity, string>> = {
  low: 'Düşük tempo',
  'low-medium': 'Düşük-orta tempo',
  medium: 'Orta tempo',
  'medium-high': 'Orta-yüksek tempo',
  high: 'Yüksek tempo',
};

/** Five-bar tempo indicator. A screen reader announces the label, not "3/5". */
export function IntensityMeter({ intensity }: { readonly intensity: Intensity }) {
  const level = LEVEL[intensity];
  return (
    <span
      role="img"
      aria-label={LABEL[intensity]}
      title={LABEL[intensity]}
      className="inline-flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((bar) => (
        <span
          key={bar}
          aria-hidden="true"
          className={`inline-block h-3 w-1 rounded-full ${bar <= level ? 'bg-current' : 'bg-current/25'}`}
        />
      ))}
    </span>
  );
}
