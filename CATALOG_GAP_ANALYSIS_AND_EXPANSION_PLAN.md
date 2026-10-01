# Catalog Gap Analysis & Product Expansion Proposal

## 1. Executive Summary

This document provides a comprehensive audit of the Style Advisor garment catalog (`data/catalog.json`, 98 total items) and details the architectural gaps in product distribution across **Slots**, **Genders**, **Seasonal Color Palettes**, and **Formality Tiers**.

It outlines a concrete product expansion plan proposing **+55 target garments** to eliminate recommendation loops, ensure robust diversity during interactive nudges (*"A bit too formal"*, *"A bit too casual"*, *"Just not my style"*), and guarantee balanced coverage for both men's and women's wardrobes across all 4 color seasons.

---

## 2. Current Catalog Inventory Audit (98 Items)

### 2.1 Distribution by Garment Slot
| Slot | Count | % of Catalog | Assessment |
| :--- | :---: | :---: | :--- |
| **Top** | 30 | 30.6% | Good base, needs casual & formal extremes |
| **Bottom** | 15 | 15.3% | 🚨 **Severe Bottleneck** (Insufficient for Flow B 15-piece capsule) |
| **Outerwear** | 25 | 25.5% | Heavy winter parkas over-represented; light blazers scarce |
| **Shoes** | 19 | 19.4% | Skewed towards winter/boots; needs summer loafers & white sneakers |
| **Accessory** | 9 | 9.2% | 🚨 **Severe Bottleneck** (Lacks formal belts & structured bags) |
| **Total** | **98** | **100%** | |

---

### 2.2 Gender Distribution & Coverage Matrix
| Category | Men Exclusive | Women Exclusive | Unisex | Effective Men Pool | Effective Women Pool |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Top** | 18 | 6 | 6 | **24** | **12** (⚠️ Low) |
| **Bottom** | 7 | 5 | 3 | **10** (⚠️ Low) | **8** (🚨 Critical) |
| **Outerwear** | 10 | 3 | 12 | **22** | **15** |
| **Shoes** | 12 | 2 | 5 | **17** | **7** (🚨 Critical) |
| **Accessory** | 0 | 2 | 7 | **7** | **9** |
| **Total Pool** | **47** | **18** | **33** | **80** | **51** |

> **Key Finding:** Women's catalog coverage is significantly constrained, particularly in Bottoms (8 items) and Shoes (7 items), leading to immediate recommendation exhaustion.

---

### 2.3 Seasonal Color Palette Matrix
| Garment Slot | Winter Palette | Autumn Palette | Summer Palette | Spring Palette |
| :--- | :---: | :---: | :---: | :---: |
| **Top** | 19 | 18 | 5 | 7 |
| **Bottom** | 11 | 9 | 6 | 5 |
| **Outerwear** | 21 | 19 | 5 | 4 |
| **Shoes** | 14 | 15 | 10 | 12 |
| **Accessory** | 5 | 6 | 2 | 2 |
| **Total Matches** | **70** | **67** | **28** (🚨 -60%) | **30** (🚨 -57%) |

> **Key Finding:** The catalog heavily favors dark/earth tones (**Winter: 70, Autumn: 67**). Users mapped to **Summer (28)** or **Spring (30)** experience limited options and repetitive suggestions.

---

### 2.4 Formality Score Distribution (Scale 1–10)
* **Casual (1 – 4):** 12 items (12.2%)
* **Smart-Casual / Business-Casual (5 – 7):** 62 items (63.3%)
* **Formal / Institutional (8 – 10):** 24 items (24.5%)

```
[ Casual: 1-4 ]       ██ (12 items - 12%)
[ Smart-Casual: 5-7 ] ██████████ (62 items - 63%)
[ Formal: 8-10 ]      ████ (24 items - 25%)
```

---

## 3. Root Cause Analysis: Why Errors & Repetitions Occur

1. **"Universal Wildcard" Metadata:**
   When an item is tagged with all 4 seasons (`winter, autumn, summer, spring`) and multiple broad occasions, it captures maximum bonus points (+4 palette bonus, +3 occasion bonus, formality proximity) on every run, dominating over specialized garments.
2. **Bottoms Scarcity for Flow B:**
   Flow B (15-Piece Modular Capsule) requires **4 distinct bottoms** (2 tailored/formal + 2 casual/denim). With only 10 total bottoms for men and 8 for women, filtering by budget and palette leaves almost zero combinatorial headroom.
