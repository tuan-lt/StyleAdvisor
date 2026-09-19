"use client";

import React, { useState } from "react";
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

  // Define Starter Set of 5 Core Canadian Staples
  const starterSetIds = new Set([
    "aritzia-agency-blazer-wool",
    "kotn-oxford-button-down",
    "lululemon-abc-slim-pant",
    "vessi-cityscape-waterproof-sneaker",
    "kotn-ribbed-merino-scarf",
  ]);

  // Curate 3 Worked Outfit Combinations from Catalog
  const combinations = [
    {
      id: "combo-1",
      title: "Combination 01: Executive Pitch & Venture Board",
      subtitle: "Tailored authority with subtle West Coast ease",
      formality: 8,
      garment_ids: [
        "rwco-wool-blend-overcoat",
        "kotn-oxford-button-down",
        "lululemon-abc-slim-pant",
        "vessi-cityscape-waterproof-sneaker",
      ],
      styling_tip: "Fasten the topcoat button when standing; unbutton for a confident seated pitch.",
    },
    {
      id: "combo-2",
      title: "Combination 02: Daily Studio & Creative Strategy",
      subtitle: "Comfortable high-density knitwear and sharp architectural drape",
      formality: 6,
      garment_ids: [
        "aritzia-agency-blazer-wool",
        "kotn-heavyweight-essential-tee",
        "aritzia-effortless-pant",
        "vessi-cityscape-waterproof-sneaker",
        "kotn-ribbed-merino-scarf",
      ],
      styling_tip: "Loop the merino scarf loosely to add warm camel texture against dark monochrome trousers.",
    },
    {
      id: "combo-3",
      title: "Combination 03: Modern Tech Commute & Offsite",
      subtitle: "All-weather water resistance with sleek minimalist tailoring",
      formality: 5,
      garment_ids: [
        "lululemon-sojourn-jacket",
        "lululemon-evolution-polo",
        "rwco-tailored-stretch-chino",
        "vessi-cityscape-waterproof-sneaker",
      ],
      styling_tip: "Designed for variable Pacific weather — 100% waterproof shoes with four-way stretch chinos.",
    },
  ];

  // Helper map
  const catalogMap = new Map<string, Garment>(catalog.map((g) => [g.id, g]));

  // Active combo garments
  const activeCombo = combinations[activeCombinationIndex];
  const activeComboGarments = activeCombo.garment_ids
    .map((id) => catalogMap.get(id))
    .filter((g): g is Garment => !!g);

  // Filter grid items
  const filteredGrid = catalog.filter((g) => {
    if (filterSlot === "all") return true;
    if (filterSlot === "starter") return starterSetIds.has(g.id);
    return g.slot === filterSlot;
  });

  const unownedStarterCount = Array.from(starterSetIds).filter((id) => !ownedItemIds.includes(id)).length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          type="button"
          onClick={onBackToEdit}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Fitting Profile
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Owned Items in Capsule:</span>
          <span className="text-xs font-bold text-moss px-2 py-0.5 bg-moss/10 rounded-full border border-moss/20">
            {ownedItemIds.length} Owned
          </span>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-3 shadow-fitting-card">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-accent text-white text-[11px] font-bold uppercase tracking-wider">
            Flow B
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-thread">
            15-Piece Modular Capsule Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-ink font-normal">
          The 3 Worked Combinations
        </h1>
        <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
          3 distinct formality calibrations constructed from a unified Canadian wardrobe matrix. Toggling{" "}
          <strong className="text-ink font-semibold">&ldquo;I already have this&rdquo;</strong> will dynamically re-balance the remaining unowned pieces.
        </p>
      </div>

      {/* PART 1: The 3 Worked Outfit Combinations */}
      <div className="space-y-6">
        {/* Tab Nav for Combinations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {combinations.map((combo, idx) => (
            <button
              key={combo.id}
              type="button"
              onClick={() => setActiveCombinationIndex(idx)}
              className={`p-4 rounded-fitting text-left border transition-all ${
                activeCombinationIndex === idx
                  ? "bg-surface border-accent shadow-sm ring-1 ring-accent"
                  : "bg-surface-raised border-border hover:border-thread/50"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-thread">
                Look 0{idx + 1} • Formality {combo.formality}/10
              </div>
              <div className="text-sm font-serif font-medium text-ink mt-1 truncate">{combo.title.split(":")[1] || combo.title}</div>
              <div className="text-xs text-ink-muted mt-1 truncate">{combo.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Active Combination Card */}
        <div className="bg-surface-raised border border-border rounded-fitting-lg overflow-hidden shadow-fitting-raised">
          <div className="p-5 sm:p-6 border-b border-border bg-surface/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent">Active Ensemble</div>
              <h2 className="text-xl font-serif text-ink font-medium">{activeCombo.title}</h2>
              <p className="text-xs text-ink-muted mt-0.5">{activeCombo.styling_tip}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                onAddAllToCart(activeComboGarments.filter((g) => !ownedItemIds.includes(g.id)))
              }
              className="py-2 px-4 rounded-fitting bg-accent hover:bg-accent/90 text-white text-xs font-semibold tracking-wide transition-all"
            >
              Add Unowned Items to Cart
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {activeComboGarments.map((garment) => {
              const isOwned = ownedItemIds.includes(garment.id);
              const inCart = cartItemIds.includes(garment.id);
              const isStarter = starterSetIds.has(garment.id);

              return (
                <div
                  key={garment.id}
                  className={`p-4 flex flex-col justify-between space-y-4 ${
                    isOwned ? "bg-surface/60 opacity-80" : "bg-surface-raised"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-3/4 rounded-fitting overflow-hidden bg-surface border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={garment.image_url}
                        alt={garment.name}
                        className="w-full h-full object-cover"
                      />
                      {isStarter && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-thread text-white text-[10px] font-bold uppercase tracking-wider">
                          Starter Set
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        {garment.slot} • {garment.brand}
                      </div>
                      <h3 className="text-sm font-serif font-medium text-ink mt-0.5">{garment.name}</h3>
                      <div className="text-xs font-semibold text-ink mt-1">${garment.price} CAD</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleOwned(garment.id);
                        if (onReplanCapsule) onReplanCapsule();
                      }}
                      className={`w-full py-1.5 px-2 rounded-fitting text-xs border transition-all ${
                        isOwned
                          ? "bg-moss/10 border-moss text-moss font-semibold"
                          : "bg-surface border-border text-ink-muted hover:text-ink"
                      }`}
                    >
                      {isOwned ? "✓ Owned" : "I Have This"}
                    </button>
                    {!isOwned && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(garment)}
                        className={`w-full py-1.5 px-2 rounded-fitting text-xs font-medium transition-all ${
                          inCart
                            ? "bg-verified text-white"
                            : "bg-surface border border-border hover:bg-accent hover:text-white text-ink"
                        }`}
                      >
                        {inCart ? "In Cart ✓" : "+ Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PART 2: The 15-Item Modular Grid & Starter Set of 5 Highlights */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-thread">Full Inventory</span>
              <span className="text-xs text-ink-muted">
                • {unownedStarterCount} Unowned in Starter Set
              </span>
            </div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-1">Modular Wardrobe Matrix</h2>
          </div>

          {/* Slot Filters */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Items (12)" },
              { id: "starter", label: "Starter Set of 5 ★" },
              { id: "outerwear", label: "Outerwear" },
              { id: "top", label: "Tops" },
              { id: "bottom", label: "Bottoms" },
              { id: "shoes", label: "Footwear" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterSlot(tab.id)}
                className={`px-3 py-1.5 rounded-fitting text-xs font-medium border transition-all ${
                  filterSlot === tab.id
                    ? "bg-accent text-white border-accent shadow-xs"
                    : "bg-surface border-border text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric Re-planning Banner Notice */}
        {isReplanning && (
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-fitting text-xs text-accent flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Asymmetrically re-balancing remaining unowned garments against your capsule...</span>
          </div>
        )}

        {/* 15-Item Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGrid.map((garment) => {
            const isOwned = ownedItemIds.includes(garment.id);
            const inCart = cartItemIds.includes(garment.id);
            const isStarter = starterSetIds.has(garment.id);

            return (
              <div
                key={garment.id}
                className={`border rounded-fitting-lg p-4 flex flex-col justify-between space-y-3 transition-all ${
                  isStarter
                    ? "border-thread/50 bg-thread/5 shadow-xs"
                    : "border-border bg-surface-raised hover:border-ink/20"
                } ${isOwned ? "opacity-60 bg-surface/80" : ""}`}
              >
                <div className="space-y-2.5">
                  <div className="relative aspect-4/5 rounded-fitting overflow-hidden bg-surface border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={garment.image_url}
                      alt={garment.name}
                      className="w-full h-full object-cover"
                    />
                    {isStarter && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-thread text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        Starter Set of 5
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white font-medium backdrop-blur-xs">
                      {garment.brand}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-thread">
                      {garment.slot}
                    </div>
                    <h3 className="text-sm font-serif font-medium text-ink line-clamp-1">{garment.name}</h3>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-semibold text-ink">${garment.price} CAD</span>
                      <span className="text-ink-muted text-[11px]">{garment.color}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleOwned(garment.id);
                      if (onReplanCapsule) onReplanCapsule();
                    }}
                    className={`w-full py-1.5 px-2 rounded-fitting text-xs border transition-all ${
                      isOwned
                        ? "bg-moss/10 border-moss text-moss font-semibold"
                        : "bg-surface border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {isOwned ? "✓ I Own This" : "I Already Have This"}
                  </button>

                  {!isOwned && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(garment)}
                      className={`w-full py-1.5 px-2 rounded-fitting text-xs font-medium transition-all ${
                        inCart
                          ? "bg-verified text-white"
                          : "bg-surface border border-border hover:bg-accent hover:text-white text-ink"
                      }`}
                    >
                      {inCart ? "In Fitting Cart ✓" : "+ Add to Cart"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
