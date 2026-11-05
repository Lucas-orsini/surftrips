import "server-only";
import { cache } from "react";
import { getCatalog } from "../db/zones";
import {
  THEMES,
  isThemeAvailable,
  themeDestinations,
  type ThemeId,
} from "./themes";

// One shared catalog read for page, metadata, selections and links; no per-zone SQL.
export const getThemePage = cache(async (id: ThemeId) => {
  const theme = THEMES.find((entry) => entry.id === id);
  if (!theme) return undefined;
  const { zones } = await getCatalog();
  if (!zones.length) throw new Error("SEO_CATALOG_EMPTY");
  if (!isThemeAvailable(theme, zones)) return undefined;
  return {
    theme,
    catalog: zones,
    destinations: themeDestinations(theme, zones),
  };
});
