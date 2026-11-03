import type { NextConfig } from "next";
import { destinationImageRemotePatterns } from "./lib/images/destination.ts";
import { nonProduction } from "./lib/seo.ts";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  devIndicators: false,
  // Metadata reads the same zone as the page. Resolve it before streaming:
  // real 404s and complete head tags, including for readers without JavaScript.
  htmlLimitedBots: /.*/,
  async headers() {
    return nonProduction()
      ? [
          {
            source: "/:path*",
            headers: [{ key: "X-Robots-Tag", value: "noindex" }],
          },
        ]
      : [];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: destinationImageRemotePatterns(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
  },
};

export default nextConfig;
