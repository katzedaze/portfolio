import "dotenv/config";
import * as schema from "./schema";

// DATABASE_URLにlocalhostが含まれているかで判定（より確実）
const isDevelopment =
  process.env.DATABASE_URL?.includes("localhost") ||
  process.env.NODE_ENV === "development";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any;

if (isDevelopment) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/node-postgres");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  db = drizzle({ client: pool, schema });
} else {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/neon-http");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require("@neondatabase/serverless");

  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle({ client: sql, schema });
}

export { db };
