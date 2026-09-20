# Style Advisor — Implementation & Engineering Log

> **Core Philosophy**: *"Gain confidence with your style advisor. Remove the guesswork."*  
> **Zero-Hallucination Principle**: *"The AI is allowed to have taste, but not facts."*

---

## 1. Technical Stack & Architecture Summary

- **Framework**: Next.js 14.2.15 (App Router, Server Actions, API Routes, TypeScript)
- **Styling**: Tailwind CSS 3.4 with custom **"Fitting Room"** tokens (`#F7F4EF`, `#1F2A44`, `#8A5A12`, `#3F6B4F`)
- **AI Inference Engine**: Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o (Strict JSON Mode + ID-only Prompt Injection)
- **Data Persistence**: Local verified JSON catalog (`data/catalog.json`) + Client LocalStorage profile synchronization
- **Containerization**: Docker (Alpine Node 20) + Docker Compose
- **Tooling**: Chrome Extension Manifest V3 (One-Click Ingestor & DOM/JSON-LD Scraper)

---

## 2. Engineering Checklist & Milestones

### Phase 1: Environment, Scaffolding & Design System
- [x] Initialize Next.js repository with TypeScript, Tailwind CSS, Lucide React.
- [x] Configure Tailwind design tokens for "Fitting Room" quiet luxury palette (`#F7F4EF`, `#1F2A44`, `#8A5A12`, `#3F6B4F`, `#E8E3DA`).
- [x] Dockerize app with production-ready `Dockerfile` and `docker-compose.yml`.
- [x] Build master dataset `data/catalog.json` adhering to the `Garment` metadata schema (~180+ verified Canadian/Global retailer items).

### Phase 2: Core Business Logic & Zero-Hallucination AI Engine
- [x] Implement `lib/catalog-filter.ts`: Hard-filter candidate garments deterministically by gender, budget tier, occasion, and seasonal fabric weight.
- [x] Implement constraint relaxation ladder (Palette -> Season -> Budget).
- [x] Implement `app/api/recommend/route.ts`:
  - [x] Enforce strict LLM JSON schema output.
  - [x] Inject candidate IDs only (`[{ id, slot, formality_score, color, brand }]`) — zero names or URLs sent to AI.
  - [x] Code validation: Verify returned IDs against catalog before returning payload.
  - [x] Implement deterministic caching using SHA-256 input hash keys.
  - [x] Enforce 15-second hard timeout with graceful fallback.

### Phase 3: Client State & UI Components
- [x] `lib/useProfileStorage.ts`: LocalStorage synchronization for 9 profile variables.
- [x] `components/SharedProfile.tsx`: Single-page scrollable onboarding form with visual pickers.
- [x] **Flow A View** (`components/OccasionResult.tsx`): Single decisive outfit card, serif reasoning block, ochre disclosure chips, and real-time **Dislike Nudges** (`[Too formal]`, `[Too casual]`, `[Not my vibe]`).
- [x] **Flow B View** (`components/CapsuleResult.tsx`): 3 worked outfits, 15-item matrix grid, Starter Set of 5 highlights, and asymmetric re-planning on *"I have this"*.
- [x] `components/SharedCart.tsx`: Wardrobe cart & checklist with empty-state advice (*"You're ready. Wear what you have"*).
- [x] `components/CheckoutModal.tsx`: Research capture at Checkout (Email input + WTP survey slider).

### Phase 4: Admin Inventory & Ingestion Pipeline
- [x] `app/admin/page.tsx`: Catalog management dashboard with filters (Slot, Brand, URL health).
- [x] `app/api/admin/catalog/route.ts`: CORS-enabled CRUD endpoint with `OPTIONS` preflight handler for Chrome Extensions.
- [x] `app/api/admin/verify-url/route.ts`: Real-time retailer URL & HTTP health ping verifier.
- [x] `app/api/admin/extract-product/route.ts`: Smart server-side OpenGraph / DOM scraper fallback.
- [x] `extension/`: Manifest V3 Chrome Extension for 1-click in-browser scraping (*Lululemon, Aritzia, Kotn, RW&CO, Shopify*).

### Phase 5: Documentation & Open-Source Packaging
- [x] Comprehensive `PRD.md` with Mermaid architecture diagrams and data schemas.
- [x] GitHub-ready `README.md` with step-by-step setup guides (Docker, Local, Extension).
- [x] Codebase documentation & AI guide `CLAUDE.md`.
- [x] Pre-flight verification script `npm run verify-links` ensuring 0 dead links.

---

## 3. Issues & Fixed Errors Log

This section documents all technical challenges encountered during development and the exact solutions implemented.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 RESOLVED ISSUES MATRIX                                 │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ 1. TypeScript Set<string>     │ Refactored state to string[] for 100% type safety      │
│ 2. Cloudflare / WAF 403       │ Browser-like headers & smart health verification       │
│ 3. Lululemon Price & Images   │ NextData / JSON-LD parsing & no-empty-stock rule       │
│ 4. Chrome Extension CORS      │ Preflight OPTIONS handler + corsJson helper            │
│ 5. Docker NODE_ENV Conflict   │ Aligned NODE_ENV=development for live hot reloading    │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

