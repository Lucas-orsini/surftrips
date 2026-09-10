import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destinationRepository } from "@/lib/destinations";
import { SeasonTimeline } from "@/components/destination/SeasonTimeline";
import { Icon } from "@/components/ui/Icon";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await destinationRepository.list()).map((d) => ({ slug: d.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await destinationRepository.findBySlug(slug);
  if (!destination) return {};
  return {
    title: `Surfer à ${destination.name}, ${destination.country}`,
    description:
      destination.tagline +
      " Découvre les niveaux, la saison et les spots pour préparer ton surf trip.",
    alternates: { canonical: `/destination/${slug}` },
    openGraph: {
      images: [{ url: destination.image, alt: destination.imageAlt }],
    },
  };
}
export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await destinationRepository.findBySlug(slug);
  if (!destination) notFound();
  return (
    <main id="main-content" className="destination-page">
      <div className="container">
        <Link className="back-link" href="/destinations">
          <Icon name="arrow" size={17} />
          Toutes les destinations
        </Link>
        <div className="detail-heading">
          <div>
            <p className="eyebrow">
              {destination.country.toUpperCase()} /{" "}
              {destination.region.toUpperCase()}
            </p>
            <h1>
              {destination.name}
              <span className="text-ocean">.</span>
            </h1>
            <p>{destination.tagline}</p>
          </div>
          <span className="detail-coordinates">{destination.coordinates}</span>
        </div>
        <div className="detail-photo">
          <Image
            src={destination.image}
            alt={destination.imageAlt}
            fill
            preload
            sizes="(max-width: 1400px) 95vw, 1280px"
            quality={85}
          />
        </div>
        <div className="detail-grid">
          <div>
            <p className="eyebrow">L’ESPRIT DU SPOT</p>
            <h2>Ton prochain terrain de jeu.</h2>
            <p className="body-copy">{destination.description}</p>
            <h3>Quelques spots pour se repérer</h3>
            <div className="spot-list">
              {destination.spots.map((spot, index) => (
                <div key={spot.name}>
                  <span className="editorial-number">0{index + 1}</span>
                  <span>
                    <strong>{spot.name}</strong>
                    <small>{spot.type}</small>
                  </span>
                  <span className="level-tag">{spot.level}</span>
                </div>
              ))}
            </div>
            <p className="caution">
              <Icon name="compass" size={22} />
              <span>
                <strong>À garder en tête</strong>
                {destination.caution}
              </span>
            </p>
          </div>
          <aside className="destination-info">
            <p className="eyebrow">DANS TON CARNET</p>
            <dl>
              <div>
                <dt>Niveau</dt>
                <dd>{destination.recommendedLevel}</dd>
              </div>
              <div>
                <dt>Vagues</dt>
                <dd>{destination.wave}</dd>
              </div>
              <div>
                <dt>Fond</dt>
                <dd>{destination.bottom}</dd>
              </div>
              <div>
                <dt>Aéroport</dt>
                <dd>
                  {destination.airport.city} · {destination.airport.code}
                </dd>
              </div>
              <div>
                <dt>Transfert indicatif</dt>
                <dd>Environ {destination.transferMinutes} min</dd>
              </div>
              <div>
                <dt>Spots dans la zone</dt>
                <dd>{destination.spotCount}</dd>
              </div>
            </dl>
            <SeasonTimeline
              bestMonths={destination.bestMonths}
              shoulderMonths={destination.shoulderMonths}
              detailed
            />
            <Link
              href={`/recherche?destination=${encodeURIComponent(destination.country)}#recherche`}
              className="button"
            >
              Préparer mon surf trip
              <Icon name="arrow" size={18} />
            </Link>
          </aside>
        </div>
        <p className="demo-notice">
          Fiche de démonstration. Les indications seront remplacées par la base
          vérifiée de Surftrips. La saison ne garantit pas les conditions d’une
          session ; renseigne-toi localement.
        </p>
      </div>
    </main>
  );
}
