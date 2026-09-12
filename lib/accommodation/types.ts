export const ACCOMMODATION_TYPES = {
  hotel: "Hôtel",
  hostel: "Auberge",
  surf_house: "Surf house",
  apartment: "Appartement",
  guesthouse: "Maison d’hôtes",
  surf_camp: "Surf camp",
} as const;

export const PRICE_CATEGORIES = {
  budget: { label: "€", description: "Gamme économique" },
  mid: { label: "€€", description: "Gamme intermédiaire" },
  premium: { label: "€€€", description: "Gamme supérieure" },
} as const;

export interface Accommodation {
  id: string;
  zoneId: string;
  name: string;
  slug: string;
  type: keyof typeof ACCOMMODATION_TYPES;
  locationLabel?: string;
  description?: string;
  imageUrl?: string;
  distanceLabel?: string;
  priceCategory?: keyof typeof PRICE_CATEGORIES;
  affiliateUrl: string;
  featured: boolean;
  displayOrder: number;
}

export interface AccommodationResult {
  items: Accommodation[];
  status: "ready" | "not_configured" | "unavailable";
}
