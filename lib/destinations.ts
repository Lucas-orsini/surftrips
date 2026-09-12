import "server-only";
import { getCatalog, getZone } from "./db/zones";
import { prepareDestination } from "./surf/matching";
import type { Destination } from "./types";
import {
  getDestinationImageUrl,
  destinationImageAlt,
} from "./images/destination";

export function withDestinationImage<T extends Destination>(destination: T): T {
  return {
    ...destination,
    image:
      getDestinationImageUrl(
        destination.heroImagePath,
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      ) || undefined,
    imageAlt: destinationImageAlt(destination.name, destination.country),
  };
}
export const destinationRepository = {
  async list() {
    return (await getCatalog()).zones.map((z) =>
      withDestinationImage(prepareDestination(z)),
    );
  },
  async findBySlug(zoneId: string) {
    const zone = await getZone(zoneId);
    return zone ? withDestinationImage(prepareDestination(zone)) : undefined;
  },
};
