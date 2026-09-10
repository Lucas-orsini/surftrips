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
        {destinations.length === 0 && (
          <p className="body-copy">
            Les destinations sont momentanément indisponibles. Réessaie dans
            quelques instants.
          </p>
        )}
        <div className="destinations-grid">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.zoneId}
              destination={destination}
              index={index}
            />
          ))}
        </div>
        <div className="destination-footnote">
          <span>
            <span className="small-dot" />
            LES SAISONS, SPOT PAR SPOT
          </span>
          <p>Choisis tes dates et ton niveau pour affiner ces horizons.</p>
        </div>
      </Reveal>
    </section>
  );
}
