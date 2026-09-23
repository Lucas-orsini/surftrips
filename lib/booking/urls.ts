/** Only these verified Booking hostnames are accepted, never substring matches. */
const BOOKING_HOSTS = new Set(["booking.com", "www.booking.com"]);

function httpsUrl(value: unknown): URL | undefined {
  if (
    typeof value !== "string" ||
    !/^https:\/\//i.test(value) ||
    /[\s\u0000-\u001f\u007f\\]/.test(value)
  )
    return;
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port
    )
      return url;
  } catch {
    /* Invalid configuration or editorial link: fail closed. */
  }
}

export function bookingDestinationUrl(value: unknown): string | undefined {
  const url = httpsUrl(value);
  // Preserve the supplied query (including any manually verified dates) exactly.
  if (url && BOOKING_HOSTS.has(url.hostname)) return value as string;
}

export function evergreenUrl(value: unknown): string | undefined {
  const url = httpsUrl(value);
  // The account administrator supplies the actual CJ domain; no sample domain.
  if (url && !url.hash) return value as string;
}

export function isZoneId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,160}$/.test(value);
}

export function isAccommodationId(value: string): boolean {
  // UUID convention of the existing, versioned accommodations schema.
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function bookingSid(
  zoneId: string,
  source: "hotel-card" | "all",
): string {
  if (!isZoneId(zoneId) || !["hotel-card", "all"].includes(source))
    throw new Error("BOOKING_INVALID_REFERENCE");
  return `surftrips-${zoneId}-${source}`;
}

export interface BookingLinkInput {
  destinationUrl: string;
  sid?: string;
}

/** Pure URL construction; the server wrapper is the only reader of the env value. */
export function createBookingAffiliateUrl(
  configuredEvergreen: unknown,
  { destinationUrl, sid }: BookingLinkInput,
): string | undefined {
  const base = evergreenUrl(configuredEvergreen);
  const destination = bookingDestinationUrl(destinationUrl);
  if (!base || !destination) return;
  if (sid && !/^surftrips-[a-zA-Z0-9_-]{1,160}-(?:hotel-card|all)$/.test(sid))
    return;
  const url = new URL(base);
  url.searchParams.set("url", destination);
  // Remove any previous SID from configuration, including duplicates.
  url.searchParams.delete("sid");
  if (sid) url.searchParams.set("sid", sid);
  return url.toString();
}
