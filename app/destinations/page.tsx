import type { Metadata } from "next";
import { destinationRepository } from "@/lib/destinations";
import { getCountries } from "@/lib/db/zones";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { SearchBar } from "@/components/search/SearchBar";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Destinations de surf",
  description:
    "Explore les destinations de surf, leurs spots, leurs saisons et leurs aéroports pour préparer ton prochain voyage.",
  alternates: { canonical: "/destinations" },
};
export default async function DestinationsPage() {
  const [destinations, countries] = await Promise.all([
    destinationRepository.list(),
    getCountries(),
  ]);
  return (
    <main id="main-content" className="container inner-page">
      <header className="page-heading">
        <p className="eyebrow">À CHAQUE ENVIE, UN HORIZON</p>
        <h1>
          Le monde est
          <br />
          <span className="text-ocean">ton prochain spot.</span>
        </h1>
        <p>Tes dates et ton niveau pour choisir.</p>
      </header>
      <SearchBar countries={countries} />
      <div className="listing-context">
        <span>{destinations.length} DESTINATIONS À EXPLORER</span>
        <p>Des spots documentés, des saisons à découvrir</p>
      </div>
      <div className="destinations-grid listing-grid">
        {destinations.map((destination, index) => (
          <DestinationCard
            key={destination.zoneId}
            destination={destination}
            index={index}
          />
        ))}
      </div>
      {!destinations.length && (
        <p className="empty-results">
          Les destinations seront disponibles prochainement.
        </p>
      )}
    </main>
  );
}
