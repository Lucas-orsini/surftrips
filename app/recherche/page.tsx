import type { Metadata } from "next";
import { searchDestinations } from "@/lib/db/search";
import type { SearchParams } from "@/lib/validation/search";
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
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const result = await searchDestinations(params).catch(() => null);
  const criteria = result?.success ? result.criteria : undefined;
  const destinations = result?.success ? result.destinations : [];
  const error = !result
    ? "Les destinations sont momentanément indisponibles. Réessaie dans quelques instants."
    : !result.success && Object.keys(params).length
      ? result.error
      : null;
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
      <SearchBar
        key={JSON.stringify(criteria)}
        initialValues={criteria}
        countries={result?.countries || []}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="search-result-heading">
        <h2>
          {criteria
            ? `${destinations.length} destination${destinations.length === 1 ? "" : "s"} à explorer`
            : "Précise tes dates pour trouver ton spot"}
        </h2>
        {criteria && <span>AU DÉPART DE {criteria.origine}</span>}
      </div>
      {destinations.length ? (
        <>
          <p className="search-season-note">
            La saison indique les périodes favorables, sans garantir les
            conditions de chaque session. Le statut retient la meilleure période
            parmi les mois de ton séjour.
          </p>
          <div className="destinations-grid listing-grid">
            {destinations.map((destination, index) => (
              <DestinationCard
                key={destination.zoneId}
                destination={destination}
                index={index}
                criteria={criteria}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-results">
          <Icon name="wave" size={42} />
          <h2>
            {criteria
              ? "Un horizon un peu plus large ?"
              : "Tout commence par une date."}
          </h2>
          <p>
            {criteria
              ? "Aucune zone de ce pays ne possède actuellement de spot documenté accessible à ton niveau. Essaie Monde entier en conservant ton niveau."
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
