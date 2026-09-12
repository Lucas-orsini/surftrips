import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import batch from "../../../../../docs/destination-image-batch.json";
import { Hero } from "../../../../../components/landing/Hero";
import { DestinationsSection } from "../../../../../components/landing/DestinationsSection";
import { DestinationHero } from "../../../../../components/destination/DestinationHero";
import { DestinationCard } from "../../../../../components/destination/DestinationCard";
import { getDestinationImageUrl } from "../../../../../lib/images/destination";
import { prepareDestination } from "../../../../../lib/surf/matching";
import type { Zone } from "../../../../../lib/types";

// Isolated review app only. The local catalog is a read-only snapshot of Supabase.
// Proposed image associations live here until publication, never in production data.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string; view?: string }>;
}) {
  const { zone: selectedId, view } = await searchParams;
  let zones: Zone[];
  try {
    ({ zones } = JSON.parse(
      await readFile(
        path.resolve(process.cwd(), ".local/destination-images/catalog.json"),
        "utf8",
      ),
    ));
  } catch {
    return <p>Le catalogue local de prévisualisation n’est pas installé.</p>;
  }
  const destinations = batch.images.map((entry) => {
    const zone = zones.find((candidate) => candidate.zoneId === entry.zone_id);
    if (!zone) throw new Error("Catalogue local incomplet.");
    return {
      ...prepareDestination(zone),
      image:
        getDestinationImageUrl(
          entry.storage_path,
          "https://storage.example.test",
        ) || undefined,
    };
  });
  const selected =
    destinations.find((d) => d.zoneId === selectedId) || destinations[0];
  return (
    <>
      <nav className="container" aria-label="Revue du lot de photos">
        <p>Prévisualisation locale — photos préparées, publication séparée.</p>
        <Link href="/batch?view=landing">Landing</Link>
        {" · "}
        <Link href="/batch?view=search">Cartes résultats</Link>
        {" · "}
        <Link href="/?image=none">Fallback sans image</Link>
        <p>
          {destinations.map((d) => (
            <span key={d.zoneId}>
              <Link href={`/batch?zone=${d.zoneId}`}>{d.name}</Link>
              {" · "}
            </span>
          ))}
        </p>
      </nav>
      {view === "landing" ? (
        <main>
          <Hero
            countries={[...new Set(destinations.map((d) => d.country))]}
            postcard={destinations[0]}
          />
          <DestinationsSection destinations={destinations.slice(0, 3)} />
        </main>
      ) : view === "search" ? (
        <main className="container">
          <h1>Revue des dix photographies</h1>
          <div className="destinations-grid listing-grid">
            {destinations.map((d, i) => (
              <DestinationCard key={d.zoneId} destination={d} index={i} />
            ))}
          </div>
        </main>
      ) : (
        <main className="container">
          <DestinationHero destination={selected} />
          <div className="destinations-grid listing-grid">
            <DestinationCard destination={selected} />
          </div>
        </main>
      )}
    </>
  );
}
