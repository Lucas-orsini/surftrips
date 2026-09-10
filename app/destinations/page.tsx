import type { Metadata } from "next";
import { destinationRepository } from "@/lib/destinations";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { SearchBar } from "@/components/search/SearchBar";

export const metadata: Metadata = {
  title: "Destinations de surf",
  description:
    "Explore Ericeira, Taghazout et Canggu. Compare les niveaux, les saisons et les transferts pour préparer ton prochain surf trip.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const destinations = await destinationRepository.list();
  return (
    <main id="main-content" className="container inner-page">
      <header className="page-heading">
        <p className="eyebrow">À CHAQUE ENVIE, UN HORIZON</p>
        <h1>
          Le monde est
          <br />
          <span className="text-ocean">ton prochain spot.</span>
        </h1>
        <p>
          Trois destinations pour commencer à rêver. Tes dates et ton niveau
          pour choisir.
        </p>
      </header>
      <SearchBar />
      <div className="listing-context">
        <span>03 DESTINATIONS À EXPLORER</span>
        <p>Collection de démonstration · saison illustrée : septembre</p>
      </div>
      <div className="destinations-grid listing-grid">
        {destinations.map((destination, index) => (
          <DestinationCard
            key={destination.slug}
            destination={destination}
            index={index}
          />
        ))}
      </div>
    </main>
  );
}
