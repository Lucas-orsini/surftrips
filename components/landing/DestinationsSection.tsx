import Link from "next/link";
import type { Destination } from "@/lib/types";
import { DestinationCard } from "@/components/destination/DestinationCard";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function DestinationsSection({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <section
      className="section container destinations-section"
      id="destinations"
      aria-labelledby="destinations-title"
    >
      <Reveal>
        <div className="section-heading">
          <div>
            <p className="eyebrow">L’APPEL DU LARGE</p>
            <h2 id="destinations-title">
              Quelques idées pour
              <br />
              ton prochain <span className="text-ocean">swell.</span>
            </h2>
          </div>
          <Link className="text-link" href="/destinations">
            Toutes les destinations
            <Icon name="arrow" size={19} />
          </Link>
        </div>
        <div className="destinations-grid">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              index={index}
            />
          ))}
        </div>
        <div className="destination-footnote">
          <span>
            <span className="small-dot" />
            EXEMPLE DE SAISON : SEPTEMBRE
          </span>
          <p>Sélection illustrative. Chaque spot a ses particularités.</p>
        </div>
      </Reveal>
    </section>
  );
}