3. **Casual Tier Depletion:**
   When users select casual scenarios (*Weekend Commute*, *Creative Studio*) or click *"A bit too casual"*, the system exhausts the 12 casual items and is forced to fall back to semi-formal items (e.g., suit pants).

---

## 4. Proposed Catalog Expansion Plan (+55 Target Items)

To achieve stable combinatorial diversity and satisfy algorithmic scoring requirements, we recommend adding **55 curated garments** across Canadian premium brands (*Kotn, Frank And Oak, RW&CO, Club Monaco, Naked & Famous, Simons, Lululemon*).

```
                  ┌───────────────────────────────────────────────┐
                  │    PROPOSED EXPANSION TARGET: +55 GARMENTS    │
                  └──────────────────────┬────────────────────────┘
         ┌──────────────────┬────────────┴───────┬──────────────────┐
         ▼                  ▼                    ▼                  ▼
    1. BOTTOMS         2. TOPS              3. ACCESSORIES      4. SHOES & OUTERWEAR
   (+18 items)        (+14 items)          (+11 items)          (+12 items)
```

---

### 4.1 Category 1: Bottoms (+18 Garments)

#### Men (+10 items)
* **4x Denim & Casual Pants (Formality 2–4):**
  * Kotn Essential Selvedge Denim (Raw Indigo, Formality 3, Autumn/Winter)
  * Naked & Famous Left Hand Twill Jeans (Light Wash, Formality 2, Spring/Summer)
  * Frank And Oak Cotton Twill Utility Chino (Khaki, Formality 4, Spring/Autumn)
  * RW&CO Relaxed Washed Canvas Pant (Olive, Formality 3, Autumn)
* **3x Tailored Trousers (Formality 6–8):**
  * Club Monaco Connor Linen-Cotton Trouser (Sand, Formality 6, Spring/Summer)
  * Kotn Pleated Cotton-Linen Dress Pant (Ecru, Formality 7, Spring/Summer)
  * RW&CO Travel Wool Stretch Dress Pant (Navy, Formality 8, Winter/Autumn)
* **3x Commute & Smart Joggers (Formality 4–5):**
  * Lululemon Commission Classic-Fit Pant (Iron Blue, Formality 5, All-Season)
  * Frank And Oak Fluid Drawstring Tapered Pant (Charcoal, Formality 4, Winter)
  * Reigning Champ Midweight French Terry Sweatpant (Heather Grey, Formality 2, Casual)

#### Women (+8 items)
* **3x Wide-Leg & Tailored Trousers:**
  * Club Monaco Wide-Leg Fluid Linen Pant (Cream, Formality 6, Spring/Summer)
  * RW&CO High-Waisted Pleated Tailored Pant (Black, Formality 8, Winter)
  * Kotn Lyocell Drape Pant (Sage Green, Formality 5, Spring/Summer)
* **3x Casual Denim & Everyday Bottoms:**
  * Naked & Famous Classic Straight Jeans (Mid-Blue, Formality 3, All-Season)
  * Frank And Oak Organic Cotton Barrel Leg Jeans (Off-White, Formality 3, Spring)
  * Lululemon SmoothPath High-Rise Pant (Bone, Formality 4, Spring/Summer)
* **2x Skirts / Midi Pieces:**
  * Simons Pleated Crepe Midi Skirt (Navy, Formality 7, All-Season)
  * Club Monaco Linen Wrap A-Line Skirt (Terracotta, Formality 5, Autumn/Summer)

---

### 4.2 Category 2: Tops (+14 Garments)

* **6x Casual T-Shirts & Knits (Formality 2–4):**
  * Kotn Heavyweight Organic Cotton Crewneck (White, Sand, Sage — 3 items)
  * Reigning Champ Ringspun Cotton Pocket Tee (Black, Formality 2, Winter)
  * Frank And Oak Waffle-Knit Long Sleeve (Navy, Formality 4, Autumn/Winter)
  * Simons Relaxed Modal-Blend Breton Stripe Tee (Formality 3, Spring/Summer)
* **5x Spring & Summer Shirts (Formality 5–7):**
  * Club Monaco Camp-Collar Linen Shirt (Sky Blue, Formality 5, Summer)
  * Kotn Oxford Cotton Resort Shirt (Warm Clay, Formality 5, Spring/Autumn)
  * Frank And Oak Tencel Button-Up Shirt (Sage, Formality 6, Spring/Summer)
  * RW&CO Short-Sleeve Linen Blend Shirt (Ecru Stripe, Formality 5, Summer)
  * Simons Printed Silk-Cotton Lightweight Shirt (Formality 6, Summer)
