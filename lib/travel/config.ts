import "server-only";
import {
  buildWidgetUrl,
  buildKiwiSearchUrl,
  flightFallbackUrl,
  widgetDocument,
  widgetKey,
  type FlightParameters,
} from "./parameters";
export function bookingConfig(flight: FlightParameters) {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  const shmarker = process.env.TRAVELPAYOUTS_SHMARKER;
  const key = widgetKey(flight);
  return {
    key,
    searchUrl: buildKiwiSearchUrl(flight, shmarker),
    fallbackUrl: flightFallbackUrl(flight),
    srcDoc:
      marker && shmarker
        ? widgetDocument(buildWidgetUrl(flight, { marker, shmarker }), key)
        : null,
  };
}
