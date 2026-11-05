import Link from "next/link";
import type { Zone } from "@/lib/types";
import type { ArticleHighlight } from "@/lib/editorial/theme-articles";
import { articlePhoto } from "@/lib/editorial/theme-photos";
import { destinationPath } from "@/lib/seo";
import { getDestinationImageUrl } from "@/lib/images/destination";
import { DestinationImage } from "@/components/destination/DestinationImage";
import { DestinationPhotoCredit } from "@/components/destination/DestinationPhotoCredit";
import { Icon } from "@/components/ui/Icon";

export function ArticlePhoto({
  zone,
  hero = false,
}: {
  zone: Zone;
  hero?: boolean;
}) {
  const photo = articlePhoto(zone.heroImagePath);
  const src = getDestinationImageUrl(
    zone.heroImagePath,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  // Unknown replacement assets are not given the description of an old photo.
  if (!photo || !src) return null;
  return (
    <figure className={`article-photo${hero ? " article-photo-hero" : ""}`}>
      <div className="article-photo-frame">
        <DestinationImage
          src={src}
          name={zone.name}
          country={zone.country}
          alt={photo.alt}
          hero={hero}
          sizes={
            hero
              ? "(max-width: 640px) calc(100vw - 40px), (max-width: 1200px) calc(100vw - 80px), 1120px"
              : "(max-width: 640px) calc(100vw - 40px), (max-width: 1040px) calc(100vw - 80px), 960px"
          }
        />
      </div>
      <figcaption>
        <span>{photo.caption}</span>
        <span className="article-photo-author">
          Photo : <a href={photo.source}>{photo.author} / Unsplash</a>
        </span>
      </figcaption>
      <DestinationPhotoCredit path={zone.heroImagePath} />
    </figure>
  );
}

export function ArticleDestination({
  highlight,
  photographedAbove = false,
}: {
  highlight: ArticleHighlight;
  photographedAbove?: boolean;
}) {
  const { zone, spot, heading, paragraphs, compact } = highlight;
  const Heading = compact ? "h3" : "h2";
  return (
    <section
      className={`article-destination${compact ? " article-destination-compact" : ""}`}
      data-theme-destination={zone.zoneId}
      data-featured-spot={spot.spotId}
      aria-labelledby={`article-${zone.zoneId}`}
    >
      {!compact && !photographedAbove && <ArticlePhoto zone={zone} />}
      <div className="article-prose">
        {!compact && <p className="article-country">{zone.country}</p>}
        <Heading id={`article-${zone.zoneId}`}>{heading}</Heading>
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <Link
          className="text-link article-destination-link"
          href={destinationPath(zone.zoneId)}
          prefetch={false}
        >
          Découvrir {zone.name}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </section>
  );
}
