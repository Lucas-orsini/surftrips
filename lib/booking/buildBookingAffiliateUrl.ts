import "server-only";
import {
  createBookingAffiliateUrl,
  evergreenUrl,
  type BookingLinkInput,
} from "./urls.ts";

export function isBookingConfigured(): boolean {
  return Boolean(evergreenUrl(process.env.BOOKING_CJ_EVERGREEN_URL));
}

export function buildBookingAffiliateUrl(
  input: BookingLinkInput,
): string | undefined {
  return createBookingAffiliateUrl(process.env.BOOKING_CJ_EVERGREEN_URL, input);
}
