import type { Zone } from "../types.ts";
import {
  countryZones,
  monthlyZones,
  publicThemeZones,
} from "../surf/thematic.ts";
import { isMonth } from "../surf/season.ts";

type ThemeBase = {
  path: string;
  title: string;
  description: string;
  heading: string;
  introduction: string;
  cta: string;
  linkLabel: string;
};
export type MonthTheme = ThemeBase & {
  kind: "month";
  id: "novembre" | "decembre";
  month: 11 | 12;
  monthName: "novembre" | "décembre";
};
export type CountryTheme = ThemeBase & {
  kind: "country";
  id: "portugal";
  country: "Portugal";
};
export type ComparisonTheme = ThemeBase & {
  kind: "comparison";
  id: "ericeira-vs-peniche";
  zoneIds: readonly ["ericeira", "peniche"];
};
export type Theme = MonthTheme | CountryTheme | ComparisonTheme;
export type ThemeId = Theme["id"];

// Reviewed publications only. No month × level × country generation.
export const THEMES: readonly Theme[] = [
  {
    kind: "month",
    id: "novembre",
    month: 11,
    monthName: "novembre",
    path: "/ou-surfer-en/novembre",
    title: "Où surfer en novembre ? Destinations, spots et saisons",
    description:
      "Compare les destinations de Surftrips en novembre : périodes favorables ou d’épaule, niveaux par spot et saisons qui changent à l’approche de décembre.",
    heading: "Où surfer en novembre ?",
    introduction:
      "Ericeira, Imsouane, Hossegor ou Uluwatu : quatre pistes pour un départ en novembre. Des saisons qui se poursuivent aux périodes de transition, le bon choix commence par ton niveau et le spot que tu souhaites découvrir.",
    cta: "Trouver ma destination surf en novembre",
    linkLabel: "Où surfer en novembre ?",
  },
  {
    kind: "month",
    id: "decembre",
    month: 12,
    monthName: "décembre",
    path: "/ou-surfer-en/decembre",
    title: "Où surfer en décembre ? Préparer son surf trip",
    description:
      "Prépare un surf trip en décembre avec les saisons documentées de Surftrips : spots, niveaux, différences avec novembre et périodes qui traversent la fin d’année.",
    heading: "Où surfer en décembre ?",
    introduction:
      "Fernando de Noronha, Mompiche, Jardim do Mar et Ericeira ouvrent quatre pistes pour décembre. Certaines saisons commencent, d’autres traversent déjà la fin de l’année : quelques repères pour imaginer ton prochain départ.",
    cta: "Trouver ma destination surf en décembre",
    linkLabel: "Où surfer en décembre ?",
  },
  {
    kind: "country",
    id: "portugal",
    country: "Portugal",
    path: "/surf/portugal",
    title: "Surf trip au Portugal : quelles destinations choisir ?",
    description:
      "Compare les zones portugaises de Surftrips par spots, niveaux, périodes et aéroports d’arrivée, puis personnalise ton surf trip au Portugal.",
    heading: "Surf trip au Portugal",
    introduction:
      "Ericeira, Peniche, Jardim do Mar… Un surf trip au Portugal peut prendre plusieurs directions. Voici quelques escales à découvrir, avec ce qui les distingue et les repères utiles pour construire ton propre voyage.",
    cta: "Organiser mon surf trip au Portugal",
    linkLabel: "Découvrir les destinations surf au Portugal",
  },
  {
    kind: "comparison",
    id: "ericeira-vs-peniche",
    zoneIds: ["ericeira", "peniche"],
    path: "/comparer/ericeira-vs-peniche",
    title: "Ericeira ou Peniche : comparer les spots et les accès",
    description:
      "Ericeira ou Peniche pour ton surf trip ? Compare les spots documentés, niveaux, saisons et transferts depuis Lisbonne, sans score ni gagnant arbitraire.",
    heading: "Ericeira ou Peniche ?",
    introduction:
      "Deux destinations, une arrivée par Lisbonne, et des spots différents pour donner une direction au voyage. Pour choisir entre Ericeira et Peniche, partons de ce qui compte : le surf que tu recherches, ton niveau et tes dates.",
    cta: "Personnaliser mon surf trip au Portugal",
    linkLabel: "Comparer Ericeira et Peniche",
  },
];

export function getMonthTheme(slug: string): MonthTheme | undefined {
  return THEMES.find(
    (theme): theme is MonthTheme => theme.kind === "month" && theme.id === slug,
  );
}

export function themeDestinations(
  theme: Theme,
  zones: readonly Zone[],
): Zone[] {
  if (theme.kind === "month")
    return [
      ...monthlyZones(zones, theme.month, "optimale"),
      ...monthlyZones(zones, theme.month, "epaule"),
    ];
  if (theme.kind === "country") return countryZones(zones, theme.country);
  const catalog = publicThemeZones(zones);
  return theme.zoneIds.flatMap((id) =>
    catalog.filter((zone) => zone.zoneId === id),
  );
}

export function isThemeAvailable(
  theme: Theme,
  zones: readonly Zone[],
): boolean {
  const selected = themeDestinations(theme, zones);
  if (theme.kind === "month")
    return monthlyZones(zones, theme.month, "optimale").length >= 2;
  if (theme.kind === "country") return selected.length >= 2;
  return (
    selected.length === theme.zoneIds.length &&
    selected.every(
      (zone) =>
        zone.country === "Portugal" &&
        zone.airportCode === "LIS" &&
        zone.transfer &&
        zone.spots.every(
          (spot) =>
            spot.minimumLevel &&
            !spot.minimumNeedsReview &&
            isMonth(spot.startMonth) &&
            isMonth(spot.endMonth) &&
            spot.wave &&
            spot.bottom,
        ),
    )
  );
}

export function publishedThemes(zones: readonly Zone[]): Theme[] {
  return THEMES.filter((theme) => isThemeAvailable(theme, zones));
}

export function themesForDestination(
  zone: Zone,
  catalog: readonly Zone[],
): Theme[] {
  return publishedThemes(catalog).filter((theme) =>
    themeDestinations(theme, catalog).some(
      (other) => other.zoneId === zone.zoneId,
    ),
  );
}

export function contextualThemes(
  theme: Theme,
  catalog: readonly Zone[],
): Theme[] {
  const relatedId =
    theme.id === "novembre"
      ? "decembre"
      : theme.id === "decembre"
        ? "novembre"
        : theme.id === "portugal"
          ? "ericeira-vs-peniche"
          : "portugal";
  return publishedThemes(catalog).filter((other) => other.id === relatedId);
}
