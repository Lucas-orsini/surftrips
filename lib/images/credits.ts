// Required credits for these exact derivatives only. Existing Unsplash images
// remain unchanged. Source, author, licence and adaptation notice stay together.
export const DESTINATION_PHOTO_CREDITS: Readonly<
  Record<
    string,
    {
      title: string;
      photographer: string;
      photographerUrl: string;
      sourceUrl: string;
      license: string;
      licenseUrl: string;
    }
  >
> = {
  "lobitos/hero.webp": {
    title: "Vista del balneario de Lobitos, Talara - Piura",
    photographer: "German Ato Zavala",
    photographerUrl:
      "https://commons.wikimedia.org/wiki/Special:Contributions/Germanato.zava94",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Vista_del_balneario_de_Lobitos,_Talara_-_Piura.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "pohnpei/hero.webp": {
    title: "Pohnpei lagoon from plane",
    photographer: "Zykasaa",
    photographerUrl:
      "https://commons.wikimedia.org/wiki/Special:Contributions/Zykasaa",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Pohnpei_lagoon_from_plane.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "santa-rosa-cr/hero.webp": {
    title: "Roca Bruja - Guanacaste - Costa Rica",
    photographer: "dog4aday",
    photographerUrl: "https://www.flickr.com/people/dog4aday/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Roca_Bruja_-_Guanacaste_-_Costa_Rica.jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
};

export function destinationPhotoCredit(path?: string | null) {
  return path && Object.hasOwn(DESTINATION_PHOTO_CREDITS, path)
    ? DESTINATION_PHOTO_CREDITS[path]
    : undefined;
}
