import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { SwellLine } from "@/components/landing/SwellLine";
import { EditorialSection } from "@/components/landing/EditorialSection";
import { DestinationsSection } from "@/components/landing/DestinationsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WorldMapPreview } from "@/components/landing/WorldMapPreview";
import { DataSection } from "@/components/landing/DataSection";
import { InspirationSection } from "@/components/landing/InspirationSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { mapPoints } from "@/lib/surf/matching";
import { getCountries } from "@/lib/db/zones";
import { destinationRepository } from "@/lib/destinations";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-dynamic";

export default async function Home() {
  const destinations = await destinationRepository.list().catch(() => []);
  const countries = await getCountries().catch(() => []);
  const featured = [...destinations]
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
    .slice(0, 3);
  return (
    <main id="main-content">
      <Hero
        countries={countries}
        postcard={
          destinations.find((d) => d.zoneId === "ericeira") || featured[0]
        }
      />
      <SwellLine />
      <EditorialSection />
      <DestinationsSection destinations={featured} />
      <HowItWorks />
      <WorldMapPreview points={mapPoints(featured)} />
      <DataSection />
      <InspirationSection />
      <FinalCTA />
    </main>
  );
}
