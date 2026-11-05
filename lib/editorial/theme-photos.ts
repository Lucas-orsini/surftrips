// Exact assets inspected visually. Location/author evidence is retained in
// docs/destination-image-batch.json and docs/destination-image-completion.json.
// These photographs illustrate places, not the conditions of a given month.
const PHOTOS: Record<
  string,
  { alt: string; caption: string; author: string; source: string }
> = {
  "ericeira/hero.webp": {
    alt: "Deux surfeurs avec leurs planches au bord d’une plage d’Ericeira",
    caption: "Sur la plage, à Ericeira · Portugal",
    author: "Djordje Djordjevic",
    source: "https://unsplash.com/photos/LPTQ4ZZnUSA",
  },
  "imsouane/hero.webp": {
    alt: "Surfeurs répartis sur les lignes de vagues dans la baie d’Imsouane",
    caption: "La baie d’Imsouane · Maroc",
    author: "Louis Hansel",
    source: "https://unsplash.com/photos/NJzr828hh-4",
  },
  "hossegor/hero.webp": {
    alt: "Surfeur sur une vague et autres surfeurs au large d’Hossegor",
    caption: "Un regard sur l’océan, à Hossegor · France",
    author: "Jarno Colijn",
    source: "https://unsplash.com/photos/9aShb0YueiA",
  },
  "bukit-bali/hero.webp": {
    alt: "L’océan et les rochers vus depuis une cavité à Uluwatu, Bali",
    caption: "Uluwatu, sur la péninsule de Bukit · Bali",
    author: "Niklas Weiss",
    source: "https://unsplash.com/photos/vqdT2QPBGjs",
  },
  "fernando-de-noronha/hero.webp": {
    alt: "Deux îlots rocheux face à une plage de Fernando de Noronha",
    caption: "Fernando de Noronha · Brésil",
    author: "Jaime Spaniol",
    source: "https://unsplash.com/photos/LLXhVppSMeA",
  },
  "mompiche/hero.webp": {
    alt: "Plage bordée de palmiers et de bâtiments à Mompiche",
    caption: "Le bord de plage à Mompiche · Équateur",
    author: "Andrés Salgado",
    source: "https://unsplash.com/photos/9oYcyaC_NdM",
  },
  "jardim-do-mar/hero.webp": {
    alt: "Une vague déferlant dans l’océan à Jardim do Mar",
    caption: "Jardim do Mar, Madère · Portugal",
    author: "Colin Watts",
    source: "https://unsplash.com/photos/0zgYFRzaDTE",
  },
  "peniche/hero.webp": {
    alt: "Un îlot rocheux entouré par l’océan à Baleal, dans la zone de Peniche",
    caption: "La côte de Baleal, dans la zone de Peniche · Portugal",
    author: "Timur Seyfelmlyukov",
    source: "https://unsplash.com/photos/-WFd3V_xxdM",
  },
};
export function articlePhoto(path: string | null | undefined) {
  return path && Object.hasOwn(PHOTOS, path) ? PHOTOS[path] : undefined;
}
