import type { SurfSpot, Zone } from "../types.ts";
import type { Theme, ThemeId } from "./themes.ts";
import { themeDestinations } from "./themes.ts";
import { isMonth, monthStatus } from "../surf/season.ts";
import { LEVEL_LABELS } from "../surf/levels.ts";

/** Reading choices, never a surf ranking. All facts still come from the catalog. */
type Feature = {
  zoneId: string;
  spotId: string;
  country: string;
  heading: string;
  compact?: boolean;
  valid?: (zone: Zone, spot: SurfSpot) => boolean;
  paragraphs: (zone: Zone, spot: SurfSpot) => string[];
};
export type ArticleHighlight = {
  zone: Zone;
  spot: SurfSpot;
  heading: string;
  compact: boolean;
  paragraphs: string[];
};

const monthName = (month: number) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, month - 1, 1)),
  );
export function articlePeriod(spot: SurfSpot): string {
  if (!isMonth(spot.startMonth) || !isMonth(spot.endMonth))
    return "Période à vérifier";
  return spot.startMonth === spot.endMonth
    ? monthName(spot.startMonth)
    : `${monthName(spot.startMonth)}–${monthName(spot.endMonth)}`;
}
const minimum = (s: SurfSpot) =>
  s.minimumLevel ? LEVEL_LABELS[s.minimumLevel].toLowerCase() : "à vérifier";
const uncertainIdeal = (s: SurfSpot) =>
  s.idealNeedsReview
    ? " Son niveau idéal reste à vérifier : ce repère ne vaut pas une recommandation pour débutants."
    : " Le choix d’une session reste à confronter aux conditions sur place.";

const ericeira: Feature = {
  zoneId: "ericeira",
  spotId: "coxos",
  country: "Portugal",
  heading: "Ericeira, partir du spot",
  valid: (z, s) =>
    z.spots.length > 1 &&
    s.wave === "point break" &&
    z.airportCode === "LIS" &&
    !!s.startMonth &&
    !!s.endMonth &&
    s.startMonth <= 11 &&
    s.startMonth > s.endMonth,
  paragraphs: (z, s) => [
    `À Ericeira, le choix commence par le spot que tu souhaites découvrir. ${s.name}, un ${s.wave}, offre un premier point de comparaison avec les vagues de plage présentes dans cette sélection. La fiche de la destination permet ensuite d’explorer les autres spots documentés.`,
    `La période indiquée pour ${s.name} est ${articlePeriod(s)}, avec un niveau minimum ${minimum(s)}. Pour préparer l’arrivée, Surftrips référence l’aéroport de ${z.airportName} (${z.airportCode}).`,
  ],
};
const peniche: Feature = {
  zoneId: "peniche",
  spotId: "supertubos",
  country: "Portugal",
  heading: "Peniche, le repère Supertubos",
  valid: (z, s) =>
    z.spots.length === 1 && s.wave === "beach break" && z.airportCode === "LIS",
  paragraphs: (_z, s) => [
    `À Peniche / Baleal, notre point d’entrée est ${s.name}. Ce ${s.wave} se distingue du point break documenté à Ericeira. C’est une façon concrète de comparer les deux destinations, sans attribuer les mêmes caractéristiques à toutes leurs plages.`,
    `La période renseignée est ${articlePeriod(s)} et le niveau minimum ${minimum(s)}. La fiche Surftrips ne décrit actuellement que ce spot : elle ne résume pas toutes les possibilités de Peniche ou de Baleal.`,
  ],
};
const jardim: Feature = {
  zoneId: "jardim-do-mar",
  spotId: "jardim-do-mar",
  country: "Portugal",
  heading: "Jardim do Mar, une autre arrivée",
  valid: (z, s) =>
    z.airportCode === "FNC" &&
    !!s.startMonth &&
    !!s.endMonth &&
    s.startMonth <= 11 &&
    s.startMonth > s.endMonth,
  paragraphs: (z, s) => [
    `Jardim do Mar donne une autre piste pour un voyage au Portugal : l’arrivée renseignée se fait à ${z.airportName} (${z.airportCode}). Le spot du même nom est un ${s.wave} ; son minimum ${minimum(s)} invite à réserver ce projet à une pratique correspondante, après évaluation des conditions.`,
    `Son calendrier ${articlePeriod(s)} traverse le changement d’année. La fiche rassemble les repères de surf et le transfert indiqué pour poursuivre la préparation du voyage.`,
  ],
};

