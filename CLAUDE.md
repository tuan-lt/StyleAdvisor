# CLAUDE.md — Codebase Documentation & AI Guide

> **Style Advisor**: An AI-powered personal stylist and capsule wardrobe curator designed for Canadian and global climates, built on a **Zero-Hallucination Architecture**.

---

## 1. Project Summary & Core Philosophy

- **Zero-Hallucination Guarantee**: *"The AI is allowed to have taste, but not facts."*
  - The application hard-filters candidate garments deterministically in code (`lib/catalog-filter.ts`).
  - Only verified candidate `id`s are provided to the LLM (no product titles, URLs, or prices).
  - The LLM selects the IDs, calibrates formality, and writes aesthetic reasoning.
  - The returned schema is validated against the catalog before resolving to the UI.
- **"Fitting Room" Design Aesthetic**:
  - Quiet luxury palette: warm neutral paper (`#F7F4EF`), midnight navy ink (`#1F2A44`), ochre thread gold (`#8A5A12`), and forest moss verifications (`#3F6B4F`).
  - Serif headlines (`Playfair Display` / `Merriweather` font vibes) with clean sans body.
  - No aggressive e-commerce dark patterns (no fake timers, countdowns, or intrusive popups).

---

## 2. Common Commands & Workflows

### Development & Local Execution
```bash
# Install dependencies
npm install

# Start local Next.js development server (http://localhost:3000)
npm run dev

# Build production bundle with TypeScript checks
npm run build

# Run production server
npm run start

# Run ESLint
npm run lint

# Verify all retailer URLs in data/catalog.json (checks for dead links)
npm run verify-links
```

### Docker Commands
```bash
# Start containerized application in development mode
docker compose up -d

# Rebuild container after dependency or Dockerfile changes
docker compose build web && docker compose up -d

# Stop containers
docker compose down

# View live container logs
docker compose logs -f web
```

---

## 3. Architecture & Key Data Flows

### A. Recommendation Pipeline (`/api/recommend`)
1. **Request Input**: Profile variables (Gender, Budget Tier, Occasion, Season, Palette, Body Type) + Target Occasion / Goal.
2. **Deterministic Hard-Filtering** (`lib/catalog-filter.ts`):
   - Filters garments from `data/catalog.json` by `gender_cut`, `budget_tier`, `season_of_wear`, and `occasions`.
   - If candidate pool is too small, relaxes constraints systematically (Palette -> Season -> Budget).
3. **LLM Inference** (Claude 3.5 Sonnet / GPT-4o with JSON mode):
   - Injects candidate list: `[{ id, slot, formality_score, color, brand }]`.
   - Prompt directs LLM to pick exactly 1 item per required slot, calibrate overall formality, and write cohesive stylist commentary.
4. **Validation Layer**:
   - Ensures all returned garment IDs strictly exist in `data/catalog.json`.
   - Assembles rich `Garment` objects and returns verified payload with deterministic caching.

### B. Catalog Ingestion & Chrome Extension Pipeline
1. **Chrome Extension (Manifest V3)** (`/extension`):
   - Content script (`content.js`) scrapes JSON-LD Schema (`@type: Product`), OpenGraph tags, and retailer-specific DOM trees (*Aritzia, Lululemon, Kotn, RW&CO, Shopify stores*).
   - Popup UI (`popup.html` / `popup.js`) allows quick edit & preview before pushing.
2. **CORS Ingest Endpoint** (`app/api/admin/catalog/route.ts`):
   - Preflight `OPTIONS` handler returns HTTP 200 with `Access-Control-Allow-Origin: *`.
   - `POST` handler normalizes payloads, auto-generates deterministic IDs (`ca_[brand]_[slug]_[random]`), assigns today's `verified_date`, and prepends to `data/catalog.json`.
3. **Admin Ingestion Hub** (`app/admin/page.tsx`):
   - Live stream polling (every 4s) automatically ingests items into the table with a **`NEW INGEST`** badge.
   - Real-time batch URL health verifier (`/api/admin/verify-url`) tests for 404s and broken links.

---

## 4. Codebase Directory Structure

