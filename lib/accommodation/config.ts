import "server-only";
import { suppliedHttpsUrl } from "./validation";

export function hotelsFallbackUrl(): string | undefined {
  // Paste the complete, manually generated Creator Toolbox affiliate URL.
  return suppliedHttpsUrl(process.env.HOTELS_COM_FALLBACK_URL);
}
