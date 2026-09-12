import path from "node:path";
import { destinationImageRemotePatterns } from "../../../lib/images/destination.ts";

const config = {
  turbopack: { root: path.resolve(import.meta.dirname, "../../..") },
  devIndicators: false,
  images: {
    qualities: [75, 85],
    remotePatterns: destinationImageRemotePatterns(
      "https://storage.example.test",
    ),
  },
};
export default config;
