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
  const [expandedNudge, setExpandedNudge] = useState<boolean>(true);
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          type="button"
          onClick={onBackToEdit}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Fitting Profile
        </button>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Formality Score:</span>
          <span className="font-semibold text-ink px-2 py-0.5 bg-surface border border-border rounded-full">
            {calibration.formality_target} / 10
          </span>
        </div>
      </div>

      {/* Visible Re-calibrating Nudge Banner */}
      {isNudging && (
        <div className="bg-accent/10 border border-accent/40 rounded-fitting-lg p-4 flex items-center justify-center gap-3 animate-pulse shadow-xs">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-accent">
            Re-calibrating outfit formality & reasoning...
          </span>
        </div>
      )}

      {/* Main Container with opacity transition during nudging */}
      <div className={`space-y-8 transition-opacity duration-300 ${isNudging ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        {/* Interpretation Summary Header */}
        <div className="bg-surface border border-border rounded-fitting-lg p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Room Read & Calibrated Nuance</span>
          </div>
          <p className="text-sm sm:text-base font-medium text-ink leading-relaxed">
            &ldquo;{interpretation_summary}&rdquo;
          </p>
        </div>

        {/* Ochre Chip (Triggered on Override or Filter Relaxation) */}
        {(override_applied || filter_metadata.relaxed_field) && (
          <div className="bg-caution/10 border border-caution/30 rounded-fitting p-3.5 flex items-start gap-3">
            <span className="text-caution font-bold text-base leading-none mt-0.5">ⓘ</span>
            <div className="text-xs text-caution-dark leading-relaxed">
              <span className="font-semibold text-caution">Stylist Calibration Notice: </span>
              {filter_metadata.relaxed_field === "palette" &&
                "Palette constraints were automatically broadened to universal neutrals to guarantee zero inventory compromises."}
              {filter_metadata.relaxed_field === "style" &&
                "Style filter relaxed to ensure structured fit across all 4 mandatory slots without hallucinating products."}
              {override_applied &&
                "Deterministic code validation corrected 1 item to align with strict Canadian inventory availability."}
            </div>
          </div>
        )}

        {/* Editorial Reasoning Block (Rendered in Newsreader Serif 18px) */}
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-3 shadow-fitting-card">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest text-thread">Stylist Rationale</div>
            <span className="text-[11px] font-mono text-ink-muted bg-surface px-2 py-0.5 rounded border border-border">
              Newsreader Serif 18px
            </span>
          </div>
          <p className="font-serif text-[18px] sm:text-[19px] text-ink leading-relaxed italic">
            &ldquo;{reasoning}&rdquo;
          </p>
        </div>

      {/* Main Single Decisive Outfit Card */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg overflow-hidden shadow-fitting-raised">
        {/* Card Header with Verified Moss Badge */}
        <div className="p-5 sm:p-6 border-b border-border bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-verified/15 text-verified text-xs font-bold uppercase tracking-wider">
                <span className="text-xs">✓</span> Verified Fit
              </span>
              <span className="text-xs text-ink-muted">Canadian Partner Brands</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-ink mt-1 font-medium">The Calibrated Ensemble</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-ink-muted">Total Outfit (CAD)</div>
              <div className="text-xl font-semibold text-ink">${total_price_cad}</div>
            </div>
            <button
              type="button"
              onClick={() => onAddAllToCart(unownedGarments)}
              disabled={unownedGarments.length === 0}
              className="py-2.5 px-4 rounded-fitting bg-accent hover:bg-accent/90 text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-40"
            >
              {unownedGarments.length === 0 ? "All Items Owned" : `Add All to Cart (${unownedGarments.length})`}
            </button>
          </div>
        </div>

        {/* Garments Breakdown Grid */}
        <div className="divide-y divide-border">
          {garmentList.map(({ slot, label, garment }) => {
            if (!garment) return null;
            const isOwned = ownedItemIds.includes(garment.id);
            const inCart = cartItemIds.includes(garment.id);

            return (
              <div
                key={garment.id}
                className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-colors ${
                  isOwned ? "bg-surface/50 opacity-80" : "hover:bg-surface/20"
                }`}
              >
                {/* Garment Image & Basic Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-20 h-24 rounded-fitting overflow-hidden bg-surface border border-border shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={garment.image_url}
                      alt={garment.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: garment.hex_color }}
                      title={garment.color}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-thread">
                        {label}
                      </span>
                      <span className="text-[11px] text-ink-muted">• {garment.brand}</span>
                    </div>
                    <h3 className="text-base font-serif font-medium text-ink">{garment.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                      <span className="font-semibold text-ink">${garment.price} CAD</span>
                      <span>Color: {garment.color}</span>
                      <span>Fabric: {garment.fabric.composition}</span>
                    </div>

                    {/* Return Policy and Specs Accordion Trigger */}
                    <div className="pt-1 flex items-center gap-3">
                      <a
                        href={garment.product_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-accent underline hover:opacity-80"
                      >
                        View at {garment.brand} ↗
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSlotDetails(selectedSlotDetails === slot ? null : slot)
                        }
                        className="text-xs text-ink-muted hover:text-ink underline"
                      >
                        {selectedSlotDetails === slot ? "Hide Details" : "Care & Return Terms"}
                      </button>
                    </div>

                    {/* Expanded Garment Details */}
                    {selectedSlotDetails === slot && (
                      <div className="mt-3 p-3 bg-surface border border-border rounded-fitting text-xs space-y-1.5 text-ink-muted">
                        <div>
                          <strong className="text-ink">Care:</strong> {garment.fabric.care}
                        </div>
                        <div>
                          <strong className="text-ink">Returns:</strong> {garment.return_policy.policy_note}
                        </div>
                        {garment.styling_notes && (
                          <div>
                            <strong className="text-ink">Stylist Note:</strong> {garment.styling_notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: "I have this" toggle & Cart */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2.5 w-full sm:w-auto justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <button
                    type="button"
                    onClick={() => onToggleOwned(garment.id)}
                    className={`px-3 py-1.5 rounded-fitting text-xs border transition-all ${
                      isOwned
                        ? "bg-moss/10 border-moss text-moss font-semibold"
                        : "bg-surface border-border text-ink-muted hover:text-ink hover:border-thread/50"
                    }`}
                  >
                    {isOwned ? "✓ I Already Own This" : "I Already Have This"}
                  </button>

                  {!isOwned && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(garment)}
                      className={`px-3 py-1.5 rounded-fitting text-xs font-medium transition-all ${
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

      {/* Dislike Nudge ("Not quite right?") */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-5 sm:p-6 shadow-fitting-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-medium text-ink">Not quite right?</h3>
              {isNudging && (
                <span className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold animate-pulse">
                  <span className="w-2.5 h-2.5 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block" />
                  Recalibrating...
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted">
              Calibrate with 1-click nudge feedback to adjust the formality or tone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpandedNudge(!expandedNudge)}
            className="text-xs text-thread font-semibold hover:underline"
          >
            {expandedNudge ? "Collapse" : "Adjust Calibration"}
          </button>
        </div>

        {expandedNudge && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              disabled={isNudging}
              onClick={() => onNudge("too_formal")}
              className="p-3 text-left rounded-fitting border border-border hover:border-accent bg-surface/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-xs font-bold text-ink group-hover:text-accent flex items-center justify-between">
                <span>[Too Formal]</span>
                {isNudging && <span className="text-[10px] text-accent">...</span>}
              </div>
              <div className="text-[11px] text-ink-muted mt-0.5">
                Dial down stiffness; favor relaxed smart tailoring.
              </div>
            </button>

            <button
              type="button"
              disabled={isNudging}
              onClick={() => onNudge("too_casual")}
              className="p-3 text-left rounded-fitting border border-border hover:border-accent bg-surface/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-xs font-bold text-ink group-hover:text-accent flex items-center justify-between">
                <span>[Too Casual]</span>
                {isNudging && <span className="text-[10px] text-accent">...</span>}
              </div>
              <div className="text-[11px] text-ink-muted mt-0.5">
                Increase authority; add sharp structured outerwear.
              </div>
            </button>

            <button
              type="button"
              disabled={isNudging}
              onClick={() => onNudge("not_me")}
              className="p-3 text-left rounded-fitting border border-border hover:border-accent bg-surface/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-xs font-bold text-ink group-hover:text-accent flex items-center justify-between">
                <span>[Not Me]</span>
                {isNudging && <span className="text-[10px] text-accent">...</span>}
              </div>
              <div className="text-[11px] text-ink-muted mt-0.5">
                Shift tonal aesthetics while keeping the room stakes.
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
