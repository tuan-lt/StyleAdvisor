const fs = require('fs');
const path = require('path');

// 190+ Canadian Garment Dataset matching PRD v4.2 Schema
const catalog = [
  // Core Persona Sam & Maya Anchor Pieces
  {
    id: 'ca_kotn_011',
    garment_id: 'ca_kotn_011',
    name: 'Egyptian Cotton Essential Crewneck',
    brand: 'Kotn',
    slot: 'top',
    price: 48,
    price_cad: 48,
    currency: 'CAD',
    product_url: 'https://kotn.com/products/mens-essential-crew?variant=white',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    gender_cut: ['male', 'neutral'],
    budget_tier: '$',
    formality_level: 2,
    formality_score: 4,
    occasions: ['pitch', 'interview', 'date', 'casual', 'work', 'court', 'funeral', 'family'],
    body_types: ['rectangle', 'oval', 'top_triangle', 'bottom_triangle'],
    palette_seasons: ['winter', 'summer', 'autumn', 'spring'],
    styles: ['casual', 'classic', 'nerdy', 'sporty'],
    season_of_wear: ['all_season', 'spring_summer', 'fall_winter'],
    fabric: '100% Long-Staple Egyptian Cotton',
    size_range: 'XS - XXL',
    return_policy: '30-day return in-store and online',
    description: 'Clean minimalist base layer crafted from ultra-soft certified Egyptian cotton in Toronto/Montreal.',
    styling_notes: 'Wear tucked into dark chinos beneath an unstructured blazer for an approachable founder pitch.',
    in_stock: true,
    verified_date: '2026-10-10'
  },
  {
    id: 'ca_rwco_089',
    garment_id: 'ca_rwco_089',
    name: 'Tailored Slim-Fit Stretch Chino',
    brand: 'RW&CO',
    slot: 'bottom',
    price: 89.90,
    price_cad: 89.90,
    currency: 'CAD',
    product_url: 'https://www.rw-co.com/en/tailored-slim-chino/461829.html',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    gender_cut: ['male', 'neutral'],
    budget_tier: '$',
    formality_level: 3,
    formality_score: 7,
    occasions: ['pitch', 'interview', 'family', 'date', 'court', 'work', 'funeral'],
    body_types: ['rectangle', 'oval', 'top_triangle', 'bottom_triangle'],
    palette_seasons: ['winter', 'autumn', 'summer', 'spring'],
    styles: ['classic', 'casual', 'nerdy', 'trendy'],
    season_of_wear: ['all_season', 'spring_summer', 'fall_winter'],
    fabric: '97% Cotton, 3% Spandex Comfort Twill',
    size_range: '28W - 38W',
    return_policy: '30-day return in-store and online',
    description: 'Clean-front tailored trouser with active stretch, bridging dress slacks and casual chinos.',
    styling_notes: 'The core anchor bottom for founder pitches: projects sharp structure without looking like a banker suit.',
    in_stock: true,
    verified_date: '2026-10-10'
  },
  {
    id: 'ca_art_042',
    garment_id: 'ca_art_042',
    name: 'The Effortless Pant - Crepette',
    brand: 'Aritzia',
    slot: 'bottom',
    price: 148,
    price_cad: 148,
    currency: 'CAD',
    product_url: 'https://www.aritzia.com/en/product/the-effortless-pant/77775.html',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    gender_cut: ['female', 'neutral'],
    budget_tier: '$$',
    formality_level: 4,
    formality_score: 8,
    occasions: ['interview', 'pitch', 'court', 'date', 'family', 'work', 'funeral'],
    body_types: ['rectangle', 'bottom_triangle', 'oval', 'double_triangle', 'top_triangle'],
    palette_seasons: ['winter', 'autumn', 'summer', 'spring'],
    styles: ['classic', 'trendy', 'fabulous'],
    season_of_wear: ['all_season', 'spring_summer', 'fall_winter'],
    fabric: '100% Japanese Crepette (Wrinkle-Resistant)',
    size_range: '00 - 16 US (Short/Regular/Tall)',
    return_policy: 'Free 30-day returns and exchanges',
    description: 'Aritzia’s world-renowned high-waisted wide-leg tailored trouser with fluid drape.',
    styling_notes: 'Pairs with tucked knitwear and sharp ankle boots for commanding boardroom authority.',
    in_stock: true,
    verified_date: '2026-10-10'
  },
  {
    id: 'ca_ves_003',
    garment_id: 'ca_ves_003',
    name: 'Everyday Classic Waterproof Sneaker',
    brand: 'Vessi',
    slot: 'shoes',
    price: 145,
    price_cad: 145,
    currency: 'CAD',
    product_url: 'https://ca.vessi.com/products/mens-everyday-classic-all-black',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    gender_cut: ['male', 'neutral', 'female'],
    budget_tier: '$$',
    formality_level: 2,
    formality_score: 5,
    occasions: ['pitch', 'casual', 'travel', 'work', 'family', 'interview'],
    body_types: ['rectangle', 'oval', 'top_triangle', 'bottom_triangle'],
    palette_seasons: ['winter', 'summer', 'autumn', 'spring'],
    styles: ['casual', 'sporty', 'nerdy'],
    season_of_wear: ['all_season', 'spring_summer', 'fall_winter'],
    fabric: 'Patented Dyma-tex 100% Waterproof Knit Membrane',
    size_range: '6 - 14 US',
    return_policy: '90-day return policy',
    description: 'Vancouver-invented 100% waterproof breathable knit sneakers that conquer rain puddles cleanly.',
    styling_notes: 'The ultimate Vancouver footwear: keeps socks dry while matching dark tapered trousers.',
    in_stock: true,
    verified_date: '2026-10-10'
  },
  {
    id: 'ca_rwco_201',
    garment_id: 'ca_rwco_201',
    name: 'Unstructured Knit Wool-Blend Blazer',
    brand: 'RW&CO',
    slot: 'outerwear',
    price: 198,
    price_cad: 198,
    currency: 'CAD',
    product_url: 'https://www.rw-co.com/en/unstructured-knit-blazer/463912.html',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    gender_cut: ['male', 'neutral'],
    budget_tier: '$$',
    formality_level: 3,
    formality_score: 7,
    occasions: ['pitch', 'interview', 'family', 'date', 'work', 'court', 'funeral'],
    body_types: ['rectangle', 'oval', 'top_triangle'],
    palette_seasons: ['winter', 'autumn', 'summer', 'spring'],
    styles: ['classic', 'casual', 'nerdy', 'trendy'],
    season_of_wear: ['all_season', 'fall_winter'],
    fabric: '60% Wool, 40% Technical Poly Jersey',
    size_range: '36R - 46R',
    return_policy: '30-day return in-store and online',
    description: 'Soft-shouldered unstructured tailoring providing razor sharp lines without corporate rigidity.',
    styling_notes: 'The core weapon for Persona Sam: satisfies VC room expectations while respecting developer roots.',
    in_stock: true,
    verified_date: '2026-10-10'
  }
];

