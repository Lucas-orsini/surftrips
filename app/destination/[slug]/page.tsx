import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getZone, getOtherZones, getCatalog } from "@/lib/db/zones";
import { withDestinationImage } from "@/lib/destinations";
import { prepareDestination } from "@/lib/surf/matching";
import { LEVEL_LABELS } from "@/lib/surf/levels";
import { SEASON_LABELS } from "@/lib/surf/season";
import {
  validateSearch,
  destinationHref,
  searchQuery,
  type SearchParams,
} from "@/lib/validation/search";
import { FlightSection } from "@/components/travel/FlightSection";
import { DestinationHero } from "@/components/destination/DestinationHero";
import { DestinationImage } from "@/components/destination/DestinationImage";
import { DestinationPhotoCredit } from "@/components/destination/DestinationPhotoCredit";
import {
  AccommodationSection,
  AccommodationSkeleton,
} from "@/components/accommodation/AccommodationSection";
import { SeasonTimeline } from "@/components/destination/SeasonTimeline";
import { Icon } from "@/components/ui/Icon";
import { EditorialParagraph } from "@/components/destination/EditorialParagraph";
import {
  getDestinationEditorial,
  editorialSpotNote,
  relatedCountryDestinations,
} from "@/lib/editorial/destinations";
import {
  destinationMetadata,
  destinationStructuredData,
  serializeJsonLd,
  destinationPath,
} from "@/lib/seo";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};
export const dynamic = "force-dynamic";
// Keep the zone lookup and essential HTML outside a route-wide loading boundary:
// otherwise a missing zone is streamed as HTTP 200 and the page needs JS to reveal it.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const zone = await getZone(slug);
  // notFound() in the page supplies Next's noindex; avoid a duplicate robots tag.
  if (!zone) return { title: "Destination introuvable" };
  return destinationMetadata(zone);
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
  const d = withDestinationImage(prepareDestination(zone, criteria));
  const editorial = getDestinationEditorial(zone);
  const related = zone.airportCode
    ? (await getOtherZones(zone.airportCode, zone.zoneId))
        .map((z) => withDestinationImage(prepareDestination(z, criteria)))
        .filter((z) => !criteria || z.compatibleSpots > 0)
    : [];
  const countryLinks = relatedCountryDestinations(
    zone,
    (await getCatalog()).zones,
    related.map((other) => other.zoneId),
  );
  const introduction =
    editorial?.introduction || (d.notes ? { text: d.notes } : null);
  return (
    <main id="main-content" className="destination-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(destinationStructuredData(zone)),
        }}
      />
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
        <DestinationHero destination={d} />
        {d.image && <DestinationPhotoCredit path={d.heroImagePath} />}
        <div id="surf" className="detail-grid">
          <div>
            <p className="eyebrow">01 — SURFER</p>
            {introduction && (
              <section
                className="destination-introduction"
                aria-labelledby="presentation-title"
              >
                <h2 id="presentation-title">Surfer à {d.name}</h2>
                <EditorialParagraph
                  block={introduction}
                  editorial={editorial}
                />
              </section>
            )}
            <h2 className={introduction ? "spots-section-title" : undefined}>
              {criteria
                ? "Les spots accessibles à ton niveau"
                : `Les spots de surf à ${d.name}`}
            </h2>
            {criteria && !d.compatibleSpots && (
              <p className="caution">
                Aucun spot documenté dans cette zone n’est accessible à ton
                niveau. Choisis une autre destination en conservant ton niveau.
              </p>
            )}
            <div className="spot-details">
              {d.spots.map((spot, index) => {
                const note = editorialSpotNote(spot, editorial);
                return (
                  <article
                    key={spot.spotId}
                    className="spot-detail"
                    data-spot-id={spot.spotId}
                  >
                    <div className="spot-heading">
                      <span className="editorial-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3>{spot.name}</h3>
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
                    {note && (
                      <EditorialParagraph block={note} editorial={editorial} />
                    )}
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
                );
              })}
            </div>
            {!d.spots.length && !criteria && (
              <p>Les spots de cette zone ne sont pas encore renseignés.</p>
            )}
            {!!editorial?.practical?.length && (
              <section
                className="destination-practical"
                aria-labelledby="practical-title"
              >
                <h2 id="practical-title">Repères pratiques à {d.name}</h2>
                {editorial.practical.map((block, index) => (
                  <EditorialParagraph
                    key={index}
                    block={block}
                    editorial={editorial}
                  />
                ))}
              </section>
            )}
          </div>
          <aside className="destination-info">
            <p className="eyebrow">DANS TON CARNET</p>
            {!!d.spots.length && (
              <section aria-labelledby="levels-title">
                <h2 id="levels-title">Quel niveau de surf ?</h2>
                <dl className="destination-levels">
                  {d.spots.map((spot) => (
                    <div key={spot.spotId}>
                      <dt>{spot.name}</dt>
                      <dd>
                        Niveau minimum :{" "}
                        {spot.minimumLevel
                          ? LEVEL_LABELS[spot.minimumLevel]
                          : "à vérifier"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {d.timeline.some((month) => month.status !== null) && (
              <section aria-labelledby="season-title">
                <h2 id="season-title">Quand surfer à {d.name} ?</h2>
                <SeasonTimeline timeline={d.timeline} detailed />
                <p className="season-detail-note">
                  Périodes idéales des spots
                  {criteria ? " accessibles à ton niveau" : " de la zone"},
                  détaillées dans chaque fiche spot. Ce calendrier saisonnier
                  n’est pas une prévision : les conditions varient selon la
                  houle et la météo.
                </p>
              </section>
            )}
            {(d.airportCode || d.transfer) && (
              <section aria-labelledby="access-title">
                <h2 id="access-title">Comment rejoindre {d.name} ?</h2>
                <dl>
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
                </dl>
              </section>
            )}
            <dl>
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
            <a href="#reservation" className="button">
              Préparer mon vol
              <Icon name="arrow" size={18} />
            </a>
            <a href="#hebergement" className="text-link accommodation-jump">
              Trouver mon logement
              <Icon name="arrow" size={18} />
            </a>
          </aside>
        </div>
        <FlightSection
          destination={d}
          criteria={criteria}
          error={
            validation && !validation.success ? validation.error : undefined
          }
        />
        <Suspense fallback={<AccommodationSkeleton />}>
          <AccommodationSection
            zoneId={d.zoneId}
            name={d.name}
            country={d.country}
            criteria={criteria}
          />
        </Suspense>
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
                  className="related-zone-link"
                >
                  <span className="related-zone-photo">
                    <DestinationImage
                      src={other.image}
                      name={other.name}
                      country={other.country}
                      sizes="88px"
                      compact
                    />
                  </span>
                  <span>
                    {other.name}
                    <small>{other.country}</small>
                  </span>
                  <Icon name="arrow" size={18} />
                </Link>
              ))}
            </div>
            {related
              .filter((other) => other.image)
              .map((other) => (
                <DestinationPhotoCredit
                  key={other.zoneId}
                  path={other.heroImagePath}
                />
              ))}
          </section>
        )}
        {!!countryLinks.length && (
          <section
            className="related-zones country-destinations"
            aria-labelledby="country-destinations-title"
          >
            <p className="eyebrow">POUR EXPLORER LE MÊME PAYS</p>
            <h2 id="country-destinations-title">
              Autres destinations surf — {d.country}
            </h2>
            <div>
              {countryLinks.map((other) => (
                <Link
                  key={other.zoneId}
                  href={destinationPath(other.zoneId)}
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
