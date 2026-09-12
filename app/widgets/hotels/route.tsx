import { renderToReadableStream } from "react-dom/server.edge";
import {
  HOTELS_WIDGET_ATTRIBUTES,
  HOTELS_WIDGET_SCRIPT,
  isHotelsPubref,
} from "@/lib/accommodation/widget";

export const runtime = "nodejs";

/** A fresh document preserves Expedia's DOMContentLoaded lifecycle on SPA navigation.
 * No Expedia globals, private API, content scraping or manual reinitialization.
 * Native deferred scripts are intentional here: next/script runs after that event.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const pubref = params.get("pubref");
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Robots-Tag": "noindex, nofollow",
    "Content-Security-Policy": "frame-ancestors 'self'",
    "Cache-Control": "public, max-age=3600",
  };
  if (!isHotelsPubref(pubref) || params.getAll("pubref").length !== 1)
    return new Response("Module indisponible.", { status: 400, headers });

  return new Response(
    await renderToReadableStream(
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="robots" content="noindex,nofollow" />
          <meta name="surftrips-hotels-pubref" content={pubref} />
          <title>Rechercher un hébergement sur Hotels.com</title>
          <style>{`html,body{margin:0;padding:0;width:100%;background:transparent}*{box-sizing:border-box}#hotels-widget-root{width:100%;max-width:575px;margin:0 auto}`}</style>
        </head>
        <body>
          <div id="hotels-widget-root">
            <div
              className="eg-widget"
              {...HOTELS_WIDGET_ATTRIBUTES}
              data-pubref={pubref}
            />
          </div>
          <script defer src="/hotels-widget-bridge.js" />
          <script
            defer
            className="eg-widgets-script"
            src={HOTELS_WIDGET_SCRIPT}
          />
        </body>
      </html>,
    ),
    { headers },
  );
}
