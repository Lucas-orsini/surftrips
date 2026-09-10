import "server-only";
import { getCatalog, getZone } from "./db/zones";
import { prepareDestination } from "./surf/matching";
import type { Destination } from "./types";
// Existing local photographs, associated only with their documented place.
const PHOTOS: Record<string, { image: string; imageAlt: string }> = {
  ericeira: {
    image: "/images/ericeira.jpg",
    imageAlt: "La côte d’Ericeira au Portugal",
  },
  taghazout: {
    image: "/images/taghazout.jpg",
    imageAlt: "Taghazout face à l’Atlantique au Maroc",
  },
};
export function withPhoto<T extends Destination>(destination: T): T {
  return { ...destination, ...PHOTOS[destination.zoneId] };
}
export const destinationRepository = {
  async list() {
    return (await getCatalog()).zones.map((z) =>
      withPhoto(prepareDestination(z)),
    );
  },
  async findBySlug(zoneId: string) {
    const zone = await getZone(zoneId);
    return zone ? withPhoto(prepareDestination(zone)) : undefined;
  },
};
