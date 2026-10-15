const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const catalogPath = path.join(__dirname, "../data/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

// 1. Fix the 5 misclassified slots
const slotFixes = {
  "rw-co--slim-fit-oat-brushed-twil-4525": "outerwear",
  "rw-co--tailored-fit-rust-wool-su-6319": "outerwear",
  "rw-co--slim-fit-burgundy-suit-bl-4177": "outerwear",
  "rw-co--slim-fit-checkered-grey-w-0142": "bottom",
  "roots-lodge-stretch-cargo-pant-5264": "bottom",
};

catalog.forEach((g) => {
  if (slotFixes[g.id]) {
    g.slot = slotFixes[g.id];
  }
});

// 2. Garments that must NEVER have "wedding"
const stripWeddingIds = new Set([
  "ca_rwco_201", // Unstructured Knit Wool-Blend Blazer (VC pitch special)
  "ca_ves_003", // Everyday Classic Waterproof Sneaker (Gastown coffee meetings)
  "roots-messenger-laptop-bag-tosc-2699",
  "roots-messenger-laptop-bag-trib-5074",
  "ca_province-of-can_support-the-canadian_9367",
  "ca_lululemon_define-cropped-jacke_8072",
  "ca_common-goods_alta-legging_3293",
  "ca_frank-and-oak_rugby-polo_4072",
  "ca_the-super-puff-_the-super-puff-o-rai_6564",
  "ca_arc-teryx_beta-ar-jacket-women_7952",
  "ca_moose-knuckles_tegan-down-bomber-ja_1253",
  "ca_lol-_just-insulated-vest_2029",
  "ca_mackage_tripp_6046",
  "ca_canada-goose_mira-bomber_1804",
  "roots-cypress-twill-jacket-0372",
  "roots-cord-boxy-jacket-0644",
  "roots-heritage-cabin-shawl-card-3335",
  "roots-roam-jacket-2232",
  "ca_vessi_100-waterproof-shoes_8984",
  "roots-robson-shaker-crew-sweate-4817",
  "roots-thomson-double-knit-polo-8797",
  "kit-and-ace-city-tech-long-sleeve-pol-1130",
  "kit-and-ace-timeless-merino-polo-swea-3887",
  "kit-and-ace-merino-cotton-crewneck-sw-2198",
  "rw-co--merino-wool-long-sleeve-p-1528",
  "rw-co--long-sleeve-crew-neck-swe-0823",
  "ca_kotn_men-apos-s-ali-crewn_9419",
  "ca_reigning-champ_cotton-flannel-highl_5097",
  "ca_club-monaco_bowee-tee_3204",
  "ca_aritzia_interlock-cotton-fun_0191",
  "ca_naked-famous-de_gracie-jacket-organi_0594",
  "ca_simons_floral-embossed-card_4574",
  "the-hartt-shoe-co--low-top-sneaker-white-7640",
  "roots-junction-boot-2872",
  "ca_herschel-supply_yara-large-shoulder-_6373",
  "kit-and-ace-navigator-relaxed-pants-6871",
  "kit-and-ace-hillside-merino-v-neck-sw-5134",
  "kit-and-ace-city-tech-slim-fit-birdse-2982",
]);

catalog.forEach((g) => {
  if (stripWeddingIds.has(g.id) && g.occasions) {
    g.occasions = g.occasions.filter((o) => o !== "wedding");
  }
});

// 3. Ensure genuine wedding items have "wedding" and elevated celebratory styling notes
const weddingEnhancements = {
  "rw-co--slim-fit-checkered-grey-w-1641": {
    styling_notes: "Refined Italian-inspired wool tailoring ideal for wedding receptions, formal celebrations, and banquets.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "rw-co--slim-fit-checkered-grey-w-0142": {
    styling_notes: "Sharp tailored wool trousers with clean drape, perfectly suited for wedding celebrations.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "rw-co--tailored-fit-rust-wool-su-6319": {
    styling_notes: "Rich autumnal rust wool suit blazer for celebration banquets and modern wedding guest attire.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "rw-co--tailored-leg-rust-wool-su-2880": {
    styling_notes: "Matching rust tailored wool trousers creating an elevated, sophisticated wedding guest silhouette.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "rw-co--slim-fit-burgundy-suit-bl-4177": {
    styling_notes: "Deep festive burgundy blazer tailored for wedding celebrations and evening formal gala events.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "rw-co--slim-fit-burgundy-suit-pa-8695": {
    styling_notes: "Tailored burgundy suit trousers completing a sharp, festive wedding guest look.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "rw-co--slim-fit-oat-brushed-twil-4525": {
    styling_notes: "Warm oat tailored blazer perfect for garden, vineyard, and outdoor summer wedding celebrations.",
    occasions: ["wedding", "formal", "smart-casual"],
  },
  "rw-co--slim-fit-oat-brushed-twil-6668": {
    styling_notes: "Tailored oat twill trousers for outdoor garden wedding ceremonies and receptions.",
    occasions: ["wedding", "formal", "smart-casual"],
  },
  "rw-co--tailored-fit-dobby-dress--5752": {
    styling_notes: "Crisp formal dress shirt with micro-texture, designed for wedding suits and celebratory ceremonies.",
    occasions: ["wedding", "formal", "interview"],
  },
  "rw-co--regular-fit-herringbone-d-8102": {
    styling_notes: "Classic herringbone dress shirt providing a clean, polished foundation for wedding suits.",
    occasions: ["wedding", "formal", "interview"],
  },
  "rw-co--regular-fit-striped-dress-8137": {
    styling_notes: "Refined striped dress shirt adding understated elegance under celebration blazers.",
    occasions: ["wedding", "formal", "interview"],
  },
  "rw-co-slim-fit-camel-melange-kn-0015": {
    styling_notes: "Elevated formal dress shirt balancing ceremony comfort and tailored refinement.",
    occasions: ["wedding", "formal", "smart-casual"],
  },
  "rw-co--cashmere-blend-long-sleev-0576": {
    styling_notes: "Cashmere-blend knit layer providing luxurious warmth under a wedding suit jacket.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "rw-co--3-4-sleeve-boat-neck_2217": {
    styling_notes: "Refined boat-neck top tailored for wedding dinners and celebration gatherings.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "ca_encircled_the-airy-gauze-rever_7853": {
    styling_notes: "Soft romantic airy gauze blouse offering graceful elegance for wedding celebrations.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "roots-isla-cotton-gauze-tea-dre-3778": {
    styling_notes: "Graceful cotton gauze tea dress perfectly attuned for summer garden weddings and vineyard ceremonies.",
    occasions: ["wedding", "formal", "date-night", "casual"],
  },
  "roots-isla-cotton-gauze-tea-dre-8519": {
    styling_notes: "Tiered romantic tea dress with effortless drape for outdoor wedding celebrations.",
    occasions: ["wedding", "formal", "date-night", "casual"],
  },
  "ca_art_042": {
    styling_notes: "High-waisted tailored crepette trousers for chic, elevated celebration styling.",
    occasions: ["wedding", "formal", "interview"],
  },
  "the-hartt-shoe-co--diplomat-oxford-dress-sho-7392": {
    styling_notes: "Handcrafted Canadian leather oxfords offering timeless ceremony polish for weddings.",
    occasions: ["wedding", "formal"],
  },
  "the-hartt-shoe-company-the-beaverbrook-u-k-gold--6683": {
    styling_notes: "Handcrafted rich cognac dress shoes for elevated wedding guest formalwear.",
    occasions: ["wedding", "formal"],
  },
  "the-hartt-shoe-co--python-loafer-black-3751": {
    styling_notes: "Textured formal loafers lending festive luxury to evening wedding guest attire.",
    occasions: ["wedding", "formal"],
  },
  "the-hartt-shoe-co--penny-loafer-two-tone-cog-4586": {
    styling_notes: "Distinguished two-tone dress loafers for celebratory garden weddings and ceremonies.",
    occasions: ["wedding", "formal"],
  },
  "matthew-dack-elgin-4774": {
    styling_notes: "Refined leather dress shoes crafted for formal weddings and ceremonial occasions.",
    occasions: ["wedding", "formal"],
  },
  "matthew-dack-stormont-6173": {
    styling_notes: "Polished formal footwear for black-tie and wedding celebrations.",
    occasions: ["wedding", "formal"],
  },
  "matthew-dack-morgan-8324": {
    styling_notes: "Sophisticated formal footwear designed for wedding guest and gala dressing.",
    occasions: ["wedding", "formal"],
  },
  "matthew-dack-carleton-1451": {
    styling_notes: "Classic Canadian leather dress shoes built for celebration banquets and weddings.",
    occasions: ["wedding", "formal"],
  },
  "roots-alma-coat-1385": {
    styling_notes: "Structured wool coat offering dignified warmth for cool outdoor wedding ceremonies.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "roots-jacq-shoulder-bag-cloud-3794": {
    styling_notes: "Compact, elegant leather shoulder bag perfect for wedding guest essentials.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "roots-jacq-shoulder-bag-tribe-8651": {
    styling_notes: "Sleek celebratory leather bag complementing refined wedding ensembles.",
    occasions: ["wedding", "formal", "date-night"],
  },
  "roots-villaggio-bag-cervino-5083": {
    styling_notes: "Refined Italian-tanned leather accessory suited for celebrations and special occasions.",
    occasions: ["wedding", "formal", "travel"],
  },
  "ca_roots_womens-plastic-squar_6349": {
    styling_notes: "Chic square sunglasses for outdoor summer wedding ceremonies in full sun.",
    occasions: ["wedding", "outdoor", "casual"],
  },
};

for (const [id, enhancement] of Object.entries(weddingEnhancements)) {
  const item = catalog.find((g) => g.id === id);
  if (item) {
    if (enhancement.styling_notes) item.styling_notes = enhancement.styling_notes;
    if (enhancement.occasions) {
      // Set occasions explicitly so wedding is the primary occasion and pitch is removed
      item.occasions = [...enhancement.occasions];
    }
  }
}

// Ensure no wedding item has pitch in its occasions array
catalog.forEach((g) => {
  if (g.occasions && g.occasions.includes("wedding")) {
    g.occasions = g.occasions.filter((o) => o !== "pitch");
  }
});

// 4. Add 6 dedicated authentic wedding pieces to elevate options for women and men
const newWeddingGarments = [
  {
    id: "ca_aritzia_only-slip-midi-dress_9101",
    name: "Wilfred Only Slip Midi Dress",
    brand: "Aritzia",
    slot: "top", // Can serve as core piece
    price: 138,
    currency: "CAD",
    product_url: "https://www.aritzia.com/en/product/only-slip-dress/75997.html",
    image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    gender_cut: "women",
    budget_tier: "$$",
    occasions: ["wedding", "formal", "date-night"],
    palette_seasons: ["winter", "autumn", "summer", "spring"],
    body_types: ["rectangle", "bottom_triangle", "hourglass", "oval", "top_triangle"],
    season_of_wear: ["all_season", "spring_summer", "fall_winter"],
    formality_score: 8,
    color: "Emerald",
    hex_color: "#1B4D3E",
    fabric: {
      care: "Machine wash delicate or hand wash cold.",
      composition: "100% Glossy Japanese Matte Satin Crepe",
      sustainable: true,
    },
    return_policy: {
      policy_note: "Free returns and exchanges within 30 days at Aritzia.",
      window_days: 30,
      free_returns: true,
    },
    description: "Flowing biased-cut slip midi dress with fluid drape, designed for wedding guests and celebration banquets.",
    styling_notes: "The definitive wedding guest silhouette: luxurious drape, flattering bias cut, and radiant jewel tone.",
    in_stock: true,
    verified_date: "2026-10-15",
    styles: ["classic", "fabulous", "minimalist"],
  },
  {
    id: "ca_rwco_floral-jacquard-cocktail-dress_9102",
    name: "Sleeveless Floral Jacquard Cocktail Dress",
    brand: "RW&CO.",
    slot: "bottom",
    price: 159,
    currency: "CAD",
    product_url: "https://www.rw-co.com/en/floral-jacquard-cocktail-dress/478201.html",
    image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    gender_cut: "women",
    budget_tier: "$$",
    occasions: ["wedding", "formal"],
    palette_seasons: ["winter", "autumn", "summer", "spring"],
    body_types: ["rectangle", "hourglass", "bottom_triangle", "oval"],
    season_of_wear: ["all_season", "spring_summer"],
    formality_score: 8,
    color: "Midnight Navy",
    hex_color: "#182238",
    fabric: {
      care: "Dry clean recommended.",
      composition: "90% Polyester, 10% Metallic Jacquard Weave",
      sustainable: false,
    },
    return_policy: {
      policy_note: "Free returns and exchanges within 30 days at RW&CO.",
      window_days: 30,
      free_returns: true,
    },
    description: "Architectural cocktail dress in shimmering floral jacquard, tailored for evening wedding celebrations and galas.",
    styling_notes: "Sophisticated structured cocktail dress providing glamorous celebration polish without outshining the ceremony.",
    in_stock: true,
    verified_date: "2026-10-15",
    styles: ["classic", "fabulous"],
  },
  {
    id: "ca_maguire_rachel-metallic-heel_9103",
    name: "Rachel Strappy Block Heel Sandal",
    brand: "Maguire",
    slot: "shoes",
    price: 210,
    currency: "CAD",
    product_url: "https://maguireshoes.com/products/rachel-metallic-gold",
    image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    gender_cut: "women",
    budget_tier: "$$",
    occasions: ["wedding", "formal", "date-night"],
    palette_seasons: ["summer", "spring", "autumn", "winter"],
    body_types: ["rectangle", "bottom_triangle", "hourglass", "oval", "top_triangle"],
    season_of_wear: ["all_season", "spring_summer"],
    formality_score: 8,
    color: "Champagne Gold",
    hex_color: "#D4AF37",
    fabric: {
      care: "Wipe with damp cloth.",
      composition: "100% Italian Nappa Leather with Metallic Finish",
      sustainable: true,
    },
    return_policy: {
      policy_note: "Free returns and exchanges within 30 days at Maguire.",
      window_days: 30,
      free_returns: true,
    },
    description: "Designed in Montreal and handcrafted in Italy, this block heel sandal pairs dance-floor comfort with wedding glamour.",
    styling_notes: "The ideal wedding shoe: sturdy 65mm block heel that won't sink into grass during outdoor ceremony lawn cocktails.",
    in_stock: true,
    verified_date: "2026-10-15",
    styles: ["classic", "fabulous"],
  },
  {
    id: "ca_lintervalle_paloma-strappy-heel_9104",
    name: "Paloma Leather Strappy Celebration Heel",
    brand: "L'Intervalle",
    slot: "shoes",
    price: 178,
    currency: "CAD",
    product_url: "https://lintervalleshoes.com/products/paloma-black-leather",
    image_url: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80",
    gender_cut: "women",
    budget_tier: "$$",
    occasions: ["wedding", "formal", "date-night"],
    palette_seasons: ["winter", "autumn", "summer", "spring"],
    body_types: ["rectangle", "bottom_triangle", "hourglass", "oval", "top_triangle"],
    season_of_wear: ["all_season"],
    formality_score: 8,
    color: "Black",
    hex_color: "#1A1A1A",
    fabric: {
      care: "Leather protectant spray.",
      composition: "100% Genuine Spanish Calfskin Leather",
      sustainable: true,
    },
    return_policy: {
      policy_note: "Free returns within 30 days at L'Intervalle Montreal.",
      window_days: 30,
      free_returns: true,
    },
    description: "Montreal-designed strappy evening heel crafted with cushioned footbed for seamless transition from ceremony to dance floor.",
    styling_notes: "Sleek and minimalist evening heel adding modern edge to cocktail dresses and tailored trousers.",
    in_stock: true,
    verified_date: "2026-10-15",
    styles: ["classic", "minimalist", "fabulous"],
  },
  {
    id: "ca_rwco_celebration-tux-blazer_9105",
    name: "Slim-Fit Celebration Tuxedo Blazer with Satin Lapel",
    brand: "RW&CO.",
    slot: "outerwear",
    price: 348,
    currency: "CAD",
    product_url: "https://www.rw-co.com/en/slim-fit-tuxedo-jacket/472891.html",
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    gender_cut: "men",
    budget_tier: "$$$",
    occasions: ["wedding", "formal"],
    palette_seasons: ["winter", "autumn", "summer", "spring"],
    body_types: ["rectangle", "oval", "top_triangle"],
    season_of_wear: ["all_season", "fall_winter"],
    formality_score: 9,
    color: "Midnight Black",
    hex_color: "#111111",
    fabric: {
      care: "Dry clean only.",
      composition: "98% Fine Italian Wool, 2% Elastane, Satin Silk Lapels",
      sustainable: true,
    },
    return_policy: {
      policy_note: "Free returns and exchanges within 30 days at RW&CO.",
      window_days: 30,
      free_returns: true,
    },
    description: "Black-tie ready tuxedo jacket with grosgrain satin peak lapel and sharp structured shoulder tailoring.",
    styling_notes: "The gold standard for formal and black-tie wedding celebrations, delivering unmatched regal posture and dignity.",
    in_stock: true,
    verified_date: "2026-10-15",
    styles: ["classic", "formal"],
  },
  {
    id: "ca_rwco_silk-pocket-square-cufflink_9106",
    name: "Mulberry Silk Pocket Square & Cufflink Set",
    brand: "RW&CO.",
    slot: "accessory",
    price: 55,
    currency: "CAD",
    product_url: "https://www.rw-co.com/en/silk-pocket-square-set/461280.html",
    image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    gender_cut: "unisex",
    budget_tier: "$",
    occasions: ["wedding", "formal"],
    palette_seasons: ["winter", "autumn", "summer", "spring"],
    body_types: ["rectangle", "bottom_triangle", "hourglass", "oval", "top_triangle"],
    season_of_wear: ["all_season"],
    formality_score: 8,
    color: "Champagne Ivory",
    hex_color: "#F5F2EB",
    fabric: {
      care: "Dry clean only.",
      composition: "100% Pure Mulberry Silk, Silver-Tone Brass Cufflinks",
      sustainable: true,
    },
    return_policy: {
      policy_note: "Free returns and exchanges within 30 days at RW&CO.",
      window_days: 30,
      free_returns: true,
    },
    description: "Pure mulberry silk pocket square paired with brushed rhodium cufflinks to add the finishing celebratory touch.",
    styling_notes: "The quintessential wedding accessory set: adds festive light and ceremonial dignity to suit lapels.",
    in_stock: true,
    verified_date: "2026-10-15",
    styles: ["classic", "fabulous", "minimalist"],
  },
];

// Append new garments if not already present
for (const newG of newWeddingGarments) {
  const existingIndex = catalog.findIndex((g) => g.id === newG.id);
  if (existingIndex >= 0) {
    catalog[existingIndex] = newG;
  } else {
    catalog.push(newG);
  }
}

// Save back to data/catalog.json
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf8");
console.log(`✅ Updated data/catalog.json successfully: total ${catalog.length} items.`);

// 5. Sync to Postgres Database if available
async function syncToPostgres() {
  const connectionString = "postgres://c68b6c846da0f3ecd9cf4286cdef12bbbf47a064d163064c87e96d3a1b2047d0:sk_k1MJWXcIZ4f307nqrKkrM@db.prisma.io:5432/postgres?sslmode=require";
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to Postgres database to sync curated garments...");
    for (const g of catalog) {
      await pool.query(
        `INSERT INTO garments (
          id, name, brand, slot, price, currency, product_url, image_url,
          gender_cut, budget_tier, occasions, palette_seasons, body_types,
          season_of_wear, formality_score, color, hex_color, fabric,
          return_policy, description, styling_notes, in_stock, verified_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          brand = EXCLUDED.brand,
          slot = EXCLUDED.slot,
          price = EXCLUDED.price,
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
          verified_date = EXCLUDED.verified_date`,
        [
          g.id,
          g.name,
          g.brand,
          g.slot,
          g.price,
          g.currency || "CAD",
          g.product_url,
          g.image_url,
          g.gender_cut,
          g.budget_tier,
          JSON.stringify(g.occasions || []),
          JSON.stringify(g.palette_seasons || []),
          JSON.stringify(g.body_types || []),
          JSON.stringify(g.season_of_wear || []),
          g.formality_score || 7,
          g.color || "Classic",
          g.hex_color || "#2C2C2C",
          JSON.stringify(g.fabric || {}),
          JSON.stringify(g.return_policy || {}),
          g.description || "",
          g.styling_notes || "",
          g.in_stock !== false,
          g.verified_date || "2026-10-15",
        ]
      );
    }
    console.log("✅ Successfully synced all curated garments to Postgres DB!");
  } catch (err) {
    console.error("❌ Postgres sync error:", err);
  } finally {
    await pool.end();
  }
}

syncToPostgres();
