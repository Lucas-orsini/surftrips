import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { createRateLimiter } from "./lib/security/rate-limit";
const consume = createRateLimiter();
export function proxy(request: NextRequest) {
  // The ingress MUST overwrite x-real-ip, or Vercel's platform-owned forwarded header.
  // Never trust the user-controlled first item of x-forwarded-for.
  const candidate = (
    process.env.VERCEL
      ? request.headers.get("x-vercel-forwarded-for")
      : request.headers.get("x-real-ip")
  )?.trim();
  const ip = candidate && isIP(candidate) ? candidate : "unknown-shared";
  const key = createHash("sha256").update(ip).digest("hex");
  const decision = consume(key);
  if (decision.allowed) return NextResponse.next();
  return new NextResponse(
    '<!doctype html><html lang="fr"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Un instant | Surftrips.fr</title><body style="font-family:system-ui;padding:8vw;color:#173d4a;background:#fcfeff"><main><h1>Une petite pause.</h1><p>Tu as lancé beaucoup de recherches. Réessaie dans une minute.</p><a href="/">Revenir à la recherche</a></main></body></html>',
    {
      status: 429,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": String(decision.retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}
export const config = { matcher: ["/recherche/:path*", "/search/:path*"] };
