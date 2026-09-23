import "server-only";
import { readQuery } from "./index.ts";
import type { BookingTarget } from "../booking/redirect.ts";
import { isAccommodationId, isZoneId } from "../booking/urls.ts";

/** Fresh lookups on every click. No client DB access or cached active status. */
export async function getBookingAccommodation(
  id: string,
): Promise<BookingTarget | undefined> {
  if (!isAccommodationId(id)) return;
  const [row] = await readQuery<{
    zone_id: string;
    active: boolean;
    booking_url: string | null;
  }>(
    `SELECT zone_id,active,to_jsonb(a)->>'booking_url' AS booking_url
     FROM public.accommodations a WHERE id=$1::uuid AND active=true LIMIT 1`,
    [id],
  );
  if (row)
    return {
      zoneId: row.zone_id,
      bookingUrl: row.booking_url,
      active: row.active,
    };
}

export async function getBookingDestination(
  zoneId: string,
): Promise<BookingTarget | undefined> {
  if (!isZoneId(zoneId)) return;
  const [row] = await readQuery<{
    zone_id: string;
    booking_destination_url: string | null;
  }>(
    `SELECT zone_id,to_jsonb(z)->>'booking_destination_url' AS booking_destination_url
     FROM public.zones z WHERE zone_id=$1 LIMIT 1`,
    [zoneId],
  );
  if (row)
    return { zoneId: row.zone_id, bookingUrl: row.booking_destination_url };
}