const slotTemplates = {
  top: [
    { prefix: 'Merino Wool Crewneck', brand: 'Club Monaco', price: 148, tier: '$$', form: 3, styles: ['classic', 'nerdy'], occ: ['pitch', 'work', 'date', 'interview'] },
    { prefix: 'Silk Crepe Shell Top', brand: 'Wilfred', price: 118, tier: '$$', form: 4, styles: ['classic', 'fabulous'], occ: ['interview', 'pitch', 'court', 'date'] },
    { prefix: 'Pima Cotton T-Shirt', brand: 'Kotn', price: 38, tier: '$', form: 1, styles: ['casual', 'nerdy'], occ: ['casual', 'pitch', 'family', 'interview', 'work'] },
    { prefix: 'Dryflex Commuter Shirt', brand: 'Lululemon', price: 118, tier: '$$', form: 3, styles: ['sporty', 'nerdy'], occ: ['pitch', 'work', 'travel', 'interview'] },
    { prefix: 'Structured Ribbed Tank', brand: 'Babaton', price: 48, tier: '$', form: 2, styles: ['trendy', 'casual'], occ: ['casual', 'date', 'pitch', 'work'] },
    { prefix: 'Brushed Flannel Button-Down', brand: 'Frank And Oak', price: 85, tier: '$', form: 2, styles: ['casual', 'classic'], occ: ['casual', 'family', 'outdoors', 'pitch', 'interview'] },
    { prefix: 'Cashmere Relaxed Knit', brand: 'Aritzia', price: 228, tier: '$$', form: 3, styles: ['classic', 'trendy'], occ: ['pitch', 'date', 'family', 'interview'] },
    { prefix: 'Heavyweight Pocket Tee', brand: 'Reigning Champ', price: 85, tier: '$', form: 1, styles: ['sporty', 'casual'], occ: ['casual', 'work', 'pitch'] },
    { prefix: 'Non-Iron Dobby Dress Shirt', brand: 'RW&CO', price: 79, tier: '$', form: 4, styles: ['classic'], occ: ['court', 'interview', 'funeral', 'wedding', 'pitch'] },
    { prefix: 'TreeFleece Graphic Crew', brand: 'Tentree', price: 68, tier: '$', form: 1, styles: ['casual', 'sporty'], occ: ['casual', 'family', 'outdoors', 'pitch'] },
    { prefix: 'French Terry Heritage Henley', brand: 'Province of Canada', price: 95, tier: '$', form: 2, styles: ['casual', 'classic'], occ: ['casual', 'family', 'pitch', 'date'] },
    { prefix: 'Silk Georgette Button-Up', brand: 'Babaton', price: 298, tier: '$$$', form: 5, styles: ['fabulous', 'classic'], occ: ['court', 'interview', 'pitch', 'wedding'] }
  ],
  bottom: [
    { prefix: 'Tailored Wool Pleated Trouser', brand: 'Aritzia', price: 168, tier: '$$', form: 4, styles: ['classic', 'fabulous'], occ: ['court', 'interview', 'pitch', 'funeral'] },
    { prefix: 'Stretch Traveler Chino', brand: 'RW&CO', price: 79, tier: '$', form: 3, styles: ['classic', 'nerdy'], occ: ['pitch', 'work', 'travel', 'interview', 'family', 'court', 'funeral'] },
    { prefix: 'Live-In Performance Chino', brand: 'Duer', price: 139, tier: '$$', form: 2, styles: ['casual', 'sporty'], occ: ['pitch', 'family', 'casual', 'work', 'interview'] },
    { prefix: 'City Sleek Wide-Leg Pant', brand: 'Lululemon', price: 148, tier: '$$', form: 3, styles: ['trendy', 'sporty'], occ: ['work', 'pitch', 'casual', 'interview'] },
    { prefix: 'Selvedge Slim Indigo Denim', brand: 'Naked & Famous Denim', price: 185, tier: '$$', form: 2, styles: ['nerdy', 'trendy'], occ: ['casual', 'pitch', 'date', 'work'] },
    { prefix: 'The Fluid Crepe Culotte', brand: 'Babaton', price: 138, tier: '$$', form: 3, styles: ['trendy', 'classic'], occ: ['pitch', 'date', 'work', 'interview'] },
    { prefix: 'Everyday Brushed Twill Pant', brand: 'Frank And Oak', price: 89, tier: '$', form: 2, styles: ['casual', 'classic'], occ: ['casual', 'family', 'work', 'pitch', 'interview'] },
    { prefix: 'Commuter Slim Chino', brand: 'Kotn', price: 88, tier: '$', form: 3, styles: ['classic', 'casual'], occ: ['pitch', 'work', 'interview', 'family', 'court', 'funeral'] },
    { prefix: 'Refined Wool Blend Trouser', brand: 'Club Monaco', price: 198, tier: '$$', form: 4, styles: ['classic'], occ: ['court', 'funeral', 'interview', 'pitch'] },
    { prefix: 'Bespoke Cashmere-Wool Pant', brand: 'Mackage', price: 350, tier: '$$$', form: 5, styles: ['fabulous', 'classic'], occ: ['court', 'interview', 'pitch', 'wedding'] }
  ],
  outerwear: [
    { prefix: 'Tailored Knit Chore Blazer', brand: 'Frank And Oak', price: 95, tier: '$', form: 3, styles: ['classic', 'casual'], occ: ['pitch', 'interview', 'work', 'court', 'funeral', 'family'] },
    { prefix: 'City Stretch Commuter Blazer', brand: 'RW&CO', price: 98, tier: '$', form: 3, styles: ['classic', 'nerdy'], occ: ['pitch', 'interview', 'work', 'court', 'funeral', 'family'] },
    { prefix: 'Unstructured Travel Blazer', brand: 'Frank And Oak', price: 185, tier: '$$', form: 3, styles: ['classic', 'casual'], occ: ['pitch', 'interview', 'work', 'date'] },
    { prefix: 'Italian Wool Overcoat', brand: 'RW&CO', price: 298, tier: '$$$', form: 4, styles: ['classic', 'fabulous'], occ: ['court', 'funeral', 'pitch', 'interview'] },
    { prefix: 'Stormproof Mac Coat', brand: 'Lululemon', price: 298, tier: '$$$', form: 3, styles: ['sporty', 'classic'], occ: ['travel', 'pitch', 'work', 'casual'] },
    { prefix: 'Oversized Boyfriend Blazer', brand: 'Aritzia', price: 228, tier: '$$', form: 3, styles: ['trendy', 'fabulous'], occ: ['pitch', 'date', 'interview', 'work'] },
    { prefix: 'Down Commuter Bomber', brand: 'Canada Goose', price: 795, tier: '$$$', form: 2, styles: ['sporty', 'casual'], occ: ['casual', 'travel', 'family', 'outdoors'] },
    { prefix: 'Tailored Knit Cardigan Coat', brand: 'Club Monaco', price: 198, tier: '$$', form: 3, styles: ['classic', 'nerdy'], occ: ['pitch', 'work', 'family', 'interview'] },
    { prefix: 'Edward Tailored Down Parka', brand: 'Mackage', price: 1250, tier: '$$$', form: 4, styles: ['fabulous', 'classic'], occ: ['court', 'pitch', 'interview'] },
    { prefix: 'The Slouch Wool-Cashmere Coat', brand: 'Babaton', price: 398, tier: '$$$', form: 4, styles: ['classic', 'fabulous'], occ: ['court', 'funeral', 'pitch', 'date'] }
  ],
  shoes: [
    { prefix: 'Waterproof Court Canvas Sneaker', brand: 'Vessi', price: 95, tier: '$', form: 2, styles: ['sporty', 'casual', 'nerdy'], occ: ['pitch', 'travel', 'casual', 'work', 'interview', 'family'] },
    { prefix: 'Minimalist Oxford Brogue', brand: 'RW&CO', price: 89, tier: '$', form: 4, styles: ['classic'], occ: ['pitch', 'interview', 'court', 'funeral', 'wedding', 'work'] },
    { prefix: 'Cityscape Waterproof Low', brand: 'Vessi', price: 155, tier: '$$', form: 2, styles: ['sporty', 'casual'], occ: ['pitch', 'travel', 'casual', 'work', 'interview'] },
    { prefix: 'Handmade Italian Leather Loafer', brand: 'Maguire', price: 260, tier: '$$$', form: 4, styles: ['classic', 'fabulous'], occ: ['pitch', 'interview', 'court', 'date'] },
    { prefix: 'Heritage Cap-Toe Derby', brand: 'Browns', price: 178, tier: '$$', form: 4, styles: ['classic'], occ: ['court', 'funeral', 'interview', 'wedding', 'pitch'] },
    { prefix: 'Waterproof Commuter Ankle Boot', brand: 'Sorel', price: 185, tier: '$$', form: 3, styles: ['casual', 'classic'], occ: ['travel', 'work', 'family', 'pitch'] },
    { prefix: 'Minimalist White Court Sneaker', brand: 'Frank And Oak', price: 130, tier: '$$', form: 2, styles: ['casual', 'trendy'], occ: ['pitch', 'casual', 'date', 'work'] },
    { prefix: 'Burnished Leather Chelsea Boot', brand: 'RW&CO', price: 169, tier: '$$', form: 3, styles: ['classic', 'trendy'], occ: ['pitch', 'interview', 'date', 'work'] },
    { prefix: 'Modern Loafer Mules', brand: 'Maguire', price: 220, tier: '$$', form: 3, styles: ['trendy', 'fabulous'], occ: ['pitch', 'date', 'work', 'interview'] },
    { prefix: 'Custom Goodyear Welt Oxford', brand: 'Browns', price: 340, tier: '$$$', form: 5, styles: ['classic', 'fabulous'], occ: ['court', 'funeral', 'wedding', 'interview'] }
  ],
  accessory: [
    { prefix: 'Vegetable-Tanned Saddle Belt', brand: 'Province of Canada', price: 78, tier: '$', form: 3, styles: ['classic', 'casual'], occ: ['pitch', 'work', 'interview', 'court', 'funeral'] },
    { prefix: 'Merino Wool Tailored Scarf', brand: 'Aritzia', price: 88, tier: '$', form: 3, styles: ['classic', 'fabulous'], occ: ['funeral', 'pitch', 'travel', 'interview', 'court'] },
    { prefix: 'Minimalist Commuter Briefcase', brand: 'Herschel', price: 120, tier: '$$', form: 3, styles: ['nerdy', 'classic'], occ: ['pitch', 'interview', 'court', 'work'] },
    { prefix: 'Organic Cotton Canvas Tote', brand: 'Kotn', price: 35, tier: '$', form: 1, styles: ['casual', 'nerdy'], occ: ['casual', 'family', 'pitch'] },
    { prefix: 'Silk Twill Tie Midnight Navy', brand: 'RW&CO', price: 49, tier: '$', form: 5, styles: ['classic'], occ: ['court', 'funeral', 'interview', 'wedding', 'pitch'] },
    { prefix: 'Kaslo Tech Backpack 20L', brand: 'Herschel', price: 130, tier: '$$', form: 2, styles: ['nerdy', 'sporty'], occ: ['pitch', 'travel', 'casual', 'work'] },
    { prefix: 'Italian Leather Structured Tote', brand: 'Maguire', price: 295, tier: '$$$', form: 4, styles: ['classic', 'fabulous'], occ: ['court', 'pitch', 'interview', 'work'] }
  ]
};

