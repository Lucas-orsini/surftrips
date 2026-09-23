import { buildBookingAffiliateUrl } from "@/lib/booking/buildBookingAffiliateUrl";
import { bookingRedirect } from "@/lib/booking/redirect";
import { getBookingDestination } from "@/lib/db/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ zoneId: string }> },
) {
  const { zoneId } = await params;
  return bookingRedirect({
    kind: "destination",
    id: zoneId,
    lookup: getBookingDestination,
    buildUrl: buildBookingAffiliateUrl,
  });
}
