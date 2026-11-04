// Editorial crop overrides for the destination banner only. Keys identify the
// exact asset; a future database position can be passed to DestinationHero.
// Cards and landing keep their current crop. Unlisted photos default to center.
const BANNER_POSITIONS: Readonly<Record<string, string>> = {
  "ericeira/hero.webp": "center 65%",
  "arugam-bay/hero.webp": "center 70%",
  "imsouane/hero.webp": "center 70%",
  "siargao/hero.webp": "center 80%",
  "mundaka/hero.webp": "center 25%",
  "bundoran/hero.webp": "center 65%",
  "noosa/hero.webp": "center 70%",
  "raglan/hero.webp": "center 75%",
  "torquay/hero.webp": "center 35%",
  "santa-cruz/hero.webp": "center 40%",
  "coolangatta/hero.webp": "center 100%",
  "fernando-de-noronha/hero.webp": "center 18%",
  "half-moon-bay/hero.webp": "center 35%",
  "rapa-nui/hero.webp": "center 75%",
  "pantin/hero.webp": "center 35%",
  "santa-catalina-pa/hero.webp": "center 75%",
  "tamarin/hero.webp": "center 40%",
  "tofo/hero.webp": "center 60%",
  "bocas-del-toro/hero.webp": "center 70%",
  "north-shore-oahu/hero.webp": "center 40%",
  "g-land/hero.webp": "center 35%",
  "teahupoo/hero.webp": "center 95%",
  "san-cristobal-galapagos/hero.webp": "center 100%",
  "thurso/hero.webp": "center 90%",
  "carrapateira/hero.webp": "center 35%",
  "putzu-idu/hero.webp": "center 40%",
  "unstad/hero.webp": "center 25%",
  "bali-cote-est/hero.webp": "center 65%",
  "sumba-ouest/hero.webp": "center 95%",
  "moorea/hero.webp": "center 90%",
  "lobitos/hero.webp": "center 40%",
  "nias-lagundri/hero.webp": "center 40%",
  "pohnpei/hero.webp": "center 35%",
  "punaauia/hero.webp": "center 95%",
  "santa-rosa-cr/hero.webp": "center 55%",
};

export function destinationBannerPosition(path: string | null | undefined) {
  return (path && BANNER_POSITIONS[path]) || "center";
}

// Visually reviewed against the assets and docs/destination-image-batch.json.
// A destination-level location does not establish the name of a particular spot.
const BANNER_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "ericeira/hero.webp":
    "Deux surfeurs avec leurs planches au bord d’une plage d’Ericeira",
  "biarritz/hero.webp":
    "Vagues arrivant sur une plage de Biarritz, vues depuis la côte",
  "imsouane/hero.webp":
    "Surfeurs répartis sur les lignes de vagues dans la baie d’Imsouane",
  "bukit-bali/hero.webp":
    "L’océan et les rochers vus depuis une cavité à Uluwatu, Bali",
  "hossegor/hero.webp":
    "Surfeur sur une vague et autres surfeurs au large d’Hossegor",
};

export function destinationBannerAlt(path: string | null | undefined) {
  return (path && BANNER_DESCRIPTIONS[path]) || undefined;
}
