# Changelog

All notable changes to the **Style Advisor** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- User authentication and persistent multi-wardrobe cloud synchronization.
- Multi-currency localization (USD / EUR support).
- Mobile responsive drawer enhancements for small viewport tablets.

---

## [1.0.0] - 2026-09-20

### 🚀 Initial Production Release (Milestone v1.0.0)

Style Advisor MVP is officially completed and locked at **v1.0.0**, delivering a complete, end-to-end Zero-Hallucination AI styling and capsule curation platform.

### Added

#### 1. Core AI Recommendation Engine (`app/api/recommend/`)
- **Zero-Hallucination Architecture**: Decoupled deterministic candidate filtering from generative LLM reasoning.
- **Deterministic Filtering (`lib/catalog-filter.ts`)**: Hard-filters catalog garments by `gender_cut`, `budget_tier`, `occasions`, and `season_of_wear`.
- **Constraint Relaxation Ladder**: Gracefully relaxes filters (Palette -> Season -> Budget) if the candidate pool is too restricted.
- **LLM Structured JSON Mode**: Prompt injection passes **ID-only metadata** to Claude 3.5 Sonnet / OpenAI GPT-4o (no product names or links are exposed to LLM hallucination).
- **Code Validation Layer**: Cross-checks every returned garment ID against `data/catalog.json` before sending payload to client.
- **Deterministic Caching**: Caches outfit combinations using SHA-256 hash keys with a 15-second hard timeout.

#### 2. Interactive "Fitting Room" UI (`app/page.tsx` & `components/`)
- **Shared Profile Onboarding (`components/SharedProfile.tsx`)**: 9-variable personal profile form with visual pickers and LocalStorage persistence (`lib/useProfileStorage.ts`).
- **Flow A: Decisive Occasion Dressing (`components/OccasionResult.tsx`)**:
  - Single decisive 4-to-5 piece outfit card for high-stakes events (*Pitch in Gastown, Gala, Wedding, Travel*).
  - Editorial stylist reasoning block and color palette harmony chips.
  - **Dislike Nudges**: Real-time recalibration buttons (`[Too formal]`, `[Too casual]`, `[Not my vibe]`).
- **Flow B: 15-Item Capsule Matrix (`components/CapsuleResult.tsx`)**:
  - 15-item seasonal matrix (5 Tops, 4 Bottoms, 3 Outerwear, 2 Shoes, 1 Accessory).
  - **3 distinct worked outfits** showing cross-combination styling.
  - **Starter Set of 5 Highlights** (foundation pieces to buy first).
  - **"I Already Have This" Feature**: Allows users to mark owned garments, triggering asymmetric matrix re-planning.
- **Shared Cart & Research Checkout (`components/SharedCart.tsx`, `components/CheckoutModal.tsx`)**:
  - Wardrobe checklist with empty-cart guidance (*"You're ready. Wear what you have"*).
  - Research data capture modal with email input and willingness-to-pay (WTP) survey slider.

#### 3. Chrome Extension (Manifest V3) (`extension/`)
- **One-Click Ingestion**: Scrapes product metadata from Canadian and global retailer pages (*Lululemon, Aritzia, Kotn, RW&CO, Shopify stores*).
- **4-Tier Scraper Cascade (`extension/content.js`)**:
  - Tier 1: Embedded Next.js store data (`<script id="__NEXT_DATA__">`).
  - Tier 2: Schema.org JSON-LD (`@type: Product` offers and images).
  - Tier 3: OpenGraph & Twitter meta tags (`og:title`, `og:price:amount`, `og:image`).
  - Tier 4: CDN image body search (`cdn.shopify.com`, `scene7.com`).
- **Smart Wardrobe Slot Auto-Classifier**: Automatically classifies items into Top, Bottom, Outerwear, Shoes, or Accessory based on title/category keywords.
- **Extension Popup UI (`extension/popup.html`, `popup.css`, `popup.js`)**: Sleek luxury interface with real-time CORS health check, editable fields, and direct push to catalog.

#### 4. Admin Catalog Management & Ingestion Hub (`app/admin/`)
- **CORS Ingest Endpoint (`app/api/admin/catalog/route.ts`)**:
  - Preflight `OPTIONS` handler returning HTTP 200 with `Access-Control-Allow-Origin: *`.
  - Normalizes payloads, generates deterministic IDs (`ca_[brand]_[slug]_[random]`), sets `verified_date`, and prepends to `data/catalog.json`.
- **Live Ingestion Hub (`app/admin/page.tsx`)**:
  - Auto-sync stream (4s polling) automatically populates incoming extension items with **`NEW INGEST`** badges and toast notifications.
  - Built-in interactive JSON tester with preloaded samples (Aritzia, Lululemon).
  - Filterable inventory table by slot, brand, and link health.
- **Retailer URL Health Verifier (`app/api/admin/verify-url/route.ts`)**: Real-time batch ping verifier to detect broken links and 404s.
- **Server-Side Fallback Extractor (`app/api/admin/extract-product/route.ts`)**: Server-side URL scraper for manual admin auto-fill.

#### 5. Project Documentation Suite
- **`PRD.md`**: Complete Product Requirements Document with Mermaid flowcharts, data schemas, and quality metrics.
- **`README.md`**: GitHub documentation with ASCII/Mermaid diagrams, Docker installation guide (`Step 0`), and script commands.
- **`CLAUDE.md`**: Developer & AI coding assistant guide with design tokens, type systems, and codebase directory map.
- **`IMPLEMENTATION.md`**: Engineering log tracking checklist milestones and resolved issues.
- **`.env.example`**: Standardized environment variables template for local and production deployment.

---

### Fixed

- **Next.js Build TypeScript Inference**: Resolved `Set<string>` type inference error on Vercel builds by refactoring `newlyIngestedIds` state to `string[]`.
- **Cloudflare/WAF 403 Bypass**: Added browser-realistic headers (`User-Agent`, `Sec-Ch-Ua`, `Accept-Language`, `Referer`) in `app/api/admin/verify-url/route.ts` so anti-bot protected domains are recognized as live.
- **Lululemon Extraction Accuracy**: Fixed price ($120 fallback bug) and image extraction by reading NextData store properties (`minVariantPrice`) and enforcing empty string `""` fallback (no unrelated stock photos).
- **Docker Fast Refresh Support**: Aligned `NODE_ENV=development` in `docker-compose.yml` to enable Hot Module Replacement during local development.

---

### Changed

- Renamed `PRD_CHECKLIST.md` to `IMPLEMENTATION.md` for dedicated engineering checklist and technical issue tracking.
- Standardized architecture diagrams in `README.md` and `PRD.md` to official Mermaid flowchart syntax.
