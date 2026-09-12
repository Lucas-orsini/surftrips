import Link from "next/link";
import { DestinationHero } from "../../../../components/destination/DestinationHero";
import { DestinationCard } from "../../../../components/destination/DestinationCard";
import { getDestinationImageUrl } from "../../../../lib/images/destination";
import { prepareDestination } from "../../../../lib/surf/matching";
import type { Zone } from "../../../../lib/types";

// Separate Next.js test app: no database access, uploads or production routes.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ image?: string }>;
}) {
  const { image } = await searchParams;
  const zone: Zone = {
    zoneId: image === "none" ? "taghazout" : "ericeira",
    name: image === "none" ? "Taghazout" : "Ericeira",
    country: image === "none" ? "Maroc" : "Portugal",
    heroImagePath:
      image === "none"
        ? null
        : `ericeira/${image === "broken" ? "missing" : "hero"}.webp`,
    airportCode: null,
    airportAlternative: null,
    airportName: null,
    transfer: null,
    latitude: null,
    longitude: null,
    notes: null,
    spots: [],
  };
  const destination = {
    ...prepareDestination(zone),
    image:
      getDestinationImageUrl(
        zone.heroImagePath,
        "https://storage.example.test",
      ) || undefined,
  };
  return (
    <main className="container">
      <nav aria-label="Scénarios isolés">
        <Link href="/?image=present">Avec image</Link>
        {" · "}
        <Link href="/?image=none">Sans image</Link>
        {" · "}
        <Link href="/?image=broken">Image introuvable</Link>
      </nav>
      <DestinationHero destination={destination} />
      <div className="destinations-grid listing-grid">
        <DestinationCard destination={destination} />
      </div>
    </main>
  );
}
