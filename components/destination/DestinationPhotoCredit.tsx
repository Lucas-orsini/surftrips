import { destinationPhotoCredit } from "@/lib/images/credits";

export function DestinationPhotoCredit({ path }: { path?: string | null }) {
  const credit = destinationPhotoCredit(path);
  if (!credit) return null;
  return (
    <p className="destination-photo-credit" data-photo-credit={path}>
      Photo : <a href={credit.photographerUrl}>{credit.photographer}</a>
      {" · "}
      <a href={credit.sourceUrl}>{credit.title}</a>
      {" · "}
      <a href={credit.licenseUrl}>{credit.license}</a>
      {" · Recadrée et convertie en WebP. "}
      {credit.license.includes("BY-SA") && "Adaptation sous la même licence."}
    </p>
  );
}
