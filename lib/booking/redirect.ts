import {
  bookingDestinationUrl,
  bookingSid,
  isAccommodationId,
  isZoneId,
  type BookingLinkInput,
} from "./urls.ts";

export interface BookingTarget {
  zoneId: string;
  bookingUrl: string | null;
  active?: boolean;
}

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function unavailable(status: number): Response {
  return new Response(
    '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Réservation indisponible | surftrips.fr</title></head><body><main><h1>Ce lien de réservation est indisponible.</h1><p>Reviens sur Surftrips pour consulter les autres adresses.</p><a href="/">Revenir sur Surftrips</a></main></body></html>',
    {
      status,
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

/** Dependencies are supplied by server-only route handlers, never by the request. */
export async function bookingRedirect({
  kind,
  id,
  lookup,
  buildUrl,
}: {
  kind: "accommodation" | "destination";
  id: string;
  lookup: (id: string) => Promise<BookingTarget | undefined>;
  buildUrl: (input: BookingLinkInput) => string | undefined;
}): Promise<Response> {
  if (!(kind === "accommodation" ? isAccommodationId(id) : isZoneId(id)))
    return unavailable(400);
  try {
    const target = await lookup(id);
    if (!target || (kind === "accommodation" && target.active !== true))
      return unavailable(404);
    const destinationUrl = bookingDestinationUrl(target.bookingUrl);
    if (!destinationUrl || !isZoneId(target.zoneId)) return unavailable(404);
    const location = buildUrl({
      destinationUrl,
      sid: bookingSid(
        target.zoneId,
        kind === "accommodation" ? "hotel-card" : "all",
      ),
    });
    if (!location) return unavailable(503);
    // Temporary and uncached: deactivation and affiliate changes apply on the next click.
    return new Response(null, {
      status: 302,
      headers: { ...headers, Location: location },
    });
  } catch {
    // No SQL, configuration value, provider response or stack is returned or logged.
    return unavailable(503);
  }
}
