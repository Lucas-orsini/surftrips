import "server-only";
import {
  buildWidgetUrl,
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
    fallbackUrl: flightFallbackUrl(flight),
    srcDoc:
      marker && shmarker
        ? widgetDocument(buildWidgetUrl(flight, { marker, shmarker }), key)
        : null,
  };
}