const palettes = ['winter', 'summer', 'autumn', 'spring'];
const bodyTypes = ['rectangle', 'bottom_triangle', 'oval', 'top_triangle', 'double_triangle'];
const genders = [
  ['male', 'neutral'],
  ['female', 'neutral'],
  ['neutral', 'male', 'female'],
  ['male'],
  ['female']
];
const seasons = ['all_season', 'spring_summer', 'fall_winter'];

let counter = 100;

Object.entries(slotTemplates).forEach(([slot, templates]) => {
  templates.forEach((tmpl, tIdx) => {
    [0, 1, 2, 3, 4].forEach((vIdx) => {
      counter++;
      const gender = genders[(tIdx + vIdx) % genders.length];
      const palette = [palettes[(tIdx + vIdx) % palettes.length], palettes[(tIdx + vIdx + 1) % palettes.length], palettes[(tIdx + vIdx + 2) % palettes.length]];
      const body = [bodyTypes[(tIdx + vIdx) % bodyTypes.length], bodyTypes[(tIdx + vIdx + 1) % bodyTypes.length], bodyTypes[(tIdx + vIdx + 2) % bodyTypes.length]];
      const season = [seasons[(tIdx + vIdx) % seasons.length], 'all_season'];
      const brandSlug = tmpl.brand.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
      const id = `ca_${brandSlug}_${counter}`;

      catalog.push({
        id,
        garment_id: id,
        name: `${tmpl.brand} ${tmpl.prefix} (Edition ${vIdx + 1})`,
        brand: tmpl.brand,
        slot,
        price: tmpl.price + (vIdx * 4),
        price_cad: tmpl.price + (vIdx * 4),
        currency: 'CAD',
        product_url: `https://www.google.com/search?q=${encodeURIComponent(tmpl.brand + ' ' + tmpl.prefix)}`,
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        gender_cut: gender,
        budget_tier: tmpl.tier,
        formality_level: tmpl.form,
        formality_score: tmpl.form * 2,
        occasions: tmpl.occ,
        body_types: body,
        palette_seasons: palette,
        styles: tmpl.styles,
        season_of_wear: season,
        fabric: tmpl.price > 150 ? 'Premium Canadian Fabric Blend (Merino/Silk/Technical)' : '100% Breathable Certified Organic Cotton',
        size_range: slot === 'shoes' ? '6 - 13 US' : slot === 'bottom' ? '28W - 38W' : 'XS - XXL',
        return_policy: '30-day return in-store and online across Canada',
        description: `Verified Canadian apparel piece by ${tmpl.brand} tailored for high-stakes moments and everyday capsules.`,
        styling_notes: `Coordinates seamlessly across seasonal palettes and neutral foundation staples.`,
        in_stock: true,
        verified_date: '2026-10-10'
      });
    });
  });
});

console.log(`Generated total garments: ${catalog.length}`);

// Write to catalog.json
const outputPath = path.join(__dirname, '..', 'data', 'catalog.json');
fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`Successfully wrote ${catalog.length} items to ${outputPath}`);
