const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;

if (!connectionString) {
  console.error("❌ POSTGRES_URL environment variable is missing in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

function escapeSql(val) {
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

async function exportBackup() {
  console.log("Connecting to PostgreSQL database...");
  const res = await pool.query("SELECT * FROM garments ORDER BY created_at DESC");
  console.log(`Found ${res.rows.length} garments in database.`);

  const lines = [];
  lines.push("-- ==========================================================");
  lines.push("-- Style Advisor PostgreSQL Database Backup (.sql)");
  lines.push(`-- Exported At: ${new Date().toISOString()}`);
  lines.push(`-- Total Records: ${res.rows.length}`);
  lines.push("-- To restore directly into Postgres: psql $POSTGRES_URL < backup-postgres.sql");
  lines.push("-- ==========================================================");
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

  for (const g of res.rows) {
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
  ${escapeSql(Number(g.price))},
  ${escapeSql(g.currency || "CAD")},
  ${escapeSql(g.product_url)},
  ${escapeSql(g.image_url)},
  ${escapeSql(g.gender_cut || "unisex")},
  ${escapeSql(g.budget_tier || "mid")},
  ${escapeSql(typeof g.occasions === "string" ? JSON.parse(g.occasions) : g.occasions || [])},
  ${escapeSql(typeof g.palette_seasons === "string" ? JSON.parse(g.palette_seasons) : g.palette_seasons || [])},
  ${escapeSql(typeof g.body_types === "string" ? JSON.parse(g.body_types) : g.body_types || [])},
  ${escapeSql(typeof g.season_of_wear === "string" ? JSON.parse(g.season_of_wear) : g.season_of_wear || [])},
  ${escapeSql(g.formality_score || 6)},
  ${escapeSql(g.color || "Classic")},
  ${escapeSql(g.hex_color || "#2C2C2C")},
  ${escapeSql(typeof g.fabric === "string" ? JSON.parse(g.fabric) : g.fabric || {})},
  ${escapeSql(typeof g.return_policy === "string" ? JSON.parse(g.return_policy) : g.return_policy || {})},
  ${escapeSql(g.description || "")},
  ${escapeSql(g.styling_notes || "")},
  ${escapeSql(Boolean(g.in_stock))},
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

  const outputPath = path.join(process.cwd(), "scripts", "backup-postgres.sql");
  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");
  console.log(`✅ Backup successfully created at: ${outputPath}`);
  await pool.end();
}

exportBackup().catch((err) => {
  console.error("❌ Export error:", err);
  process.exit(1);
});
