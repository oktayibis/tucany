import { trip } from '../data/trip';
import { chosenOption, dayLineItems } from '../lib/budget';
import { effectiveWeekday } from '../lib/closures';
import { formatDayMonth, formatDriving, weekdayDisplay } from '../lib/dates';
import { euro } from '../lib/format';
import { gapsForDay } from '../lib/gaps';
import { MODE_INFO } from '../lib/modes';
import { ALL_CLOSURES, ALL_GAPS } from '../state/derived';
import { useTrip } from '../state/TripContext';

/**
 * The whole trip as one linear paper document — a PDF backup for when the
 * phone is dead or signal is gone entirely. Always mounted (see App.tsx),
 * hidden on screen (`hidden print:block`) and the only thing visible when
 * printing (the rest of the app gets `print:hidden`). Deliberately not the
 * interactive components: no buttons, no checkboxes that do nothing on
 * paper, no nav chrome — just what the brief asks for, one day per page.
 */
export function PrintView() {
  const { mode, party, chosenOptions, upgrades, budget } = useTrip();
  const input = { mode, party, chosenOptions, upgrades };

  return (
    <div className="hidden print:block print:text-black">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">{trip.trip.title}</h1>
        <p className="text-sm">
          {formatDayMonth(trip.trip.startDate)} – {formatDayMonth(trip.trip.endDate)} ·{' '}
          {trip.trip.nights} gece · {trip.base.name} · {trip.base.phone}
        </p>
        <p className="text-sm">
          Bütçe modu: {MODE_INFO[mode].label} · {party.adults} yetişkin + {party.children} çocuk ·
          Toplam: {euro(budget.grandTotal)} (yakıt/otoyol/otopark dahil)
        </p>
        <ul className="mt-2 text-sm">
          {trip.trip.constraints.map((constraint) => (
            <li key={constraint}>• {constraint}</li>
          ))}
        </ul>
      </header>

      {trip.days.map((day, index) => {
        const closures = ALL_CLOSURES.find((candidate) => candidate.dayId === day.id);
        const gaps = gapsForDay(ALL_GAPS, day.id);
        const items = dayLineItems(day, input);
        const option = chosenOption(day, input);
        const weekday = closures?.weekday ?? effectiveWeekday(day);

        return (
          <section key={day.id} className="break-after-page">
            <h2 className="font-display text-2xl font-bold">
              {index + 1}. Gün · {weekdayDisplay(weekday)} · {formatDayMonth(day.date)} — {day.title}
            </h2>
            <p className="text-sm">Sürüş: {formatDriving(day.drivingMinutes)}</p>

            {(day.warnings.length > 0 || (closures?.blocking.length ?? 0) > 0) && (
              <div className="mt-1 border border-black p-2 text-sm">
                <strong>Dikkat:</strong>
                <ul>
                  {day.warnings.map((warning) => (
                    <li key={warning}>⚠ {warning}</li>
                  ))}
                  {closures?.blocking.map((thing) => (
                    <li key={thing.name}>⚠ {thing.name} bugün ({weekdayDisplay(weekday)}) kapalı.</li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="mt-3 font-display text-lg font-semibold">Rota / navigasyon</h3>
            {day.timeline !== undefined && (
              <ol className="text-sm">
                {day.timeline.map((entry) => (
                  <li key={entry.time}>
                    {entry.time} — {entry.what}
                  </li>
                ))}
              </ol>
            )}

            <h3 className="mt-3 font-display text-lg font-semibold">Görülecek</h3>
            {day.options !== undefined ? (
              <ul className="text-sm">
                {day.options.map((opt) => (
                  <li key={opt.id}>
                    {opt.id === option?.id ? '☑' : '☐'} <strong>{opt.label}</strong> ({euro(opt.cost)}
                    ) — {opt.desc}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="text-sm">
                {day.stops.map((stop) => {
                  const item = items.find((line) => line.id === stop.id);
                  const dropped = stop.tier === 'skip' || stop.tier === 'removed';
                  return (
                    <li key={stop.id} className={dropped ? 'italic' : ''}>
                      ☐ <strong>{stop.name}</strong>
                      {item !== undefined && ` — ${euro(item.amount)}`}
                      {dropped &&
                        ` — atlandı: ${stop.skipReason ?? stop.removedReason ?? ''}`}
                      {stop.why !== undefined && ` — ${stop.why}`}
                    </li>
                  );
                })}
              </ul>
            )}

            <h3 className="mt-3 font-display text-lg font-semibold">Yemek</h3>
            <ul className="text-sm">
              {day.food.map((entry) => (
                <li key={`${entry.slot}-${entry.name}`}>
                  <strong>{entry.name}</strong> ({euro(entry.price)})
                  {entry.porkWarning !== undefined && ` — ⚠ ${entry.porkWarning}`}
                  {entry.porkSafe === true && ' — ✓ domuzsuz'}
                  {entry.phone !== undefined && ` — Tel: ${entry.phone}`}
                </li>
              ))}
            </ul>

            <h3 className="mt-3 font-display text-lg font-semibold">Alışveriş</h3>
            {day.shopping.length === 0 ? (
              <p className="text-sm">—</p>
            ) : (
              <ul className="text-sm">
                {day.shopping.map((entry) => (
                  <li key={entry.name}>
                    <strong>{entry.name}</strong> — {entry.for}
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-3 font-display text-lg font-semibold">Notlar</h3>
            <ul className="text-sm">
              {day.highlight !== undefined && <li>★ {day.highlight}</li>}
              {day.elderNote !== undefined && <li>Anne için: {day.elderNote}</li>}
              {day.revised !== undefined && <li>Değişiklik: {day.revised}</li>}
              {gaps.map((gap) => (
                <li key={gap.id}>ⓘ {gap.what}</li>
              ))}
            </ul>
          </section>
        );
      })}

      <section>
        <h2 className="font-display text-2xl font-bold">Domuz rehberi</h2>
        <p className="text-sm">
          <strong>Kaçının:</strong> {trip.porkGuide.avoid.join(', ')}
        </p>
        <p className="text-sm">{trip.porkGuide.avoidNote}</p>
        <table className="mt-1 w-full border-collapse text-sm">
          <tbody>
            {trip.porkGuide.safe.map((dish) => (
              <tr key={dish.dish}>
                <td className="pr-2 font-semibold">{dish.dish}</td>
                <td className="pr-2">{dish.desc}</td>
                <td>{dish.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-3 font-display text-lg font-semibold">Cümleler</h3>
        <ul className="text-sm">
          {trip.phrases.map((phrase) => (
            <li key={phrase.tr}>
              <strong>{phrase.it}</strong> — {phrase.tr}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
