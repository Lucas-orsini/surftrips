import nextEnv from "@next/env";
import { readQuery } from "../lib/db/index.ts";

nextEnv.loadEnvConfig(process.cwd());
try {
  const queries = {
    columns:
      "SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('zones','spots') ORDER BY table_name,ordinal_position",
    counts:
      "SELECT (SELECT count(*) FROM public.zones) AS zones,(SELECT count(*) FROM public.spots) AS spots",
    countries: "SELECT DISTINCT pays FROM public.zones ORDER BY pays",
    levels:
      "SELECT niveau_min::text,niveau_ideal::text,count(*) FROM public.spots GROUP BY 1,2 ORDER BY 1,2",
    transfers: "SELECT DISTINCT transfert FROM public.zones ORDER BY transfert",
    samples:
      "SELECT zone_id,nom,pays,code_aeroport,aeroport,transfert FROM public.zones ORDER BY zone_id LIMIT 8",
    invalidLevels:
      "SELECT spot_id,nom,zone_id,niveau_min::text,niveau_ideal::text FROM public.spots WHERE niveau_min IS NULL OR niveau_min::text NOT IN ('debutant','intermediaire','expert') OR (niveau_ideal IS NOT NULL AND niveau_ideal::text NOT IN ('debutant','intermediaire','expert')) ORDER BY spot_id",
    missingSeasons:
      "SELECT spot_id,zone_id,mois_debut,mois_fin FROM public.spots WHERE mois_debut IS NULL OR mois_fin IS NULL OR mois_debut NOT BETWEEN 1 AND 12 OR mois_fin NOT BETWEEN 1 AND 12 ORDER BY spot_id",
    security:
      "SELECT c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('zones','spots')",
    policies:
      "SELECT tablename,policyname,roles,cmd FROM pg_policies WHERE schemaname='public' AND tablename IN ('zones','spots')",
  };
  for (const [name, sql] of Object.entries(queries))
    console.log(name, JSON.stringify(await readQuery(sql)));
} catch {
  console.error(
    "Inspection indisponible. Vérifier la connexion et les droits de lecture.",
  );
  process.exitCode = 1;
}
