import nextEnv from "@next/env";
import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { SUPABASE_CA } from "../lib/db/supabase-ca.ts";
import {
  destinationStorageOrigin,
  getDestinationImageUrl,
} from "../lib/images/destination.ts";

// Operator-only utility. Never imported by Next.js, never run at build/start.
// No Unsplash scraping, discovery or download. Only publishes the reviewed local batch.
nextEnv.loadEnvConfig(process.cwd());
interface Entry {
  zone_id: string;
  destination: string;
  country: string;
  source_url: string;
  photographer: string;
  photographer_url: string;
  storage_path: string;
  bytes: number;
  sha256: string;
}
let client: Client | undefined;
try {
  const { values } = parseArgs({
    options: {
      publish: { type: "boolean", default: false },
      manifest: {
        type: "string",
        default: "docs/destination-image-batch.json",
      },
    },
    allowPositionals: false,
  });
  const publish = values.publish;
  const manifestPath = values.manifest;
  if (!/^docs\/destination-image-batch(?:-\d{2})?\.json$/.test(manifestPath))
    throw new Error("MANIFESTE_INVALIDE");
  const { images } = JSON.parse(await readFile(manifestPath, "utf8")) as {
    images: Entry[];
  };
  if (
    !Array.isArray(images) ||
    !images.length ||
    images.length > 15 ||
    new Set(images.map((e) => e.zone_id)).size !== images.length
  )
    throw new Error("LOT_INVALIDE");
  const origin = destinationStorageOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!origin) throw new Error("URL_STORAGE_MANQUANTE");
  const files = new Map<string, Buffer>();
  for (const entry of images) {
    if (
      !/^[a-z0-9-]+$/.test(entry.zone_id) ||
      entry.storage_path !== `${entry.zone_id}/hero.webp` ||
      !entry.photographer ||
      !/^https:\/\/unsplash\.com\/photos\/[a-zA-Z0-9_-]+$/.test(
        entry.source_url,
      ) ||
      !/^https:\/\/unsplash\.com\/@[a-zA-Z0-9_-]+$/.test(entry.photographer_url)
    )
      throw new Error("SOURCE_OU_CHEMIN_INVALIDE");
    const file = await readFile(
      resolve(".local/destination-images", entry.storage_path),
    );
    const metadata = await sharp(file).metadata();
    if (
      metadata.format !== "webp" ||
      metadata.width !== 1600 ||
      metadata.height !== 1000 ||
      file.length >= 500_000 ||
      file.length !== entry.bytes ||
      createHash("sha256").update(file).digest("hex") !== entry.sha256
    )
      throw new Error("IMAGE_NON_CONFORME_AU_LOT_VALIDE");
    files.set(entry.zone_id, file);
  }
  const connection = new URL(
    process.env.DATABASE_URL || process.env.DIRECT_URL || "",
  );
  for (const option of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
    connection.searchParams.delete(option);
  client = new Client({
    connectionString: connection.toString(),
    ssl: { rejectUnauthorized: true, ca: SUPABASE_CA },
    connectionTimeoutMillis: 8000,
    query_timeout: 10000,
  });
  await client.connect();
  const zones = (
    await client.query<{
      zone_id: string;
      nom: string;
      pays: string;
      hero_image_path: string | null;
    }>(
      "SELECT zone_id,nom,pays,to_jsonb(z)->>'hero_image_path' AS hero_image_path FROM public.zones z WHERE zone_id = ANY($1::text[])",
      [images.map((e) => e.zone_id)],
    )
  ).rows;
  for (const entry of images) {
    const zone = zones.find((z) => z.zone_id === entry.zone_id);
    if (!zone || zone.nom !== entry.destination || zone.pays !== entry.country)
      throw new Error("DESTINATION_A_REVERIFIER");
    if (zone.hero_image_path && zone.hero_image_path !== entry.storage_path)
      throw new Error("PHOTO_EXISTANTE_NON_REMPLACEE");
  }
  if (!publish) {
    console.log(
      `${images.length} images locales conformes et zones existantes vérifiées. Aucune écriture. Utiliser --publish seulement lorsque le lot et les prérequis sont validés.`,
    );
  } else {
    const hasColumn = (
      await client.query(
        "SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='zones' AND column_name='hero_image_path'",
      )
    ).rowCount;
    if (!hasColumn) throw new Error("MIGRATION_IMAGE_A_APPLIQUER_APRES_REVUE");
    const key =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error("CLE_STORAGE_SERVEUR_MANQUANTE");
    const headers: Record<string, string> = { apikey: key };
    if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
    async function storage(path: string, init: RequestInit = {}) {
      return fetch(`${origin}/storage/v1/${path}`, {
        ...init,
        redirect: "error",
        headers: { ...headers, ...init.headers },
        signal: AbortSignal.timeout(20000),
      });
    }
    const bucket = await storage("bucket/destinations");
    if (!bucket.ok || !(await bucket.json()).public)
      throw new Error("BUCKET_DESTINATIONS_PUBLIC_A_CREER");
    for (const entry of images) {
      const bytes = files.get(entry.zone_id)!;
      const publicUrl = getDestinationImageUrl(entry.storage_path, origin)!;
      // Existing objects are never overwritten. Permit safe resumption only if bytes match.
      const existing = await fetch(publicUrl, {
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      if (existing.ok) {
        const hash = createHash("sha256")
          .update(Buffer.from(await existing.arrayBuffer()))
          .digest("hex");
        if (hash !== entry.sha256)
          throw new Error("OBJET_STORAGE_EXISTANT_DIFFERENT");
      } else {
        if (![400, 404].includes(existing.status))
          throw new Error("LECTURE_STORAGE_INDISPONIBLE");
        const upload = await storage(
          `object/destinations/${entry.storage_path}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "image/webp",
              "Cache-Control": "max-age=31536000",
              "x-upsert": "false",
            },
            body: new Uint8Array(bytes),
          },
        );
        if (!upload.ok) throw new Error("UPLOAD_STORAGE_REFUSE");
      }
      const check = await fetch(publicUrl, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      if (
        !check.ok ||
        createHash("sha256")
          .update(Buffer.from(await check.arrayBuffer()))
          .digest("hex") !== entry.sha256
      )
        throw new Error("VERIFICATION_IMAGE_PUBLIQUE_ECHOUEE");
      // Only link an uploaded, publicly verified object, atomically against concurrent edits.
      const update = await client.query(
        "UPDATE public.zones SET hero_image_path=$1 WHERE zone_id=$2 AND nom=$3 AND pays=$4 AND (hero_image_path IS NULL OR hero_image_path=$1) RETURNING zone_id",
        [entry.storage_path, entry.zone_id, entry.destination, entry.country],
      );
      if (update.rowCount !== 1)
        throw new Error("ZONE_MODIFIEE_PENDANT_L_UPLOAD");
      console.log(
        `${entry.zone_id} : ${entry.storage_path}, ${entry.bytes} octets — publié et vérifié.`,
      );
    }
  }
} catch (error) {
  const code =
    error instanceof Error && /^[A-Z_]+$/.test(error.message)
      ? error.message
      : "OPERATION_INDISPONIBLE";
  console.error(
    `Publication : ${code}. Aucun secret ni détail technique affiché. Les objets déjà présents ne sont pas écrasés ; une reprise vérifie leurs empreintes.`,
  );
  process.exitCode = 1;
} finally {
  await client?.end().catch(() => undefined);
}
