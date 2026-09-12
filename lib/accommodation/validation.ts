import {
  ACCOMMODATION_TYPES,
  PRICE_CATEGORIES,
  type Accommodation,
} from "./types.ts";

/** Validate supplied links; never generate or modify Expedia tracking. */
export function suppliedHttpsUrl(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    !/^https:\/\//i.test(value) ||
    value !== value.trim() ||
    /[\s\u0000-\u001f]/.test(value)
  )
    return;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return value;
  } catch {
    /* An invalid editorial URL is not shown to visitors. */
  }
}

export interface AccommodationRow {
  id: string;
  zone_id: string;
  name: string;
  slug: string;
  type: string;
  location_label: string | null;
  description: string | null;
  image_url: string | null;
  distance_label: string | null;
  price_category: string | null;
  affiliate_url: string;
  featured: boolean;
  display_order: number;
}

export function adaptAccommodation(
  row: AccommodationRow,
): Accommodation | null {
  const affiliateUrl = suppliedHttpsUrl(row.affiliate_url);
  if (
    !affiliateUrl ||
    !row.name?.trim() ||
    !Object.hasOwn(ACCOMMODATION_TYPES, row.type)
  )
    return null;
  return {
    id: row.id,
    zoneId: row.zone_id,
    name: row.name,
    slug: row.slug,
    type: row.type as Accommodation["type"],
    locationLabel: row.location_label || undefined,
    description: row.description || undefined,
    imageUrl: suppliedHttpsUrl(row.image_url),
    distanceLabel: row.distance_label || undefined,
    priceCategory:
      row.price_category && Object.hasOwn(PRICE_CATEGORIES, row.price_category)
        ? (row.price_category as Accommodation["priceCategory"])
        : undefined,
    affiliateUrl,
    featured: row.featured,
    displayOrder: row.display_order,
  };
}
