import type { SurfSpot, Zone } from "../types.ts";
import { isIndexableDestination } from "../seo.ts";

export interface EditorialText {
  text: string;
  sourceIds?: readonly string[];
}
export interface EditorialSource {
  label: string;
  url: string;
  checkedAt: string;
}
export interface DestinationEditorial {
  zoneId: string;
  country: string;
  spotIds: readonly string[];
  introduction?: EditorialText;
  practical?: readonly EditorialText[];
  // null deliberately withholds an unverified legacy note, without changing DB data.
  spotNotes?: Readonly<Record<string, EditorialText | null>>;
  sources: Readonly<Record<string, EditorialSource>>;
}

const checkedAt = "2026-11-04";
export const destinationEditorials: Readonly<
  Record<string, DestinationEditorial | undefined>
> = {
  ericeira: {
    zoneId: "ericeira",
    country: "Portugal",
    spotIds: ["coxos", "ribeira-ilhas"],
    introduction: {
      text: "À Ericeira, le surf s’inscrit dans un littoral reconnu World Surfing Reserve depuis 2011. Coxos et Ribeira d’Ilhas font partie de cette réserve. Ces deux spots sont répertoriés sur Surftrips : leurs niveaux et leurs périodes de saison se consultent séparément pour préparer son séjour.",
      sourceIds: ["reserve"],
    },
    spotNotes: { coxos: null, "ribeira-ilhas": null },
    sources: {
      reserve: {
        label: "Save The Waves — réserve de surf d’Ericeira",
        url: "https://www.savethewaves.org/ericeira/",
        checkedAt,
      },
    },
  },
  biarritz: {
    zoneId: "biarritz",
    country: "France",
    spotIds: ["cote-des-basques"],
    introduction: {
      text: "À Biarritz, la Côte des Basques associe une plage de sable à un paysage de falaises. Ce lieu historique du surf est le spot documenté dans cette fiche. L’étendue de la plage change avec la marée : un repère à prendre en compte pour organiser ses journées sur place.",
      sourceIds: ["ville"],
    },
    practical: [
      {
        text: "À la Côte des Basques, l’accès au sable dépend de la marée. La Ville indique que la plage peut disparaître et que la baignade est suspendue à marée haute faute d’accès. Sa fiche officielle précise les conditions d’accès et les périodes de surveillance.",
        sourceIds: ["ville"],
      },
    ],
    spotNotes: { "cote-des-basques": null },
    sources: {
      ville: {
        label: "Ville de Biarritz — Côte des Basques",
        url: "https://www.biarritz.fr/cadre-de-vie-bizi-ingurunea/plages/cote-des-basques",
        checkedAt,
      },
    },
  },
  imsouane: {
    zoneId: "imsouane",
    country: "Maroc",
    spotIds: ["im-bay"],
    introduction: {
      text: "Imsouane est un village de pêcheurs situé au nord de Taghazout, sur la côte marocaine. L’Office national marocain du tourisme le décrit notamment pour sa longue droite. Cette fiche se concentre sur The Bay, le spot enregistré dans Surftrips, avec sa saison et ses informations d’accès.",
      sourceIds: ["onmt"],
    },
    spotNotes: { "im-bay": null },
    sources: {
      onmt: {
        label:
          "Office national marocain du tourisme — Maroc Ocean Wave, p. 7 (PDF)",
        url: "https://www.visitmorocco.com/sites/default/files/atoms/files/def_maroc_ocean_wave_20250804_ok_1.pdf#page=4",
        checkedAt,
      },
    },
  },
  "bukit-bali": {
    zoneId: "bukit-bali",
    country: "Indonesie",
    spotIds: ["bingin", "padang-padang", "uluwatu"],
    introduction: {
      text: "La destination Bukit / Uluwatu, à Bali, rassemble ici Bingin, Padang Padang et Uluwatu. Uluwatu est aussi le nom d’un spot composé de plusieurs sections, dont The Peak, Racetracks et Outside Corner. Pour préparer un surf trip dans cette zone, les fiches ci-dessous permettent de distinguer chaque spot plutôt que de les confondre sous un seul nom.",
      sourceIds: ["indonesia"],
    },
    spotNotes: { bingin: null, "padang-padang": null, uluwatu: null },
    sources: {
      indonesia: {
        label: "Indonesia Travel — les sections d’Uluwatu",
        url: "https://www.indonesia.travel/gb/en/destination/bali-nusa-tenggara/bali/uluwatu",
        checkedAt,
      },
    },
  },
  hossegor: {
    zoneId: "hossegor",
    country: "France",
    spotIds: ["la-graviere"],
    introduction: {
      text: "À Hossegor, La Gravière se situe sur le front de mer, à proximité de la place des Landais. C’est le spot documenté dans cette fiche Hossegor / Seignosse. Les informations présentées concernent donc La Gravière ; elles ne décrivent pas l’ensemble des plages et des spots de ces deux communes.",
      sourceIds: ["office"],
    },
    spotNotes: {
      "la-graviere": {
        text: "L’office de tourisme décrit une vague qui déferle rapidement près du bord, dans peu d’eau, et déconseille ce spot aux débutants.",
        sourceIds: ["office"],
      },
    },
    sources: {
      office: {
        label: "Office de tourisme d’Hossegor — plage de la Gravière",
        url: "https://www.hossegor.fr/activites/plage-de-la-graviere-ocean/",
        checkedAt,
      },
    },
  },
};

