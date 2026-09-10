import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getZone, getOtherZones } from "@/lib/db/zones";
import { withPhoto } from "@/lib/destinations";
import { prepareDestination } from "@/lib/surf/matching";
import { LEVEL_LABELS } from "@/lib/surf/levels";
import { SEASON_LABELS } from "@/lib/surf/season";
import {
  validateSearch,
  destinationHref,
  searchQuery,
  type SearchParams,
} from "@/lib/validation/search";
import { bookingConfig } from "@/lib/travel/config";
import { TravelpayoutsWidget } from "@/components/travel/TravelpayoutsWidget";
import { BookingForm } from "@/components/travel/BookingForm";
import { SeasonTimeline } from "@/components/destination/SeasonTimeline";
import { Icon } from "@/components/ui/Icon";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const zone = await getZone(slug);
  if (!zone)
    return { title: "Destination introuvable", robots: { index: false } };
  const description = `Surf à ${zone.name}, ${zone.country} : ${zone.spots.length} spot${zone.spots.length > 1 ? "s" : ""} documenté${zone.spots.length > 1 ? "s" : ""}, niveaux et saisons.${zone.airportCode ? ` Aéroport d’arrivée : ${zone.airportCode}.` : ""}`;
  return {
    title: `Surf à ${zone.name} : spots, saison et niveau`,
    description,
    alternates: {
      canonical: `/destination/${encodeURIComponent(zone.zoneId)}`,
    },
    openGraph: {
      title: `Surf à ${zone.name}`,
      description,
      url: `/destination/${encodeURIComponent(zone.zoneId)}`,
    },
  };
}
export default async function DestinationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const zone = await getZone(slug);
  if (!zone) notFound();
  const query = await searchParams;
  const hasTrip = ["origine", "dateDepart", "dateRetour", "niveau"].some(
    (key) => query[key] !== undefined,
  );
  const validation = hasTrip
    ? validateSearch(
        {
          origine: query.origine,
          dateDepart: query.dateDepart,
          dateRetour: query.dateRetour,
          niveau: query.niveau,
          region: query.region,
        },
        [zone.country],
      )
    : null;
  const criteria = validation?.success ? validation.data : undefined;
  const d = withPhoto(prepareDestination(zone, criteria));
  const related = zone.airportCode
    ? (await getOtherZones(zone.airportCode, zone.zoneId))
        .map((z) => prepareDestination(z, criteria))
        .filter((z) => !criteria || z.compatibleSpots > 0)
    : [];
  const booking =
    criteria && d.airportCode && d.compatibleSpots > 0
      ? bookingConfig({
          origin: criteria.origine,
          destination: d.airportCode,
          departure: criteria.dateDepart,
          returnDate: criteria.dateRetour,
        })
      : null;
  return (
    <main id="main-content" className="destination-page">
      <div className="container">
        <Link
          className="back-link"
          href={
            criteria ? `/recherche?${searchQuery(criteria)}` : "/destinations"
          }
        >
          <Icon name="arrow" size={17} />
          {criteria ? "Revenir aux résultats" : "Toutes les destinations"}
        </Link>
        <div className="detail-heading">
          <div>
            <p className="eyebrow">{d.country}</p>
            <h1>
              {d.name}
              <span className="text-ocean">.</span>
            </h1>
            <p>Les spots, la saison, ton prochain départ.</p>
          </div>
          <span className="detail-coordinates">{d.coordinates}</span>
        </div>
        {d.image && (
          <div className="detail-photo">
            <Image
              src={d.image}
              alt={d.imageAlt || d.name}
              fill
              preload
              sizes="(max-width:1400px) 95vw,1280px"
              quality={85}
            />
          </div>
        )}
        <div className="detail-grid">
          <div>
            <p className="eyebrow">L’ESPRIT DU SPOT</p>
            <h2>Ton prochain terrain de jeu.</h2>
            {d.notes && <p className="body-copy">{d.notes}</p>}
            <h3>
              {criteria
                ? "Les spots accessibles à ton niveau"
                : "Les spots de la zone"}
            </h3>
            {criteria && !d.compatibleSpots && (
              <p className="caution">
                Aucun spot documenté dans cette zone n’est accessible à ton
                niveau. Choisis une autre destination en conservant ton niveau.
              </p>
            )}
            <div className="spot-details">
              {d.spots.map((spot, index) => (
                <article key={spot.spotId} className="spot-detail">
                  <div className="spot-heading">
                    <span className="editorial-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4>{spot.name}</h4>
                    <span className="level-tag">
                      {spot.minimumLevel
                        ? LEVEL_LABELS[spot.minimumLevel]
                        : "Niveau à vérifier"}
                    </span>
                  </div>
                  <dl className="spot-facts">
                    {spot.minimumLevel && (
                      <div>
                        <dt>Niveau minimum</dt>
                        <dd>{LEVEL_LABELS[spot.minimumLevel]}</dd>
                      </div>
                    )}
                    {spot.idealLevel && (
                      <div>
                        <dt>Niveau idéal</dt>
                        <dd>{LEVEL_LABELS[spot.idealLevel]}</dd>
                      </div>
                    )}
                    {spot.idealNeedsReview && (
                      <div>
                        <dt>Niveau idéal</dt>
                        <dd>À vérifier</dd>
                      </div>
                    )}
                    {spot.wave && (
                      <div>
                        <dt>Vague</dt>
                        <dd>{spot.wave}</dd>
                      </div>
                    )}
                    {spot.bottom && (
                      <div>
                        <dt>Fond</dt>
                        <dd>{spot.bottom}</dd>
                      </div>
                    )}
                    {spot.season && (
                      <div>
                        <dt>Saison</dt>
                        <dd>{spot.season}</dd>
                      </div>
                    )}
                  </dl>
                  {spot.notes && <p className="body-copy">{spot.notes}</p>}
                  {spot.caution && (
                    <p className="caution">
                      <Icon name="compass" size={20} />
                      <span>
                        <strong>Point de vigilance</strong>
                        {spot.caution}
                      </span>
                    </p>
                  )}
                </article>
              ))}
            </div>
            {!d.spots.length && !criteria && (
              <p>Les spots de cette zone ne sont pas encore renseignés.</p>
            )}
          </div>
          <aside className="destination-info">
            <p className="eyebrow">DANS TON CARNET</p>
            <dl>
              <div>
                <dt>Niveau</dt>
                <dd>{d.levelLabel}</dd>
              </div>
              {d.airportCode && (
                <div>
                  <dt>Aéroport d’arrivée</dt>
                  <dd>
                    {d.airportName} · {d.airportCode}
                  </dd>
                </div>
              )}
              {d.transfer && (
                <div>
                  <dt>Transfert</dt>
                  <dd>{d.transfer}</dd>
                </div>
              )}
              <div>
                <dt>{criteria ? "Spots compatibles" : "Spots documentés"}</dt>
                <dd>{d.compatibleSpots}</dd>
              </div>
              {criteria && (
                <div>
                  <dt>Pour tes dates</dt>
                  <dd>
                    {d.seasonStatus
                      ? SEASON_LABELS[d.seasonStatus]
                      : "Saison non renseignée"}
                  </dd>
                </div>
              )}
            </dl>
            <SeasonTimeline timeline={d.timeline} detailed />
            <p className="season-detail-note">
              Périodes idéales des spots
              {criteria ? " accessibles à ton niveau" : " de la zone"}. Les
              conditions varient selon la houle et la météo.
            </p>
            <a href="#reservation" className="button">
              Préparer mon vol
              <Icon name="arrow" size={18} />
            </a>
          </aside>
        </div>
        <section
          id="reservation"
          className="booking-section"
          aria-labelledby="booking-title"
        >
          <p className="eyebrow">DU DÉPART À LA VAGUE</p>
          <h2 id="booking-title">Ton vol vers {d.name}.</h2>
          <p className="body-copy">
            Choisis ton départ et tes dates pour préparer le voyage.
          </p>
          {validation && !validation.success && (
            <p className="form-error" role="alert">
              {validation.error}
            </p>
          )}
          <BookingForm
            key={JSON.stringify(criteria)}
            zoneId={d.zoneId}
            criteria={criteria}
          />
          {booking && (
            <>
              <TravelpayoutsWidget
                key={booking.key}
                widgetKey={booking.key}
                srcDoc={booking.srcDoc}
                fallbackUrl={booking.fallbackUrl}
              />
              <p className="booking-disclosure">
                Module partenaire Travelpayouts. La réservation s’effectue
                auprès du partenaire ; Surftrips peut percevoir une commission.
              </p>
            </>
          )}
          {!d.airportCode && (
            <p>L’aéroport d’arrivée reste à préciser pour cette destination.</p>
          )}
        </section>
        {!!related.length && (
          <section className="related-zones">
            <p className="eyebrow">LE MÊME VOL, D’AUTRES HORIZONS</p>
            <h2>
              Depuis {d.airportName || d.airportCode}, tu peux aussi rejoindre :
            </h2>
            <div>
              {related.map((other) => (
                <Link
                  key={other.zoneId}
                  href={destinationHref(other.zoneId, criteria)}
                  className="text-link"
                >
                  {other.name}
                  <Icon name="arrow" size={18} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