```
Style Advisor/
├── app/
│   ├── admin/               # Admin catalog dashboard & Chrome Extension hub
│   │   └── page.tsx         # Catalog management table, filters, and modal editor
│   ├── api/
│   │   ├── admin/
│   │   │   ├── catalog/     # CRUD + CORS preflight ingest endpoint
│   │   │   ├── extract-product/ # Server-side fallback DOM/OpenGraph scraper
│   │   │   └── verify-url/  # Real-time HTTP link health & latency checker
│   │   └── recommend/       # Core LLM recommendation engine
│   ├── globals.css          # Design system & CSS custom properties
│   ├── layout.tsx           # Root typography, metadata, and HTML wrapper
│   └── page.tsx             # Main Fitting Room single-page application
├── components/
│   ├── SharedProfile.tsx    # 9-variable onboarding profile picker
│   ├── OccasionResult.tsx   # Flow A: Decisive outfit card & dislike nudge
│   ├── CapsuleResult.tsx    # Flow B: 15-item matrix & 3 worked outfits
│   ├── SharedCart.tsx       # Wardrobe cart & purchase checklist
│   └── CheckoutModal.tsx    # Research capture & WTP survey modal
├── data/
│   └── catalog.json         # Master verified retailer garment catalog (~180+ items)
├── extension/               # Chrome Extension Manifest V3 (Scraper & Ingestor)
│   ├── manifest.json        # Extension manifest
│   ├── content.js           # In-page DOM & JSON-LD metadata extractor
│   ├── popup.html           # Ingestor popup UI
│   ├── popup.css            # Extension styling
│   ├── popup.js             # Extension interaction & API ingest client
│   └── README.md            # Extension installation & usage guide
├── lib/
│   ├── catalog-filter.ts    # Deterministic candidate filter & relaxation rules
│   └── useProfileStorage.ts # LocalStorage client profile persistence
├── types/
│   └── catalog.ts           # TypeScript definitions for Garments, Slots, Palettes
├── Dockerfile               # Production Docker container definition
├── docker-compose.yml       # Local development orchestration
├── PRD.md                   # Full Product Requirements Document
├── README.md                # GitHub documentation & visual architecture
└── package.json
```

---

## 5. Type System & Key Interfaces (`types/catalog.ts`)

```typescript
export type GarmentSlot = "top" | "bottom" | "outerwear" | "shoes" | "accessory";
export type GenderCut = "men" | "women" | "unisex";
export type BudgetTier = "budget" | "mid" | "luxury";
export type Occasion = "pitch" | "work" | "casual" | "date_night" | "travel" | "wedding" | "gala";
export type SeasonOfWear = "spring" | "summer" | "fall" | "winter" | "all-season";

export interface Garment {
  id: string;                          // e.g. "ca_aritzia_effortless-pant_7a2f"
  name: string;                        // e.g. "The Effortless Pant™ Crepe"
  brand: string;                       // e.g. "Aritzia"
  slot: GarmentSlot;
  price: number;                       // CAD value
  currency: string;                    // "CAD"
  product_url: string;                 // Verified direct retailer URL
  image_url: string;                   // CDN image URL or empty string ""
  gender_cut: GenderCut;
  budget_tier: BudgetTier;
  occasions: Occasion[];
  palette_seasons: PaletteSeason[];
  body_types: BodyType[];
  season_of_wear: SeasonOfWear[];
  formality_score: number;             // 1 to 10
  color: string;                       // e.g. "Classic Navy"
  hex_color: string;                   // e.g. "#1F2A44"
  fabric: {
    composition: string;               // e.g. "100% Japanese Crepe Polyester"
    care: string;
    sustainable?: boolean;
  };
  return_policy: {
    window_days: number;
    free_returns: boolean;
    policy_note?: string;
  };
  description?: string;
  styling_notes?: string;
  in_stock: boolean;
  verified_date?: string;              // "YYYY-MM-DD"
}
```

---

## 6. Coding Standards & Guidelines

### Frontend & Styling (Tailwind CSS)
- Always use semantic theme tokens defined in `tailwind.config.ts` and `globals.css`:
  - `bg-surface` (`#F7F4EF`), `bg-surface-raised` (`#FFFFFF`), `text-ink` (`#1F2A44`), `text-ink-muted` (`#7A7A85`), `text-thread` / `border-thread` (`#8A5A12`), `text-verified` (`#3F6B4F`), `border-border` (`#E8E3DA`).
- Preserve the quiet luxury aesthetic: subtle borders (`rounded-fitting`, `shadow-fitting-raised`), high contrast, and refined typography.
- Never use generic red/green/blue alerts; use calibrated brand alert tones.

### Image Handling
- **No Force-Filled Placeholders**: If an item's image URL is missing or cannot be scraped, leave `image_url` as an empty string `""`.
- The UI handles empty images gracefully with a clean `No Img` badge instead of broken image icons or unrelated stock photos.

### API & Backend Conventions
- All API routes in `app/api/` must return typed `NextResponse.json` payloads with appropriate HTTP status codes.
- Any route supporting Chrome Extension cross-origin requests (`/api/admin/catalog`) must implement an `OPTIONS` handler returning status 200 with standard CORS headers (`Access-Control-Allow-Origin: *`).
- Always validate incoming payloads before mutating `data/catalog.json`.

### Git & Operational Constraints
- **Commit/Push Rule**: Do **not** commit or push changes to Git unless the user explicitly requests it.
