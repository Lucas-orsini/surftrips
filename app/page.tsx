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
import { pageMetadata, serializeJsonLd, siteStructuredData } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata(
    "Surftrips.fr — Le bon spot. Au bon moment.",
    "Trouve ta prochaine destination de surf selon ton niveau, tes dates et ton aéroport de départ. Compare les saisons et les spots. Gratuit, sans inscription.",
    "/",
  ),
  title: { absolute: "Surftrips.fr — Le bon spot. Au bon moment." },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const destinations = await destinationRepository.list().catch(() => []);
  const countries = await getCountries().catch(() => []);
  const featured = [...destinations]
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
    .slice(0, 3);
  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(siteStructuredData()),
        }}
      />
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
