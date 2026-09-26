# Changelog

All notable changes to the **Style Advisor** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.2.0] - 2026-09-25

### 🚀 Major Product Upgrade (PRD v4.2 Milestone)

Comprehensive implementation of **PRD v4.2** specifications for ProductBC Build-a-Thon Demo Day:

### Added & Upgraded

#### 1. Catalog Expansion & Schema Alignment
- Expanded Canadian retailer dataset in [`data/catalog.json`](file:///Users/tuanlt/Vibe-coding/Style%20Advisor/data/catalog.json) from 19 to **250 verified items** across 20 Canadian brands (*Aritzia, Wilfred, Babaton, RW&CO, Lululemon, Kotn, Frank And Oak, Vessi, Canada Goose, Reigning Champ, Club Monaco, Roots, Mackage, Naked & Famous Denim, Browns, Maguire, Duer, Tentree, Province of Canada, Herschel*).
- Upgraded TypeScript schema ([`types/catalog.ts`](file:///Users/tuanlt/Vibe-coding/Style%20Advisor/types/catalog.ts)) to support `garment_id`, `price_cad`, `budget_tier` (`$`, `$$`, `$$$`), `gender_cut`, `formality_level` (1–5), `styles`, `size_range`, `fabric`, `return_policy`, and `verified_date`.
- Verified 100% valid candidate pools across all budget tiers and slots.

#### 2. Core Recommendation Engine & Zero-Hallucination Pipeline
- Upgraded [`app/api/recommend/route.ts`](file:///Users/tuanlt/Vibe-coding/Style%20Advisor/app/api/recommend/route.ts) with strict candidate filtering, LLM JSON structured responses, and automatic ID cross-verification.
- Added **Occasion Overrides Detector** (`checkOccasionOverride`) to identify decorum conflicts (e.g., Trendy style at a Funeral or Court) and trigger ochre warning chips (`#8A5A12`).
- Implemented **AI Interpretation Line** (`"We read this as: ..."`) to provide transparent room comprehension.
- Implemented deterministic **MD5 Hash Caching** with instant 0ms latency for repeated queries, eliminating token cost and credit exhaustion risks (OPEN-6).
- Added hard 15-second execution timeout protection with graceful fallback resilience.

#### 3. "Fitting Room" Visual Design & Interactive UI
- **Shared User Profile (`components/SharedProfile.tsx`)**: Upgraded to 9 variables with single-scroll layout, header cue (*"Nine quick questions, about a minute"*), 5 body silhouettes, 4-season visual wheel, and sub-60s completion speed.
- **Flow A (`components/OccasionResult.tsx`)**: Single outfit recommendation, Newsreader serif editorial reasoning (18px), ochre protocol chips, "I already have this" checkbox, and dislike recovery nudge (`[Too formal]`, `[Too casual]`, `[Not me]`).
- **Flow B (`components/CapsuleResult.tsx`)**: 15-item modular matrix, Starter Set of 5 highlights, 3 worked outfits, and asymmetric re-planning.
- **Cart & Research Checkout (`components/SharedCart.tsx`, `components/CheckoutModal.tsx`)**: De-duplicated shared bag, calm empty-cart guidance (*"You're ready. Wear what you have."*), and Willingness-to-Pay (WTP) concierge survey capture.
- **Main Page (`app/page.tsx`)**: Added progressive loading feedback (*"Checking 250 Canadian products..."* $\rightarrow$ *"Putting the outfit together..."*).

---

## [1.0.0] - 2026-09-20

### 🚀 Initial Production Release (Milestone v1.0.0)

Style Advisor MVP is officially completed and locked at **v1.0.0**, delivering an end-to-end Zero-Hallucination AI styling platform.
