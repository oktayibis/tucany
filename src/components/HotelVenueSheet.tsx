import type { NearbyVenue, NearbyVenueCategory } from '../data/schema';
import { weekdayDisplay } from '../lib/dates';
import { NavButton, PhoneButton } from './NavButton';
import { PorkSafeNote, PorkWarningNote } from './PorkWarningNote';
import { RatingBadge } from './RatingBadge';
import { Sheet } from './Sheet';

export const CATEGORY_LABEL: Readonly<Record<NearbyVenueCategory, string>> = {
  restaurant: 'Restoran',
  pizza: 'Pizza',
  bakery: 'Fırın & Pastane',
  gelato: 'Dondurma',
};

/** Detailed sheet for a venue near the base hotel. */
export function HotelVenueSheet({
  venue,
  onClose,
}: {
  readonly venue: NearbyVenue;
  readonly onClose: () => void;
}) {
  return (
    <Sheet
      eyebrow={`Otel çevresi · ${CATEGORY_LABEL[venue.category]}`}
      title={venue.name}
      titleExtra={<RatingBadge rating={venue.rating} />}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <NavButton place={venue} label="Yol tarifi" />
          {venue.phone !== undefined && <PhoneButton phone={venue.phone} />}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-1.5 text-meta font-semibold">
        <span className="tag tag-neutral">{venue.distanceNote}</span>
        {venue.priceNote !== undefined && <span className="tag tag-accent">{venue.priceNote}</span>}
      </div>

      <p className="mt-3 text-note leading-relaxed text-text">{venue.why}</p>

      {venue.menuHighlights.length > 0 && (
        <div className="mt-4">
          <h4 className="section-label">Menüden</h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {venue.menuHighlights.map((item) => (
              <span key={item} className="tag tag-accent-2">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <dl className="mt-4 flex flex-col gap-1.5 text-note">
        <Row label="Adres">{venue.address}</Row>
        <Row label="Saatler">{venue.hours}</Row>
        {venue.closedOn !== undefined && venue.closedOn.length > 0 && (
          <Row label="Kapalı" danger>
            {venue.closedOn.map(weekdayDisplay).join(', ')}
          </Row>
        )}
        {venue.phone !== undefined && <Row label="Telefon">{venue.phone}</Row>}
        {venue.ratingNote !== undefined && <Row label="Puan">{venue.ratingNote}</Row>}
      </dl>

      {venue.porkWarning !== undefined && (
        <div className="mt-4">
          <PorkWarningNote warning={venue.porkWarning} />
        </div>
      )}
      {venue.porkSafe === true && venue.porkWarning === undefined && (
        <div className="mt-4">
          <PorkSafeNote />
        </div>
      )}

      {venue.sourceUrl !== undefined && (
        <p className="mt-4 border-t border-border pt-3 text-meta text-neutral-700">
          Saatler ve puan{' '}
          <a
            href={venue.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            kaynaktan
          </a>{' '}
          alındı. Yola çıkmadan önce telefonla teyit edin.
        </p>
      )}
    </Sheet>
  );
}

function Row({
  label,
  danger = false,
  children,
}: {
  readonly label: string;
  readonly danger?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <dt className={`w-24 shrink-0 ${danger ? 'font-semibold text-danger' : 'text-text-muted'}`}>
        {label}
      </dt>
      <dd className={`min-w-0 flex-1 ${danger ? 'font-semibold text-danger' : ''}`}>{children}</dd>
    </div>
  );
}
