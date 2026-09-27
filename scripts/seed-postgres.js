#!/usr/bin/env node

/**
 * Migration Script: Seed all items from data/catalog.json into Postgres database
 * Usage (Inside Docker):
 *   node scripts/seed-postgres.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: POSTGRES_URL or PRISMA_DATABASE_URL is not set in environment.');
  process.exit(1);
}

const catalogPath = path.join(__dirname, '..', 'data', 'catalog.json');
if (!fs.existsSync(catalogPath)) {
  console.error('❌ Error: data/catalog.json not found.');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
console.log(`📦 Found ${catalog.length} items in local data/catalog.json`);

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to Postgres Database successfully.');

    // 1. Create table if not exists
    console.log('🛠️ Creating garments table if not exists...');
    await client.query(`
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
    `);

    console.log(`🚀 Migrating and upserting ${catalog.length} garments into Postgres...`);

    let count = 0;
    for (const item of catalog) {
      const id = item.id || item.garment_id;
      const name = item.name;
      const brand = item.brand || 'Canadian Brand';
      const slot = item.slot || 'top';
      const price = Number(item.price || item.price_cad || 95);
      const currency = item.currency || 'CAD';
      const product_url = item.product_url || '';
      const image_url = item.image_url || '';
      const gender_cut = item.gender_cut ? (Array.isArray(item.gender_cut) ? item.gender_cut[0] : item.gender_cut) : 'unisex';
      const budget_tier = item.budget_tier || 'mid';
      const occasions = JSON.stringify(item.occasions || ['work', 'casual']);
      const palette_seasons = JSON.stringify(item.palette_seasons || ['autumn', 'winter']);
      const body_types = JSON.stringify(item.body_types || ['average']);
      const season_of_wear = JSON.stringify(item.season_of_wear || ['all-season']);
      const formality_score = Number(item.formality_score || 6);
      const color = item.color || 'Classic';
      const hex_color = item.hex_color || '#2C2C2C';
      const fabric = JSON.stringify(typeof item.fabric === 'object' ? item.fabric : { composition: String(item.fabric || '100% Quality Fabric') });
      const return_policy = JSON.stringify(typeof item.return_policy === 'object' ? item.return_policy : { window_days: 30, free_returns: true });
      const description = item.description || '';
      const styling_notes = item.styling_notes || '';
      const in_stock = item.in_stock !== undefined ? Boolean(item.in_stock) : true;
      const verified_date = item.verified_date || '2026-09-26';

      await client.query(`
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
          updated_at = CURRENT_TIMESTAMP
      `, [
        id, name, brand, slot, price, currency, product_url, image_url,
        gender_cut, budget_tier, occasions, palette_seasons, body_types,
        season_of_wear, formality_score, color, hex_color, fabric,
        return_policy, description, styling_notes, in_stock, verified_date
      ]);

      count++;
    }

    const checkRes = await client.query('SELECT COUNT(*) FROM garments');
    console.log(`✅ Success! Total garments now in Postgres: ${checkRes.rows[0].count}`);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
