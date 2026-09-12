export const HOTELS_WIDGET_SCRIPT =
  "https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js";
export const HOTELS_WIDGET_ATTRIBUTES = {
  "data-widget": "search",
  "data-program": "fr-hcom",
  "data-lobs": "stays",
  "data-network": "pz",
  "data-camref": "1011l5QTXG",
} as const;

// Match the existing zone identifier convention. No trip dates, IP or user ID.
export function hotelsPubref(zoneId: string): string {
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(zoneId)) throw new Error("INVALID_ZONE");
  return `surftrips-${zoneId}`;
}

export function isHotelsPubref(value: string | null): value is string {
  return !!value && /^surftrips-[a-zA-Z0-9_-]{1,160}$/.test(value);
}