const FEATURES: Record<ThemeId, readonly Feature[]> = {
  novembre: [
    ericeira,
    {
      zoneId: "imsouane",
      spotId: "im-bay",
      country: "Maroc",
      heading: "Imsouane, un voyage autour de la baie",
      valid: (z, s) =>
        z.spots.length === 1 &&
        !!s.startMonth &&
        !!s.endMonth &&
        s.startMonth > s.endMonth,
      paragraphs: (z, s) => [
        `Pour regarder du côté du Maroc, Imsouane apporte un autre repère : ${s.name}, un ${s.wave}, dont la période indiquée est ${articlePeriod(s)}. Novembre s’inscrit donc dans un calendrier qui se poursuit après la fin de l’année.`,
        `L’arrivée référencée est ${z.airportName} (${z.airportCode}). La fiche se concentre sur The Bay, sans prétendre décrire tous les spots alentour.${uncertainIdeal(s)}`,
      ],
    },
    {
      zoneId: "hossegor",
      spotId: "la-graviere",
      country: "France",
      heading: "Hossegor, la fin d’une période",
      valid: (_z, s) => s.endMonth === 11,
      paragraphs: (_z, s) => [
        `À Hossegor, ${s.name} donne au mois de novembre un sens précis : il clôt la période ${articlePeriod(s)} renseignée dans Surftrips. Ce ${s.wave}, au minimum ${minimum(s)}, constitue une piste à examiner pour une pratique de ce niveau.`,
        "Si ton séjour se prolonge en décembre, vérifie à nouveau la saison dans ta recherche. Ce repère concerne La Gravière ; il ne décrit pas tous les spots d’Hossegor et de Seignosse.",
      ],
    },
    {
      zoneId: "bukit-bali",
      spotId: "uluwatu",
      country: "Indonesie",
      heading: "Uluwatu, une option de transition",
      valid: (_z, s) => s.endMonth === 10,
      paragraphs: (_z, s) => [
        `Uluwatu illustre un choix différent : novembre arrive juste après sa période ${articlePeriod(s)}. Il est donc présenté ici comme un mois d’épaule, aux conditions variables, et non comme le cœur de la saison renseignée.`,
        `Le spot est un ${s.wave}, avec un minimum ${minimum(s)}. Pour découvrir les autres spots de Bukit et leurs calendriers propres, poursuis la lecture sur la fiche destination.`,
      ],
    },
  ],
  decembre: [
    {
      zoneId: "fernando-de-noronha",
      spotId: "calimba-do-padre",
      country: "Bresil",
      heading: "Fernando de Noronha, un calendrier qui s’ouvre",
      valid: (_z, s) => s.startMonth === 12 && s.wave === "beach break",
      paragraphs: (_z, s) => [
        `Décembre marque le début de la période ${articlePeriod(s)} indiquée pour ${s.name}, à Fernando de Noronha. C’est ce changement par rapport à novembre qui motive sa présence dans cette sélection.`,
        `Ce ${s.wave} possède un minimum ${minimum(s)}. La photographie donne un aperçu de la destination ; pour décider d’un voyage, complète cette première impression par les repères de la fiche et tes dates réelles.`,
      ],
    },
    {
      zoneId: "mompiche",
      spotId: "monpiche",
      country: "Equateur",
      heading: "Mompiche, une autre piste pour décembre",
      valid: (_z, s) => s.startMonth === 12,
      paragraphs: (z, s) => [
        `Mompiche entre elle aussi dans sa période renseignée, ${articlePeriod(s)}. Son ${s.wave} offre un autre point de comparaison avec le beach break de Fernando de Noronha : un même mois de départ peut mener à des projets de surf différents.`,
        `Le minimum indiqué est ${minimum(s)} et l’aéroport référencé ${z.airportName} (${z.airportCode}). La fiche détaillée permet de regarder l’accès avant de retenir cette escale.`,
      ],
    },
    { ...jardim, heading: "Jardim do Mar, de part et d’autre de l’année" },
    { ...ericeira, heading: "Ericeira, une saison qui se poursuit" },
  ],
  portugal: [
    ericeira,
    peniche,
    jardim,
    {
      zoneId: "carrapateira",
      spotId: "praia-da-bordeira",
      country: "Portugal",
      compact: true,
      heading: "Carrapateira, du côté de Faro",
      valid: (z, s) => z.airportCode === "FAO" && s.startMonth === s.endMonth,
      paragraphs: (z, s) => [
        `Carrapateira est associée à ${z.airportName} (${z.airportCode}). Pour ${s.name}, seul ${articlePeriod(s)} est indiqué dans le calendrier : un repère à faire confirmer avant de l’étendre à une saison entière.${uncertainIdeal(s)}`,
      ],
    },
    {
      zoneId: "nazare",
      spotId: "nazare",
      country: "Portugal",
      compact: true,
      heading: "Nazaré, un repère pour experts",
      valid: (_z, s) => s.minimumLevel === "expert",
      paragraphs: (_z, s) => [
        `${s.name} est le spot documenté dans la fiche de Nazaré. Son minimum ${minimum(s)} et sa période ${articlePeriod(s)} servent de premiers repères ; ils ne permettent pas d’extrapoler les conditions de toutes les sessions.`,
      ],
    },
  ],
  "ericeira-vs-peniche": [ericeira, peniche],
};

export function articleHighlights(
  theme: Theme,
  catalog: readonly Zone[],
): ArticleHighlight[] {
  const eligible = themeDestinations(theme, catalog);
  return FEATURES[theme.id].flatMap((feature) => {
    const zone = eligible.find(
      (z) => z.zoneId === feature.zoneId && z.country === feature.country,
    );
    const spot = zone?.spots.find(
      (s) => s.spotId === feature.spotId && s.zoneId === zone.zoneId,
    );
    if (
      !zone ||
      !spot ||
      !isMonth(spot.startMonth) ||
      !isMonth(spot.endMonth) ||
      !spot.minimumLevel ||
      spot.minimumNeedsReview
    )
      return [];
    if (feature.valid && !feature.valid(zone, spot)) return [];
    if (
      theme.kind === "month" &&
      !["optimale", "epaule"].includes(
        monthStatus(theme.month, spot.startMonth, spot.endMonth) || "",
      )
    )
      return [];
    return [
      {
        zone,
        spot,
        heading: feature.heading,
        compact: !!feature.compact,
        paragraphs: feature.paragraphs(zone, spot),
      },
    ];
  });
}
export function articleSelectionIssues(
  theme: Theme,
  catalog: readonly Zone[],
): string[] {
  const shown = articleHighlights(theme, catalog);
  return FEATURES[theme.id]
    .filter((f) => !shown.some((h) => h.zone.zoneId === f.zoneId))
    .map(
      (f) =>
        `Sélection éditoriale à revoir : ${theme.id}/${f.zoneId}/${f.spotId}`,
    );
}
