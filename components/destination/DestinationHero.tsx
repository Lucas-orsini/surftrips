import type { Destination } from "@/lib/types";
import type { CSSProperties } from "react";
import { SEASON_LABELS } from "@/lib/surf/season";
import { destinationBannerPosition } from "@/lib/images/banner";
import { DestinationImage } from "./DestinationImage";

export function DestinationHero({
  destination: d,
  imagePosition = destinationBannerPosition(d.heroImagePath),
}: {
  destination: Destination;
  imagePosition?: CSSProperties["objectPosition"];
}) {
  return (
    <>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">{d.country}</p>
          <h1>
            {d.name}
            <span className="text-ocean">.</span>
          </h1>
          <ul
            className="destination-overview"
            aria-label="L’essentiel pour surfer"
          >
            {d.seasonStatus && (
              <li className="destination-season-summary">
                {SEASON_LABELS[d.seasonStatus]}
              </li>
            )}
            <li>{d.levelLabel}</li>
            <li>
              {d.compatibleSpots} spot{d.compatibleSpots > 1 ? "s" : ""}
            </li>
          </ul>
        </div>
        <span className="detail-coordinates">{d.coordinates}</span>
      </div>
      <div className="detail-photo">
        <DestinationImage
          src={d.image}
          name={d.name}
          country={d.country}
          hero
          objectPosition={imagePosition}
          sizes="(max-width: 370px) calc(100vw - 32px), (max-width: 760px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 72px), (max-width: 1392px) calc(100vw - 112px), 1280px"
        />
      </div>
      <nav className="destination-jumps" aria-label="Dans cette destination">
        <a href="#surf">Surf</a>
        <a href="#reservation">Vol</a>
        <a href="#hebergement">Logement</a>
      </nav>
    </>
  );
}
