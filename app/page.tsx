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
import { destinationRepository } from "@/lib/destinations";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const destinations = await destinationRepository.list();
  return (
    <main id="main-content">
      <Hero />
      <SwellLine />
      <EditorialSection />
      <DestinationsSection destinations={destinations} />
      <HowItWorks />
      <WorldMapPreview />
      <DataSection />
      <InspirationSection />
      <FinalCTA />
    </main>
  );
}
