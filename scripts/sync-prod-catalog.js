#!/usr/bin/env node

/**
 * Script to sync and backup the latest catalog from Live Production to local data/catalog.json
 * Usage:
 *   node scripts/sync-prod-catalog.js [OPTIONAL_ADMIN_KEY]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROD_URL = process.env.PROD_URL || 'https://styleadvisor.online';
const ADMIN_KEY = process.argv[2] || process.env.ADMIN_INGEST_API_KEY || '7ca3a173a23c54847eb5907cbe44aa1b';
const CATALOG_PATH = path.join(process.cwd(), 'data', 'catalog.json');

console.log(`🌐 Fetching latest catalog from: ${PROD_URL}/api/admin/catalog ...`);

const endpoint = `${PROD_URL}/api/admin/catalog`;

const req = https.get(
  endpoint,
  {
    headers: {
      Authorization: `Bearer ${ADMIN_KEY}`,
      'x-api-key': ADMIN_KEY,
    },
  },
  (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode !== 200) {
        console.error(`❌ Failed to fetch catalog! HTTP Status: ${res.statusCode}`);
        console.error(`Response: ${data}`);
        process.exit(1);
      }

      try {
        const json = JSON.parse(data);
        if (!json.success || !Array.isArray(json.data)) {
          console.error(`❌ Unexpected response format:`, json);
          process.exit(1);
        }

        const items = json.data;
        fs.writeFileSync(CATALOG_PATH, JSON.stringify(items, null, 2), 'utf-8');
        console.log(`✅ Success! Synced ${items.length} items from Production to data/catalog.json`);
      } catch (err) {
        console.error(`❌ Error parsing JSON response:`, err.message);
        process.exit(1);
      }
    });
  }
);

req.on('error', (err) => {
  console.error(`❌ Network error:`, err.message);
  process.exit(1);
});