type EditorialZone = Pick<Zone, "zoneId" | "country"> & {
  spots: Pick<SurfSpot, "spotId">[];
};

/** Invalid or stale content is reported by audit:seo and withheld from visitors. */
export function validateDestinationEditorial(
  entry: DestinationEditorial,
  zone: EditorialZone,
): string[] {
  const issues: string[] = [];
  if (entry.zoneId !== zone.zoneId || entry.country !== zone.country)
    issues.push("Editorial destination identity mismatch");
  if (
    !entry.spotIds.length ||
    new Set(entry.spotIds).size !== entry.spotIds.length
  )
    issues.push("Empty or duplicate editorial spot references");
  for (const id of entry.spotIds)
    if (!zone.spots.some((s) => s.spotId === id))
      issues.push(`Unknown editorial spot: ${id}`);
  for (const id of Object.keys(entry.spotNotes || {}))
    if (!entry.spotIds.includes(id))
      issues.push(`Unreferenced spot note: ${id}`);
  const blocks = [
    entry.introduction,
    ...(entry.practical || []),
    ...Object.values(entry.spotNotes || {}),
  ].filter((b) => b != null);
  if (!blocks.length) issues.push("Empty editorial entry");
  if (entry.practical?.length === 0) issues.push("Empty practical section");
  for (const block of blocks) {
    if (!block.text.trim()) issues.push("Empty editorial text");
    for (const id of block.sourceIds || [])
      if (!entry.sources[id]) issues.push(`Unknown editorial source: ${id}`);
  }
  for (const source of Object.values(entry.sources)) {
    try {
      const url = new URL(source.url);
      if (url.protocol !== "https:" || url.username || url.password)
        throw new Error("Invalid source URL");
    } catch {
      issues.push("Invalid editorial source URL");
    }
    if (
      !source.label.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt) ||
      Number.isNaN(Date.parse(source.checkedAt))
    )
      issues.push("Invalid source provenance");
  }
  return issues;
}

export function getDestinationEditorial(zone: EditorialZone) {
  const entry = destinationEditorials[zone.zoneId];
  return entry && !validateDestinationEditorial(entry, zone).length
    ? entry
    : undefined;
}

export function editorialSpotNote(
  spot: Pick<SurfSpot, "spotId" | "notes">,
  editorial?: DestinationEditorial,
): EditorialText | null {
  const override = editorial?.spotNotes?.[spot.spotId];
  return override !== undefined
    ? override
    : spot.notes
      ? { text: spot.notes }
      : null;
}

/** Same country only, alphabetic, no scores or unverified proximity inference. */
export function relatedCountryDestinations<
  T extends Pick<Zone, "zoneId" | "name" | "country">,
>(
  zone: Pick<Zone, "zoneId" | "country">,
  catalog: readonly T[],
  excludedIds: readonly string[] = [],
): T[] {
  const seen = new Set([zone.zoneId, ...excludedIds]);
  return catalog
    .filter((other) => {
      if (
        seen.has(other.zoneId) ||
        other.country !== zone.country ||
        !isIndexableDestination(other)
      )
        return false;
      seen.add(other.zoneId);
      return true;
    })
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name, "fr") || a.zoneId.localeCompare(b.zoneId),
    )
    .slice(0, 3);
}
