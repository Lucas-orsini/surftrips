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
};

export function destinationBannerPosition(path: string | null | undefined) {
  return (path && BANNER_POSITIONS[path]) || "center";
}
