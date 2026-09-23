import { buildBookingAffiliateUrl } from "@/lib/booking/buildBookingAffiliateUrl";
import { bookingRedirect } from "@/lib/booking/redirect";
import { getBookingAccommodation } from "@/lib/db/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return bookingRedirect({
    kind: "accommodation",
    id,
    lookup: getBookingAccommodation,
    buildUrl: buildBookingAffiliateUrl,
  });
}
