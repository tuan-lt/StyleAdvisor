"use client";

import React, { useState } from "react";
import { Garment, RecommendApiResponse, GarmentSlot, NudgeType } from "../types/catalog";

interface OccasionResultProps {
  data: NonNullable<RecommendApiResponse["data"]>;
  onNudge: (nudgeType: NudgeType) => void;
  onToggleOwned: (garmentId: string) => void;
  ownedItemIds: string[];
  onAddToCart: (garment: Garment) => void;
  onAddAllToCart: (garments: Garment[]) => void;
  cartItemIds: string[];
  onBackToEdit: () => void;
  isNudging?: boolean;
}

export function OccasionResult({
  data,
  onNudge,
  onToggleOwned,
  ownedItemIds,
  onAddToCart,
  onAddAllToCart,
  cartItemIds,
  onBackToEdit,
  isNudging,
}: OccasionResultProps) {
  const [showNudgeOptions, setShowNudgeOptions] = useState<boolean>(false);
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<GarmentSlot | null>(null);

  const { calibration, interpretation_summary, selected_garments, reasoning, override_applied, filter_metadata, total_price_cad } =
    data;

  const garmentList: { slot: GarmentSlot; label: string; garment?: Garment }[] = [
    { slot: "outerwear" as const, label: "Layer / Outerwear", garment: selected_garments.outerwear },
    { slot: "top" as const, label: "Foundation Top", garment: selected_garments.top },
    { slot: "bottom" as const, label: "Tailored Bottom", garment: selected_garments.bottom },
    { slot: "shoes" as const, label: "Footwear", garment: selected_garments.shoes },
    { slot: "accessory" as const, label: "Accent / Accessory", garment: selected_garments.accessory },
  ].filter((item) => !!item.garment);

  const activeGarments = garmentList.map((g) => g.garment!) as Garment[];
  const unownedGarments = activeGarments.filter((g) => !ownedItemIds.includes(g.id));

  // Subtotal of unowned items
  const unownedSubtotal = unownedGarments.reduce((sum, g) => sum + (g.price_cad || g.price || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          type="button"
          onClick={onBackToEdit}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>←</span> Back to Fitting Profile
        </button>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Calibration Formality:</span>
          <span className="font-semibold text-ink px-2.5 py-0.5 bg-surface border border-border rounded-full font-mono">
            {calibration.formality_score || 4} / 5
          </span>
        </div>
      </div>

      {/* Visible Re-calibrating Nudge Banner */}
      {isNudging && (
        <div className="bg-accent/10 border border-accent/40 rounded-fitting p-4 flex items-center justify-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-accent">
            Re-calibrating outfit formality & tone per your nudge feedback...
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className={`space-y-8 transition-opacity duration-300 ${isNudging ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        {/* 1. AI Interpretation Line (PRD FR-2.3) */}
        <div className="bg-surface border border-border rounded-fitting p-4 sm:p-5 flex items-start gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-accent mt-1.5 shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
              AI Interpretation Line
            </div>
            <p className="text-sm sm:text-base font-medium text-ink leading-relaxed">
              &ldquo;{interpretation_summary}&rdquo;
            </p>
          </div>
        </div>

        {/* 2. Occasion Overrides & Filter Relaxation Ochre Warning Chips (PRD FR-2.5 & Section 6.2) */}
        {(override_applied || filter_metadata?.relaxed_field) && (
          <div className="bg-caution/10 border border-caution/30 rounded-fitting p-4 flex items-start gap-3">
            <span className="text-caution font-bold text-base leading-none mt-0.5">⚠️</span>
            <div className="text-xs text-caution leading-relaxed space-y-1">
              <span className="font-bold">Stylist Protocol Notice: </span>
              {typeof override_applied === "string" ? (
                <span>{override_applied}</span>
              ) : override_applied ? (
                <span>You picked a bold personal style. For high-stakes decorum, we have kept the silhouette modern but the colours quiet.</span>
              ) : null}
              {filter_metadata?.relaxed_field === "palette" && (
                <div>We relaxed your palette to universal Canadian neutrals to ensure zero empty slots.</div>
              )}
              {filter_metadata?.relaxed_field === "style" && (
                <div>We relaxed your style to Classic/Minimalist staples to find this.</div>
              )}
            </div>
          </div>
        )}

        {/* 3. Stated Reasoning Block (Newsreader Serif 18px - PRD FR-2.5) */}
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-3 shadow-fitting-card">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-widest text-thread">Stylist Rationale</div>
            <span className="text-[11px] font-mono text-ink-muted bg-surface px-2 py-0.5 rounded border border-border">
              Newsreader Serif 18px
            </span>
          </div>
          <p className="font-serif text-[18px] sm:text-[20px] text-ink leading-relaxed italic">
            &ldquo;{reasoning}&rdquo;
          </p>
        </div>

        {/* 4. Single Decisive Outfit Recommendation (PRD FR-2.4) */}
        <div className="bg-surface-raised border border-border rounded-fitting-lg overflow-hidden shadow-fitting-raised">
          {/* Card Header */}
          <div className="p-5 sm:p-6 border-b border-border bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-verified/15 text-verified text-xs font-bold uppercase tracking-wider">
                  <span>✓</span> Verified Canadian Catalog
                </span>
                <span className="text-xs text-ink-muted">Zero Hallucinations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-ink mt-1 font-medium">Exactly One Complete Outfit</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-ink-muted">
                  {unownedGarments.length < activeGarments.length ? "Remaining Gaps (CAD)" : "Total Outfit (CAD)"}
                </div>
                <div className="text-xl font-bold text-ink font-mono tabular-nums">
                  ${unownedSubtotal.toFixed(2)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAddAllToCart(unownedGarments)}
                disabled={unownedGarments.length === 0}
                className="py-2.5 px-4 rounded-fitting bg-accent hover:bg-navy-light text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-40 cursor-pointer"
              >
                {unownedGarments.length === 0 ? "You're Ready. Wear what you have." : `Add Unowned to Cart (${unownedGarments.length})`}
              </button>
            </div>
          </div>

          {/* Garments Breakdown List */}
          <div className="divide-y divide-border">
            {garmentList.map(({ slot, label, garment }) => {
              if (!garment) return null;
              const isOwned = ownedItemIds.includes(garment.id);
              const isInCart = cartItemIds.includes(garment.id);
              const isSelected = selectedSlotDetails === slot;

              return (
                <div
                  key={garment.id}
                  className={`p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isOwned ? "bg-surface/50 opacity-70" : "bg-surface-raised hover:bg-surface/30"
                  }`}
                >
                  {/* Left: Product Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-20 bg-surface rounded border border-border overflow-hidden shrink-0 relative flex items-center justify-center">
                      <img
                        src={garment.image_url}
                        alt={garment.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] uppercase font-bold bg-accent text-white px-1 rounded">
                        {slot.slice(0, 3)}
                      </span>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-thread">
                          {label}
                        </span>
                        <span className="text-xs text-ink-muted">· {garment.brand}</span>
                      </div>
                      <h3 className="text-base font-serif font-medium text-ink">
                        {garment.name}
                      </h3>
                      <div className="text-xs text-ink-muted flex flex-wrap items-center gap-3">
                        <span>{typeof garment.fabric === "string" ? garment.fabric : garment.fabric.composition}</span>
                        {garment.size_range && (
                          <span className="text-ink-muted/80">({garment.size_range})</span>
                        )}
                        <span className="font-bold text-ink font-mono tabular-nums">
                          ${(garment.price_cad || garment.price || 0).toFixed(2)} CAD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & "I Already Have This" Interaction (PRD FR-2.7) */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    {/* "I Have This" Checkbox */}
                    <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer hover:text-ink select-none">
                      <input
                        type="checkbox"
                        checked={isOwned}
                        onChange={() => onToggleOwned(garment.id)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                      />
                      <span className={isOwned ? "font-semibold text-verified" : ""}>
                        {isOwned ? "I have this" : "I have this"}
                      </span>
                    </label>

                    {/* Direct Retailer Link */}
                    <a
                      href={garment.retailer_url || garment.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-thread hover:underline flex items-center gap-0.5"
                    >
                      <span>Store</span>
                      <span className="text-[10px]">↗</span>
                    </a>

                    {/* Add to Cart Button */}
                    {!isOwned && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(garment)}
                        disabled={isInCart}
                        className={`py-1.5 px-3 rounded-fitting text-xs font-medium transition-all ${
                          isInCart
                            ? "bg-verified/15 text-verified border border-verified/30"
                            : "bg-surface border border-border text-ink hover:border-accent"
                        }`}
                      >
                        {isInCart ? "✓ In Cart" : "+ Cart"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Dislike Recovery (The Nudge) - Placed BELOW outfit per PRD FR-2.6 */}
        <div className="bg-surface-raised border border-border rounded-fitting p-5 text-center space-y-3 shadow-fitting-card">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowNudgeOptions(!showNudgeOptions)}
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors underline underline-offset-4 cursor-pointer"
            >
              Not quite right?
            </button>
          </div>

          {showNudgeOptions && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNudge("too_formal")}
                className="py-2 px-4 rounded-fitting bg-surface border border-border hover:border-accent text-xs font-semibold text-ink transition-all cursor-pointer"
              >
                [Too formal]
              </button>
              <button
                type="button"
                onClick={() => onNudge("too_casual")}
                className="py-2 px-4 rounded-fitting bg-surface border border-border hover:border-accent text-xs font-semibold text-ink transition-all cursor-pointer"
              >
                [Too casual]
              </button>
              <button
                type="button"
                onClick={() => onNudge("not_me")}
                className="py-2 px-4 rounded-fitting bg-surface border border-border hover:border-accent text-xs font-semibold text-ink transition-all cursor-pointer"
              >
                [Not me]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
