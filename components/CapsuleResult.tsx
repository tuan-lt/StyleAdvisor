"use client";

import React, { useState, useMemo } from "react";
import { Garment, GarmentSlot } from "../types/catalog";
import rawCatalog from "../data/catalog.json";

const catalog = rawCatalog as Garment[];

interface CapsuleResultProps {
  ownedItemIds: string[];
  onToggleOwned: (garmentId: string) => void;
  onAddToCart: (garment: Garment) => void;
  onAddAllToCart: (garments: Garment[]) => void;
  cartItemIds: string[];
  onBackToEdit: () => void;
  onReplanCapsule?: () => void;
  isReplanning?: boolean;
}

export function CapsuleResult({
  ownedItemIds,
  onToggleOwned,
  onAddToCart,
  onAddAllToCart,
  cartItemIds,
  onBackToEdit,
  onReplanCapsule,
  isReplanning,
}: CapsuleResultProps) {
  const [activeCombinationIndex, setActiveCombinationIndex] = useState<number>(0);
  const [filterSlot, setFilterSlot] = useState<string>("all");

  // Select 15 modular foundation items from the Canadian catalog (5 Tops, 4 Bottoms, 3 Outerwear, 2 Shoes, 1 Accessory)
  const capsule15: Garment[] = useMemo(() => {
    const tops = catalog.filter((g) => g.slot === "top").slice(0, 5);
    const bottoms = catalog.filter((g) => g.slot === "bottom").slice(0, 4);
    const outerwear = catalog.filter((g) => g.slot === "outerwear").slice(0, 3);
    const shoes = catalog.filter((g) => g.slot === "shoes").slice(0, 2);
    const accessories = catalog.filter((g) => g.slot === "accessory").slice(0, 1);
    return [...tops, ...bottoms, ...outerwear, ...shoes, ...accessories];
  }, []);

  // Starter Set of 5 Core Foundation Pieces (PRD FR-3.1)
  const starterSetIds = useMemo(() => {
    return new Set([
      capsule15.find((g) => g.slot === "outerwear")?.id || "",
      capsule15.find((g) => g.slot === "top")?.id || "",
      capsule15.find((g) => g.slot === "bottom")?.id || "",
      capsule15.find((g) => g.slot === "shoes")?.id || "",
      capsule15.find((g) => g.slot === "accessory")?.id || "",
    ].filter(Boolean));
  }, [capsule15]);

  // 3 Worked Outfits (PRD FR-3.1)
  const combinations = useMemo(() => {
    return [
      {
        id: "combo-1",
        title: "Worked Outfit 01: Hybrid Office & Client Review",
        subtitle: "Tailored structure with breathable all-day mobility",
        formality: 4,
        garments: [
          capsule15.find((g) => g.slot === "outerwear") || capsule15[5],
          capsule15.find((g) => g.slot === "top") || capsule15[0],
          capsule15.find((g) => g.slot === "bottom") || capsule15[6],
          capsule15.find((g) => g.slot === "shoes") || capsule15[12],
        ].filter(Boolean) as Garment[],
        styling_tip: "Button the blazer when entering formal rooms; pair with neutral chinos for effortless West Coast polish.",
      },
      {
        id: "combo-2",
        title: "Worked Outfit 02: Downtown Studio & Creative Standup",
        subtitle: "Minimalist drape paired with comfortable certified organic cotton",
        formality: 3,
        garments: [
          capsule15.filter((g) => g.slot === "top")[1] || capsule15[1],
          capsule15.filter((g) => g.slot === "bottom")[1] || capsule15[7],
          capsule15.find((g) => g.slot === "shoes") || capsule15[12],
          capsule15.find((g) => g.slot === "accessory") || capsule15[14],
        ].filter(Boolean) as Garment[],
        styling_tip: "Clean tonal layering allows easy movement between morning school runs and afternoon coworking spaces.",
      },
      {
        id: "combo-3",
        title: "Worked Outfit 03: Weekend Commute & Offsite",
        subtitle: "Weatherproof protection with sleek minimalist lines",
        formality: 2,
        garments: [
          capsule15.filter((g) => g.slot === "outerwear")[1] || capsule15[10],
          capsule15.filter((g) => g.slot === "top")[2] || capsule15[2],
          capsule15.filter((g) => g.slot === "bottom")[2] || capsule15[8],
          capsule15.filter((g) => g.slot === "shoes")[1] || capsule15[13],
        ].filter(Boolean) as Garment[],
        styling_tip: "Waterproof footwear keeps you dry in coastal drizzle without sacrificing refined silhouettes.",
      },
    ];
  }, [capsule15]);

  const activeCombo = combinations[activeCombinationIndex];

  // Filter grid items
  const filteredGrid = useMemo(() => {
    return capsule15.filter((g) => {
      if (filterSlot === "all") return true;
      if (filterSlot === "starter") return starterSetIds.has(g.id);
      return g.slot === filterSlot;
    });
  }, [capsule15, filterSlot, starterSetIds]);

  const unownedCapsuleItems = capsule15.filter((g) => !ownedItemIds.includes(g.id));
  const fullCapsuleTotal = capsule15.reduce((sum, g) => sum + (g.price_cad || g.price || 0), 0);
  const unownedCapsuleTotal = unownedCapsuleItems.reduce((sum, g) => sum + (g.price_cad || g.price || 0), 0);

  const starterSetItems = capsule15.filter((g) => starterSetIds.has(g.id));
  const starterSetTotal = starterSetItems.reduce((sum, g) => sum + (g.price_cad || g.price || 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          type="button"
          onClick={onBackToEdit}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>←</span> Back to Fitting Profile
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted font-mono">15-Piece Capsule Matrix</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-verified/15 text-verified font-bold">
            12+ Outfit Variations
          </span>
        </div>
      </div>

      {/* 1. Serif Headline & Lifestyle Reasoning Paragraph (PRD FR-3.1) */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-4 shadow-fitting-card">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-widest text-thread">
            Wardrobe Architecture
          </div>
          <span className="text-[11px] font-mono text-ink-muted bg-surface px-2 py-0.5 rounded border border-border">
            Newsreader Serif
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-ink font-medium">
          The Modular Vancouver Capsule
        </h1>
        <p className="font-serif text-[18px] sm:text-[19px] text-ink leading-relaxed italic">
          &ldquo;Translating hybrid office requirements and unpredictable coastal climates into an interconnected 15-piece matrix. By standardizing tonal undertones across Canadian tailoring and technical knits, any single top coordinates with every single bottom, eliminating morning decision fatigue.&rdquo;
        </p>
      </div>

      {/* 2. Three Worked Outfits Carousel / Tabs (PRD FR-3.1) */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg overflow-hidden shadow-fitting-raised">
        <div className="p-5 sm:p-6 border-b border-border bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-thread">Demonstration Outfits</div>
            <h2 className="text-xl font-serif text-ink mt-0.5 font-medium">3 Ready-to-Wear Combinations</h2>
          </div>
          <div className="flex gap-1.5 bg-surface p-1 rounded-fitting border border-border">
            {combinations.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCombinationIndex(idx)}
                className={`py-1.5 px-3 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeCombinationIndex === idx
                    ? "bg-accent text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Look 0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Active Worked Outfit Breakdown */}
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-medium text-ink">{activeCombo.title}</h3>
            <p className="text-xs text-ink-muted">{activeCombo.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activeCombo.garments.map((garment) => {
              const isOwned = ownedItemIds.includes(garment.id);
              return (
                <div
                  key={garment.id}
                  className={`p-3 rounded-fitting border transition-all flex flex-col justify-between ${
                    isOwned ? "bg-surface/50 opacity-70 border-dashed border-border" : "bg-surface/30 border-border"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="aspect-3/4 rounded bg-surface border border-border overflow-hidden relative">
                      <img src={garment.image_url} alt={garment.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 text-[9px] uppercase font-bold bg-accent text-white px-1 rounded">
                        {garment.slot}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-thread">{garment.brand}</div>
                      <div className="text-xs font-serif font-medium text-ink line-clamp-1">{garment.name}</div>
                      <div className="text-xs font-bold text-ink font-mono mt-0.5">
                        ${(garment.price_cad || garment.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <label className="mt-3 pt-2 border-t border-border/60 flex items-center gap-1.5 text-[11px] text-ink-muted cursor-pointer hover:text-ink">
                    <input
                      type="checkbox"
                      checked={isOwned}
                      onChange={() => {
                        onToggleOwned(garment.id);
                        if (onReplanCapsule) onReplanCapsule();
                      }}
                      className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent"
                    />
                    <span>{isOwned ? "Owned" : "I have this"}</span>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="bg-surface/60 border border-border rounded-fitting p-3.5 flex items-start gap-2.5 text-xs text-ink-muted">
            <span className="text-thread font-bold">Styling Note:</span>
            <span>{activeCombo.styling_tip}</span>
          </div>
        </div>
      </div>

      {/* 3. 15-Item Interactive Grid with Starter Set of 5 Highlight (PRD FR-3.1) */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-raised">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-thread">Capsule Inventory</span>
              <span className="text-xs px-2 py-0.5 rounded bg-surface border border-border text-ink-muted font-mono">
                15 Items
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-ink mt-0.5 font-medium">
              Coordinated Capsule Grid
            </h2>
          </div>

          {/* Running Totals with Starter Set of 5 Highlights */}
          <div className="flex flex-wrap items-center gap-4 text-right">
            <div className="bg-surface border border-border rounded-fitting px-3 py-2 text-left">
              <div className="text-[11px] font-bold text-thread uppercase tracking-wider">Starter Set of 5</div>
              <div className="text-sm font-bold text-ink font-mono">${starterSetTotal.toFixed(2)} CAD</div>
            </div>
            <div className="bg-surface border border-border rounded-fitting px-3 py-2 text-left">
              <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                {unownedCapsuleItems.length < 15 ? `Remaining (${unownedCapsuleItems.length})` : "Full 15-Piece Total"}
              </div>
              <div className="text-sm font-bold text-ink font-mono">${unownedCapsuleTotal.toFixed(2)} CAD</div>
            </div>
            <button
              type="button"
              onClick={() => onAddAllToCart(unownedCapsuleItems)}
              disabled={unownedCapsuleItems.length === 0}
              className="py-2.5 px-4 rounded-fitting bg-accent hover:bg-navy-light text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-40 cursor-pointer"
            >
              {unownedCapsuleItems.length === 0 ? "Wardrobe Covers This" : `Add All to Cart (${unownedCapsuleItems.length})`}
            </button>
          </div>
        </div>

        {/* Slot Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All 15 Pieces" },
            { id: "starter", label: "★ Starter Set of 5" },
            { id: "outerwear", label: "Outerwear (3)" },
            { id: "top", label: "Tops (5)" },
            { id: "bottom", label: "Bottoms (4)" },
            { id: "shoes", label: "Shoes (2)" },
            { id: "accessory", label: "Accessories (1)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterSlot(tab.id)}
              className={`py-1.5 px-3 rounded-fitting text-xs font-medium border transition-all cursor-pointer ${
                filterSlot === tab.id
                  ? "bg-accent text-white border-accent shadow-xs"
                  : "bg-surface border-border text-ink-muted hover:border-thread/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid of Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredGrid.map((garment) => {
            const isOwned = ownedItemIds.includes(garment.id);
            const isInCart = cartItemIds.includes(garment.id);
            const isStarter = starterSetIds.has(garment.id);

            return (
              <div
                key={garment.id}
                className={`p-3.5 rounded-fitting border transition-all flex flex-col justify-between ${
                  isOwned
                    ? "bg-surface/40 border-dashed border-border opacity-65"
                    : isStarter
                    ? "bg-surface-raised border-thread/50 shadow-xs ring-1 ring-thread/20"
                    : "bg-surface-raised border-border hover:border-accent/40"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="aspect-3/4 rounded bg-surface border border-border overflow-hidden relative">
                    <img src={garment.image_url} alt={garment.name} className="w-full h-full object-cover" />
                    {isStarter && (
                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-thread text-white px-1.5 py-0.5 rounded shadow-xs">
                        Starter 5
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] uppercase font-bold bg-accent text-white px-1 rounded">
                      {garment.slot}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-thread tracking-wider">{garment.brand}</div>
                    <h4 className="text-xs font-serif font-medium text-ink line-clamp-2 mt-0.5">{garment.name}</h4>
                    <div className="text-xs font-bold text-ink font-mono mt-1">
                      ${(garment.price_cad || garment.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/70 space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-ink-muted cursor-pointer hover:text-ink">
                    <input
                      type="checkbox"
                      checked={isOwned}
                      onChange={() => {
                        onToggleOwned(garment.id);
                        if (onReplanCapsule) onReplanCapsule();
                      }}
                      className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent"
                    />
                    <span>{isOwned ? "I have this" : "I have this"}</span>
                  </label>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <a
                      href={garment.retailer_url || garment.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-thread hover:underline"
                    >
                      Store ↗
                    </a>
                    {!isOwned && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(garment)}
                        disabled={isInCart}
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          isInCart
                            ? "bg-verified/15 text-verified"
                            : "bg-surface border border-border text-ink hover:border-accent"
                        }`}
                      >
                        {isInCart ? "✓" : "+ Cart"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
