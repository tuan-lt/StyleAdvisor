import { Pool } from "pg";
import { Garment } from "../types/catalog";

const connectionString = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(connectionString);
}

/**
 * Auto-initialize database schema if not exists
 */
export async function initDatabaseSchema(): Promise<void> {
  const db = getDbPool();
  if (!db) return;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS garments (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      slot VARCHAR(50) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'CAD',
      product_url TEXT,
      image_url TEXT,
      gender_cut VARCHAR(50) DEFAULT 'unisex',
      budget_tier VARCHAR(50) DEFAULT 'mid',
      occasions JSONB DEFAULT '["work", "casual", "smart-casual"]'::jsonb,
      palette_seasons JSONB DEFAULT '["autumn", "winter"]'::jsonb,
      body_types JSONB DEFAULT '["average", "athletic"]'::jsonb,
      season_of_wear JSONB DEFAULT '["all-season", "fall"]'::jsonb,
      formality_score SMALLINT DEFAULT 6,
      color VARCHAR(100) DEFAULT 'Classic',
      hex_color VARCHAR(20) DEFAULT '#2C2C2C',
      fabric JSONB DEFAULT '{"composition": "Premium Canadian Fabric Blend", "care": "Machine wash cold"}'::jsonb,
      return_policy JSONB DEFAULT '{"window_days": 30, "free_returns": true}'::jsonb,
      description TEXT,
      styling_notes TEXT,
      in_stock BOOLEAN DEFAULT true,
      verified_date VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_garments_slot ON garments(slot);
    CREATE INDEX IF NOT EXISTS idx_garments_brand ON garments(brand);
  `;

  await db.query(createTableQuery);
}

/**
 * Fetch all garments from Postgres database
 */
export async function getAllGarmentsFromDb(): Promise<Garment[]> {
  const db = getDbPool();
  if (!db) return [];

  const res = await db.query(
    `SELECT * FROM garments ORDER BY created_at DESC`
  );

  return res.rows.map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    slot: row.slot,
    price: Number(row.price),
    currency: row.currency || "CAD",
    product_url: row.product_url,
    image_url: row.image_url,
    gender_cut: row.gender_cut,
    budget_tier: row.budget_tier,
    occasions: typeof row.occasions === "string" ? JSON.parse(row.occasions) : row.occasions,
    palette_seasons: typeof row.palette_seasons === "string" ? JSON.parse(row.palette_seasons) : row.palette_seasons,
    body_types: typeof row.body_types === "string" ? JSON.parse(row.body_types) : row.body_types,
    season_of_wear: typeof row.season_of_wear === "string" ? JSON.parse(row.season_of_wear) : row.season_of_wear,
    formality_score: Number(row.formality_score),
    color: row.color,
    hex_color: row.hex_color,
    fabric: typeof row.fabric === "string" ? JSON.parse(row.fabric) : row.fabric,
    return_policy: typeof row.return_policy === "string" ? JSON.parse(row.return_policy) : row.return_policy,
    description: row.description,
    styling_notes: row.styling_notes,
    in_stock: Boolean(row.in_stock),
    verified_date: row.verified_date,
  }));
}

/**
 * Upsert garment into Postgres database
 */
export async function upsertGarmentToDb(garment: Garment): Promise<void> {
  const db = getDbPool();
  if (!db) return;

  const upsertQuery = `
    INSERT INTO garments (
      id, name, brand, slot, price, currency, product_url, image_url,
      gender_cut, budget_tier, occasions, palette_seasons, body_types,
      season_of_wear, formality_score, color, hex_color, fabric,
      return_policy, description, styling_notes, in_stock, verified_date, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23, CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      brand = EXCLUDED.brand,
      slot = EXCLUDED.slot,
      price = EXCLUDED.price,
      currency = EXCLUDED.currency,
      product_url = EXCLUDED.product_url,
      image_url = EXCLUDED.image_url,
      gender_cut = EXCLUDED.gender_cut,
      budget_tier = EXCLUDED.budget_tier,
      occasions = EXCLUDED.occasions,
      palette_seasons = EXCLUDED.palette_seasons,
      body_types = EXCLUDED.body_types,
      season_of_wear = EXCLUDED.season_of_wear,
      formality_score = EXCLUDED.formality_score,
      color = EXCLUDED.color,
      hex_color = EXCLUDED.hex_color,
      fabric = EXCLUDED.fabric,
      return_policy = EXCLUDED.return_policy,
      description = EXCLUDED.description,
      styling_notes = EXCLUDED.styling_notes,
      in_stock = EXCLUDED.in_stock,
      verified_date = EXCLUDED.verified_date,
      updated_at = CURRENT_TIMESTAMP;
  `;

  await db.query(upsertQuery, [
    garment.id,
    garment.name,
    garment.brand,
    garment.slot,
    garment.price,
    garment.currency || "CAD",
    garment.product_url,
    garment.image_url,
    garment.gender_cut,
    garment.budget_tier,
    JSON.stringify(garment.occasions || []),
    JSON.stringify(garment.palette_seasons || []),
    JSON.stringify(garment.body_types || []),
    JSON.stringify(garment.season_of_wear || []),
    garment.formality_score || 6,
    garment.color || "Classic",
    garment.hex_color || "#2C2C2C",
    JSON.stringify(garment.fabric || {}),
    JSON.stringify(garment.return_policy || {}),
    garment.description || "",
    garment.styling_notes || "",
    garment.in_stock !== undefined ? garment.in_stock : true,
    garment.verified_date || new Date().toISOString().split("T")[0],
  ]);
}

/**
 * Delete garment by ID from Postgres database
 */
export async function deleteGarmentFromDb(id: string): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  const res = await db.query(`DELETE FROM garments WHERE id = $1`, [id]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Generates an executable PostgreSQL SQL backup dump for all garments
 */
export function generateSqlDump(garments: Garment[]): string {
  function escapeSql(val: any): string {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number") return String(val);
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "object") {
      const jsonStr = JSON.stringify(val);
      return `'${jsonStr.replace(/'/g, "''")}'::jsonb`;
    }
    const str = String(val);
    return `'${str.replace(/'/g, "''")}'`;
  }

  const lines: string[] = [];
  lines.push("-- Style Advisor PostgreSQL Database Backup");
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Total Records: ${garments.length}`);
  lines.push("");
  lines.push("BEGIN;");
  lines.push("");
  lines.push(`CREATE TABLE IF NOT EXISTS garments (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  slot VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CAD',
  product_url TEXT,
  image_url TEXT,
  gender_cut VARCHAR(50) DEFAULT 'unisex',
  budget_tier VARCHAR(50) DEFAULT 'mid',
  occasions JSONB DEFAULT '["work", "casual", "smart-casual"]'::jsonb,
  palette_seasons JSONB DEFAULT '["autumn", "winter"]'::jsonb,
  body_types JSONB DEFAULT '["average", "athletic"]'::jsonb,
  season_of_wear JSONB DEFAULT '["all-season", "fall"]'::jsonb,
  formality_score SMALLINT DEFAULT 6,
  color VARCHAR(100) DEFAULT 'Classic',
  hex_color VARCHAR(20) DEFAULT '#2C2C2C',
  fabric JSONB DEFAULT '{"composition": "Premium Canadian Fabric Blend", "care": "Machine wash cold"}'::jsonb,
  return_policy JSONB DEFAULT '{"window_days": 30, "free_returns": true}'::jsonb,
  description TEXT,
  styling_notes TEXT,
  in_stock BOOLEAN DEFAULT true,
  verified_date VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_garments_slot ON garments(slot);
CREATE INDEX IF NOT EXISTS idx_garments_brand ON garments(brand);
`);

  for (const g of garments) {
    lines.push(`INSERT INTO garments (
  id, name, brand, slot, price, currency, product_url, image_url,
  gender_cut, budget_tier, occasions, palette_seasons, body_types,
  season_of_wear, formality_score, color, hex_color, fabric,
  return_policy, description, styling_notes, in_stock, verified_date, updated_at
) VALUES (
  ${escapeSql(g.id)},
  ${escapeSql(g.name)},
  ${escapeSql(g.brand)},
  ${escapeSql(g.slot)},
  ${escapeSql(g.price)},
  ${escapeSql(g.currency || "CAD")},
  ${escapeSql(g.product_url)},
  ${escapeSql(g.image_url)},
  ${escapeSql(g.gender_cut || "unisex")},
  ${escapeSql(g.budget_tier || "mid")},
  ${escapeSql(g.occasions || [])},
  ${escapeSql(g.palette_seasons || [])},
  ${escapeSql(g.body_types || [])},
  ${escapeSql(g.season_of_wear || [])},
  ${escapeSql(g.formality_score || 6)},
  ${escapeSql(g.color || "Classic")},
  ${escapeSql(g.hex_color || "#2C2C2C")},
  ${escapeSql(g.fabric || {})},
  ${escapeSql(g.return_policy || {})},
  ${escapeSql(g.description || "")},
  ${escapeSql(g.styling_notes || "")},
  ${escapeSql(g.in_stock !== undefined ? g.in_stock : true)},
  ${escapeSql(g.verified_date || new Date().toISOString().split("T")[0])},
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  slot = EXCLUDED.slot,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  product_url = EXCLUDED.product_url,
  image_url = EXCLUDED.image_url,
  gender_cut = EXCLUDED.gender_cut,
  budget_tier = EXCLUDED.budget_tier,
  occasions = EXCLUDED.occasions,
  palette_seasons = EXCLUDED.palette_seasons,
  body_types = EXCLUDED.body_types,
  season_of_wear = EXCLUDED.season_of_wear,
  formality_score = EXCLUDED.formality_score,
  color = EXCLUDED.color,
  hex_color = EXCLUDED.hex_color,
  fabric = EXCLUDED.fabric,
  return_policy = EXCLUDED.return_policy,
  description = EXCLUDED.description,
  styling_notes = EXCLUDED.styling_notes,
  in_stock = EXCLUDED.in_stock,
  verified_date = EXCLUDED.verified_date,
  updated_at = CURRENT_TIMESTAMP;
`);
  }

  lines.push("COMMIT;");
  return lines.join("\n");
}

/**
 * Execute raw SQL script (used for database restore)
 */
export async function executeRawSql(sqlScript: string): Promise<void> {
  const db = getDbPool();
  if (!db) throw new Error("Database is not connected.");
  await db.query(sqlScript);
}