* **3x Crisp Formal Dress Shirts (Formality 8–9):**
  * RW&CO Tailored Non-Iron Poplin Dress Shirt (Crisp White, Formality 8, All-Season)
  * Club Monaco Slim French-Cuff Dress Shirt (Light Blue Micro-Stripe, Formality 9)
  * Frank And Oak Fine Twill Organic Cotton Dress Shirt (Formality 8, All-Season)

---

### 4.3 Category 3: Accessories (+11 Garments)

* **3x Leather Belts (Formality 6–8):**
  * Roots Heritage Italian Vegetable Tanned Leather Belt (Cognac Tan, Formality 6)
  * RW&CO Reversible Matte Leather Dress Belt (Black/Brown, Formality 8)
  * Club Monaco Suede Feather-Edge Belt (Charcoal, Formality 6)
* **4x Bags & Briefcases (Formality 4–8):**
  * Want Les Essentiels O'Hare Canvas Shopper Tote (Navy/Black, Formality 6)
  * Roots Small Banff Leather Duffle / Commute Bag (Formality 5)
  * Monos Metro Tech Folio / Messenger Bag (Carbon, Formality 7)
  * Kotn Heavyweight Organic Canvas Daily Tote (Natural, Formality 3)
* **4x Scarves & Eyewear:**
  * Simons 100% Cashmere Ribbed Scarf (Camel, Formality 7, Winter)
  * Frank And Oak Merino Tonal Blanket Scarf (Formality 6)
  * 2x Classic Acetate Sunglasses (Tortoise & Black, Formality 5)

---

### 4.4 Category 4: Shoes & Outerwear (+12 Garments)

#### Shoes (+6 items)
* **3x Minimalist White & Casual Sneakers (Formality 3–4):**
  * Vessi Weekend Waterproof Court Sneaker (Bright White, Spring/Summer)
  * Veja / Simons Low-Top Clean Leather Sneaker (Chalk / Raw Rubber)
  * Kotn Minimalist Canvas Deck Sneaker (Natural)
* **2x Loafers & Summer Footwear (Formality 6–7):**
  * Club Monaco Suede Penny Loafers (Sand / Taupe, Formality 7, Spring/Summer)
  * RW&CO Belgian Loafer in Smooth Calfskin (Deep Espresso, Formality 7)
* **1x Dress Boots (Formality 8):**
  * Roots Classic Chelsea Boot in Burnished Black Leather (Formality 8)

#### Outerwear (+6 items)
* **3x Transitional Lightweight Jackets & Overshirts (Formality 4–6):**
  * Kotn Twill Chore Jacket (Warm Sand, Formality 5, Spring/Autumn)
  * Frank And Oak Skyline Reversible Bomber (Olive, Formality 4)
  * Club Monaco Linen Overshirt (Sage Stone, Formality 5, Summer/Spring)
* **3x Women's Tailored Blazers & Trench Coats (Formality 6–8):**
  * RW&CO Double-Breasted Boyfriend Blazer (Taupe, Formality 7, Autumn/Spring)
  * Frank And Oak Tailored Crepe Blazer (Deep Navy, Formality 8, All-Season)
  * Club Monaco Lightweight Cotton Trench Coat (Stone Khaki, Formality 7)

---

## 5. Metadata Tagging & Scorer Best Practices

1. **Avoid 4-Season Wildcards:**
   Except for true neutral accessories (e.g., black leather belt, titanium watch), no garment should be tagged with all 4 seasons (`winter, autumn, summer, spring`). Assign specific season pairings based on fabric weight and color temperature (e.g., *Spring/Summer* for Linen; *Fall/Winter* for Heavy Knit Wool).
2. **Strict Occasion Boundaries:**
   Prevent formal suiting items from containing casual tags like `weekend`, `family`, or `casual-dining` to avoid out-of-context recommendations.
3. **Brand & Style Diversity Penalties:**
   Maintain the `-50` exclusion penalty for previously displayed items across nudge cycles to ensure newly injected products rotate smoothly into the user's viewport.

---

## 6. Expected Results & Algorithmic Impact

| Metric | Current State | Target Post-Expansion |
| :--- | :---: | :---: |
| **Total Catalog Size** | 98 items | **153 items** |
| **Minimum Items per Slot** | 9 (Accessory) | **20+ items** |
| **Summer / Spring Palette Depth** | 28–30 items | **60+ items** |
| **Casual Tier Items (1–4)** | 12 items | **35+ items** |
| **Nudge Rotation Depth** | 1–2 variants before looping | **4–6 unique full outfits** |
