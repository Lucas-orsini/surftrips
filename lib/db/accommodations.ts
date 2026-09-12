import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { readQuery } from "./index.ts";
import {
  adaptAccommodation,
  type AccommodationRow,
} from "../accommodation/validation.ts";
import type { AccommodationResult } from "../accommodation/types.ts";

const expectedColumns = [
  "id",
  "zone_id",
  "name",
  "slug",
  "type",
  "location_label",
  "description",
  "image_url",
  "distance_label",
  "price_category",
  "affiliate_url",
  "featured",
  "display_order",
  "active",
];

const accommodationSchema = unstable_cache(
  async () => {
    const columns = await readQuery<{ column_name: string }>(
      "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='accommodations'",
    );
    if (!columns.length) {
      console.warn(
        "[accommodations] Table non disponible. Migration 20260912_accommodations.sql à appliquer par l’administrateur.",
      );
      return "not_configured" as const;
    }
    const missing = expectedColumns.filter(
      (name) => !columns.some((c) => c.column_name === name),
    );
    if (missing.length) {
      console.error(
        "[accommodations] Colonnes manquantes :",
        missing.join(", "),
      );
      return "unavailable" as const;
    }
    return "ready" as const;
  },
  ["accommodation-schema-v1"],
  { revalidate: 60 },
);

export const getRecommendedAccommodations = cache(
  unstable_cache(
    async (zoneId: string, limit = 3): Promise<AccommodationResult> => {
      if (!/^[a-zA-Z0-9_-]{1,160}$/.test(zoneId))
        return { items: [], status: "unavailable" };
      const count = Number.isInteger(limit)
        ? Math.max(1, Math.min(3, limit))
        : 3;
      try {
        const status = await accommodationSchema();
        if (status !== "ready") return { items: [], status };
        const rows = await readQuery<AccommodationRow>(
          `SELECT id,zone_id,name,slug,type,location_label,description,image_url,
         distance_label,price_category,affiliate_url,featured,display_order
         FROM public.accommodations WHERE zone_id=$1 AND active=true
         ORDER BY featured DESC,display_order ASC,id ASC LIMIT $2`,
          [zoneId, count],
        );
        const items = rows.flatMap((row) => {
          const item = adaptAccommodation(row);
          if (!item)
            console.warn(
              "[accommodations] Recommandation à vérifier :",
              row.id,
            );
          return item ? [item] : [];
        });
        return { items, status: "ready" };
      } catch {
        console.error(
          "[accommodations] Lecture des recommandations indisponible.",
        );
        return { items: [], status: "unavailable" };
      }
    },
    ["recommended-accommodations-v1"],
    { revalidate: 60 },
  ),
);
