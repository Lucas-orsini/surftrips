import type { Metadata } from "next";
import { AIRPORTS } from "@/lib/data";
import { SURF_LEVELS, type SearchCriteria, type SurfLevel } from "@/lib/types";
import { destinationRepository } from "@/lib/destinations";
import { isValidDate, searchDestinations } from "@/lib/search";
import { SearchBar } from "@/components/search/SearchBar";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Ton prochain surf trip",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string, fallback = "") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;
  const level = SURF_LEVELS.includes(get("level") as SurfLevel)
    ? (get("level") as SurfLevel)
    : "Intermédiaire";
  const airport =
    AIRPORTS.find((item) => item.code === get("airport")) || AIRPORTS[0];
  const criteria: SearchCriteria = {
    level,
    airport: airport.code,
    departure: get("departure"),
    returnDate: get("returnDate"),
    destination: get("destination", "Monde entier"),
  };
  const valid =
    isValidDate(criteria.departure) &&
    isValidDate(criteria.returnDate) &&
    criteria.returnDate > criteria.departure;
  const matches = valid
    ? searchDestinations(await destinationRepository.list(), criteria, airport)
    : [];
  return (
    <main id="main-content" className="container inner-page">
      <header className="page-heading">
        <p className="eyebrow">L’HORIZON SE PRÉCISE</p>
        <h1>
          On se retrouve
          <br />
          <span className="text-ocean">dans l’eau ?</span>
        </h1>
        <p>
          Ton niveau. Ta saison. Et les raisons de choisir ta prochaine
          destination.
        </p>
      </header>
      <SearchBar initialValues={criteria} />
      <div className="search-result-heading">
        <h2>
          {valid
            ? `${matches.length} ${matches.length === 1 ? "destination à explorer" : "destinations à explorer"}`
            : "Précise tes dates pour trouver ton spot"}
        </h2>
        <span>
          AU DÉPART DE {airport.city.toUpperCase()} · {airport.code}
        </span>
      </div>
      <p className="demo-notice">
        <Icon name="compass" size={20} />
        Aperçu sur trois destinations de démonstration. Les saisons et les spots
        sont illustratifs. Le départ sert à comparer les distances ; les vols et
        leur disponibilité ne sont pas vérifiés.
      </p>
      {matches.length > 0 ? (
        <div className="destinations-grid listing-grid">
          {matches.map((match, index) => (
            <DestinationCard
              key={match.destination.slug}
              destination={match.destination}
              index={index}
              season={match.season}
              reasons={match.reasons}
            />
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <Icon name="wave" size={42} />
          <h2>
            {valid
              ? "Un horizon un peu plus large ?"
              : "Tout commence par une date."}
          </h2>
          <p>
            {valid
              ? "Aucune destination de cette collection ne correspond à ces critères. Essaie « Monde entier » ou une autre région."
              : "Choisis ton départ et ton retour dans le moteur de recherche ci-dessus."}
          </p>
          <a href="#recherche" className="button">
            Ajuster ma recherche
            <Icon name="arrow" size={18} />
          </a>
        </div>
      )}
    </main>
  );
}