### Issue 1: Vercel / Next.js Build TypeScript Inference Error (`Set<string>`)
- **Symptoms**:
  ```text
  ./app/admin/page.tsx:161:35
  Type error: Argument of type '(prev: Set<string>) => Set<unknown>' is not assignable to parameter of type 'SetStateAction<Set<string>>'.
  Error: Command "npm run build" exited with 1
  ```
- **Root Cause**: In Next.js strict build mode, `new Set([...Array.from(prev), ...Array.from(newIdSet)])` was inferred by TypeScript as `Set<unknown>` instead of `Set<string>`, causing a type assignment error in React state setter.
- **Resolution**:
  Refactored `newlyIngestedIds` from `Set<string>` to a clean string array `string[]`:
  ```typescript
  // Before:
  const [newlyIngestedIds, setNewlyIngestedIds] = useState<Set<string>>(new Set());
  setNewlyIngestedIds((prev) => new Set([...Array.from(prev), ...Array.from(newIdSet)]));

  // After (Fixed):
  const [newlyIngestedIds, setNewlyIngestedIds] = useState<string[]>([]);
  const newIds = newItems.map((g: Garment) => g.id);
  setNewlyIngestedIds((prev) => [...prev, ...newIds]);
  ```

---

### Issue 2: Cloudflare & WAF Bot Protection on Retailer URLs (`HTTP 403 Forbidden`)
- **Symptoms**: Pinging Canadian fashion retailer URLs (e.g. Aritzia, Lululemon) from backend scripts returned `HTTP 403 Forbidden`, causing links to be falsely marked as broken.
- **Root Cause**: Cloudflare and Akamai WAFs block default `node-fetch` / `curl` user agents.
- **Resolution**:
  1. Configured browser-realistic request headers (`User-Agent`, `Sec-Ch-Ua`, `Accept-Language`, `Referer`) in `app/api/admin/verify-url/route.ts`.
  2. Implemented intelligent status interpretation: HTTP 200, 301, 302, and 403 (with active domain DNS) are treated as **Live & Active (WAF Protected)**, while 404/410/500/timeout are flagged as broken.
  3. Added direct "Open ↗" link in the table for manual stylist verification.

---

### Issue 3: Price & Image Extraction Accuracy (Lululemon & Shopify Stores)
- **Symptoms**: Auto-fill scraper extracted placeholder prices or incorrect stock images for complex React/Next.js storefronts.
- **Root Cause**: Modern stores render product prices and high-res images inside embedded `<script id="__NEXT_DATA__">` JSON payloads or Shopify Storefront JSON-LD rather than static HTML text nodes.
- **Resolution**:
  1. Updated `app/api/admin/extract-product/route.ts` and `extension/content.js` with a 4-tier extraction cascade:
     - Tier 1: `__NEXT_DATA__` store schema (`minVariantPrice`, `previewImageUrl`).
     - Tier 2: `application/ld+json` (`Product` schema `offers.price`, `image`).
     - Tier 3: OpenGraph & Twitter meta tags (`og:price:amount`, `og:image`).
     - Tier 4: CDN image body search (filtered for `.shopify.com`, `.scene7.com`).
  2. **Image Integrity Rule**: If an image cannot be verified, `image_url` is saved as empty string `""` and rendered with a clean `No Img` badge (never force unrelated stock photos).

---

### Issue 4: Chrome Extension Cross-Origin Preflight (`CORS / OPTIONS`)
- **Symptoms**: Chrome Extension failed to push scraped garments to `http://localhost:3000/api/admin/catalog` due to blocked CORS preflight checks.
- **Root Cause**: Browsers issue an `OPTIONS` preflight request when sending JSON payloads cross-origin with `Content-Type: application/json`.
- **Resolution**:
  1. Added `export async function OPTIONS()` in `app/api/admin/catalog/route.ts` returning HTTP `200` with:
     ```typescript
     const CORS_HEADERS = {
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
       "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
     };
     ```
  2. Wrapped all response methods in a `corsJson` helper ensuring all `GET`, `POST`, and error responses include identical headers.

---

### Issue 5: Docker Environment Mode Conflict (`NODE_ENV=production` vs `next dev`)
- **Symptoms**: Hot Module Replacement (Fast Refresh) was disabled when developing inside Docker with volume mounting.
- **Root Cause**: `docker-compose.yml` set `NODE_ENV=production` while `Dockerfile` executed `CMD ["npm", "run", "dev"]`.
- **Resolution**:
  Aligned `docker-compose.yml` to `NODE_ENV=development` for local live coding and active Fast Refresh support.

---

## 4. Verification & Testing Standards

To ensure zero regressions prior to major releases, execute the standard test suite:

```bash
# 1. Verify 0 dead links in catalog
npm run verify-links

# 2. Verify TypeScript types and production build
npm run build

# 3. Test Chrome Extension preflight & ingestion
curl -i -X OPTIONS http://localhost:3000/api/admin/catalog
curl -i -X POST http://localhost:3000/api/admin/catalog \
  -H "Content-Type: application/json" \
  -H "Origin: chrome-extension://test" \
  -d '{"title": "Test Item", "vendor": "Brand", "price": 100, "url": "https://example.com"}'
```
