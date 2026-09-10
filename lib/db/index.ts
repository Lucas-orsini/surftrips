import "server-only";
import { Pool, type QueryResultRow } from "pg";
import { SUPABASE_CA } from "./supabase-ca.ts";

const globalDb = globalThis as typeof globalThis & { surfPool?: Pool };

function getPool() {
  if (globalDb.surfPool) return globalDb.surfPool;
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) throw new Error("DATABASE_NOT_CONFIGURED");
  const url = new URL(connectionString);
  // TLS is always verified, including when a supplied URL requests weaker SSL.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
    url.searchParams.delete(key);
  const pool = new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: true, ca: SUPABASE_CA },
    max: 2,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 8_000,
    query_timeout: 10_000,
    allowExitOnIdle: true,
  });
  pool.on("error", () => console.error("[database] Connexion indisponible."));
  globalDb.surfPool = pool;
  return pool;
}

/** Read-only transactions also work through the Supabase transaction pooler. */
export async function readQuery<T extends QueryResultRow>(
  sql: string,
  values: unknown[] = [],
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout = '8s'");
    const result = await client.query<T>(sql, values);
    await client.query("COMMIT");
    return result.rows;
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    throw new Error("DATABASE_UNAVAILABLE");
  } finally {
    client.release();
  }
}
