// A French educational guide, independent of seasonal data and weather APIs.
export const SURF_FORECAST = {
  path: "/surf-forecast",
  title: "Surf forecast : comprendre les prévisions de surf",
  heading: "Surf forecast : comprendre les prévisions de surf",
  description:
    "Apprends à lire la houle, la période, le vent et les marées. Un exemple expliqué pour préparer tes sessions et distinguer prévisions et saisons de surf.",
  introduction:
    "Un surf forecast est une prévision des conditions de surf pour les prochaines heures ou les prochains jours. Hauteur, période et direction de houle, vent, marée : ces repères se lisent ensemble, à l’échelle d’un spot.",
  ctaHref: "/destinations#recherche",
} as const;

// References checked on 2026-11-22. No forecast data are fetched or reproduced.
export const FORECAST_SOURCES = [
  {
    label: "Copernicus Marine — hauteur, période et direction des vagues",
    href: "https://help.marine.copernicus.eu/en/articles/6175153-how-to-describe-wave-height-period-and-direction-parameters",
  },
  {
    label: "Surfline — différence entre houle et vagues au bord",
    href: "https://support.surfline.com/hc/en-us/articles/4410126820891-Difference-between-swell-and-surf",
  },
  {
    label: "Surfline — lire les informations d’une prévision",
    href: "https://support.surfline.com/hc/en-us/articles/13749782983579-Understanding-the-Spot-Forecast-Page-on-the-Surfline-Website",
  },
  {
    label: "Surfline — vent observé, vent prévu et effets locaux",
    href: "https://support.surfline.com/hc/en-us/articles/5291311612315-Live-Wind",
  },
  {
    label: "Shom — les références de hauteur de marée",
    href: "https://refmar.shom.fr/references-de-hauteur-en-maregraphie",
  },
  {
    label: "Ville de Biarritz — plage de la Côte des Basques",
    href: "https://www.biarritz.fr/cadre-de-vie-bizi-ingurunea/plages/cote-des-basques",
  },
] as const;
