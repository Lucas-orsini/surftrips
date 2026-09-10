import { DEMO_DESTINATIONS } from "./data";
import type { Destination } from "./types";

export interface DestinationRepository {
  list(): Promise<Destination[]>;
  findBySlug(slug: string): Promise<Destination | undefined>;
}

export const destinationRepository: DestinationRepository = {
  async list() {
    return DEMO_DESTINATIONS;
  },
  async findBySlug(slug) {
    return DEMO_DESTINATIONS.find((destination) => destination.slug === slug);
  },
};
