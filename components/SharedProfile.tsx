"use client";

import React, { useState } from "react";
import { UserProfile, GenderCut, BudgetTier, BodyType, PaletteSeason, SeasonOfWear, Occasion } from "../types/catalog";

interface SharedProfileProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  occasion: Occasion;
  onOccasionChange: (occ: Occasion) => void;
  audienceText: string;
  onAudienceChange: (text: string) => void;
  flow: "occasion" | "everyday";
  onFlowChange: (flow: "occasion" | "everyday") => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function SharedProfile({
  profile,
  onUpdate,
  occasion,
  onOccasionChange,
  audienceText,
  onAudienceChange,
  flow,
  onFlowChange,
  onSubmit,
  isLoading,
}: SharedProfileProps) {
  const [selectedBodyType, setSelectedBodyType] = useState<string>(profile.body_type || "athletic");
  const [selectedPalette, setSelectedPalette] = useState<string>(profile.palette_season || "autumn");

  const handleBodyTypeSelect = (type: string) => {
    setSelectedBodyType(type);
    if (type === "not_sure") {
      onUpdate({ body_type: undefined });
    } else {
      onUpdate({ body_type: type as BodyType });
    }
  };

  const handlePaletteSelect = (palette: string) => {
    setSelectedPalette(palette);
    if (palette === "not_sure") {
      onUpdate({ palette_season: undefined });
    } else {
      onUpdate({ palette_season: palette as PaletteSeason });
    }
  };

  const handleBudgetTierToggle = (tier: BudgetTier) => {
    const currentTiers = Array.isArray(profile.budget_tier) ? profile.budget_tier : [profile.budget_tier];
    let nextTiers: BudgetTier[];
    if (currentTiers.includes(tier)) {
      if (currentTiers.length > 1) {
        nextTiers = currentTiers.filter((t) => t !== tier);
      } else {
        nextTiers = currentTiers; // keep at least one
      }
    } else {
      nextTiers = [...currentTiers, tier];
    }
    onUpdate({ budget_tier: nextTiers });
  };

  const isBudgetSelected = (tier: BudgetTier) => {
    const currentTiers = Array.isArray(profile.budget_tier) ? profile.budget_tier : [profile.budget_tier];
    return currentTiers.includes(tier);
  };

  const styleOptions = [
    "Tailored Minimal",
    "Smart Architectural",
    "Quiet Luxury",
    "Elevated Tech Casual",
    "Classic Sartorial",
  ];

  const lifestyleOptions = [
    "Tech & Startup Pitching",
    "Executive Board Meetings",
    "Creative & Studio Work",
    "Frequent Travel",
    "West Coast Commuting",
  ];

  const toggleStyle = (style: string) => {
    const current = profile.preferred_styles || [];
    const next = current.includes(style) ? current.filter((s) => s !== style) : [...current, style];
    onUpdate({ preferred_styles: next });
  };

  const toggleLifestyle = (tag: string) => {
    const current = profile.lifestyle_tags || [];
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onUpdate({ lifestyle_tags: next });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thread/10 text-thread text-xs font-medium tracking-wide uppercase">
          Fitting Room Intake
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-normal">
          Calibrate Your Fit Profile
        </h1>
        <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
          The AI has taste, but never guesses facts. Define your proportions, tone, and context to generate verified recommendations.
        </p>
      </div>

      {/* Mode Selector (Flow A vs Flow B) */}
      <div className="bg-surface-raised border border-border rounded-fitting p-2 shadow-fitting-card flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => onFlowChange("occasion")}
          className={`flex-1 py-3 px-4 rounded-fitting text-left transition-all ${
            flow === "occasion"
              ? "bg-accent text-white shadow-sm"
              : "text-ink hover:bg-surface/80"
          }`}
        >
          <div className="text-xs uppercase tracking-wider opacity-75 font-semibold">Flow A</div>
          <div className="text-base font-serif font-medium">Specific Occasion & Audience</div>
          <div className="text-xs opacity-80 mt-0.5">High-stakes event (e.g. Pitch, Interview, Gala)</div>
        </button>
        <button
          type="button"
          onClick={() => onFlowChange("everyday")}
          className={`flex-1 py-3 px-4 rounded-fitting text-left transition-all ${
            flow === "everyday"
              ? "bg-accent text-white shadow-sm"
              : "text-ink hover:bg-surface/80"
          }`}
        >
          <div className="text-xs uppercase tracking-wider opacity-75 font-semibold">Flow B</div>
          <div className="text-base font-serif font-medium">Everyday Capsule Refresh</div>
          <div className="text-xs opacity-80 mt-0.5">15-piece modular wardrobe & 3 combinations</div>
        </button>
      </div>

      {/* Section 1: Target Occasion & Audience (For Occasion Flow) */}
      {flow === "occasion" && (
        <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-serif text-ink font-medium">1. Occasion & Room Context</h2>
            <p className="text-xs text-ink-muted mt-1">Calibrates the formality target and stakes.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(
              [
                { id: "pitch", label: "Venture Pitch", desc: "Founder / Investor" },
                { id: "work", label: "Board / Work", desc: "Executive Presence" },
                { id: "smart-casual", label: "Dinner / Date", desc: "Refined & Relaxed" },
                { id: "casual", label: "Creative / Travel", desc: "Commuter Ease" },
              ] as const
            ).map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => onOccasionChange(occ.id as Occasion)}
                className={`p-3 text-left rounded-fitting border transition-all ${
                  occasion === occ.id
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/30 text-ink-muted"
                }`}
              >
                <div className="text-sm font-semibold text-ink">{occ.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{occ.desc}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Audience & Room Description
              </label>
              <button
                type="button"
                onClick={() => onAudienceChange("Pitching Seed Fund in Gastown to local tech VCs")}
                className="text-xs text-thread hover:underline"
              >
                Insert Demo Preset (Gastown Pitch)
              </button>
            </div>
            <input
              type="text"
              value={audienceText}
              onChange={(e) => onAudienceChange(e.target.value)}
              placeholder="e.g. Pitching Seed Fund in Gastown to 4 institutional investors on a rainy Thursday"
              className="w-full px-4 py-3 text-sm bg-surface/40 border border-border rounded-fitting focus:outline-none focus:ring-1 focus:ring-accent focus:bg-surface-raised transition-all"
            />
          </div>
        </section>
      )}

      {/* Section 2: Proportions & Body Silhouette */}
      <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
        <div className="border-b border-border pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-serif text-ink font-medium">2. Body Proportion & Silhouette</h2>
            <p className="text-xs text-ink-muted mt-1">Ensures drape and lapel proportions flatter your frame.</p>
          </div>
          <button
            type="button"
            onClick={() => handleBodyTypeSelect("not_sure")}
            className={`text-xs px-2.5 py-1 rounded-fitting transition-all ${
              selectedBodyType === "not_sure"
                ? "bg-accent text-white font-medium"
                : "bg-surface border border-border text-ink-muted hover:text-ink"
            }`}
          >
            Not sure
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              id: "athletic",
              label: "Athletic",
              sub: "Broad chest, tapered waist",
              svg: (
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                  <path d="M14 10 L34 10 L30 36 L18 36 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 10 L8 22 L14 24" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M34 10 L40 22 L34 24" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              id: "slim",
              label: "Slim / Linear",
              sub: "Aligned shoulders & hips",
              svg: (
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                  <path d="M17 10 L31 10 L30 38 L18 38 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 10 L12 24" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M31 10 L36 24" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              id: "average",
              label: "Balanced",
              sub: "Standard classic build",
              svg: (
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                  <path d="M15 10 L33 10 L31 36 L17 36 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="24" cy="6" r="3" strokeWidth="1.5" />
                </svg>
              ),
            },
            {
              id: "curvy",
              label: "Hourglass",
              sub: "Defined waist curve",
              svg: (
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                  <path d="M15 10 C20 18 19 22 17 36 L31 36 C29 22 28 18 33 10 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
            {
              id: "inverted-triangle",
              label: "Tall / Structured",
              sub: "Extended line & length",
              svg: (
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                  <path d="M12 10 L36 10 L28 40 L20 40 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleBodyTypeSelect(item.id)}
              className={`p-3.5 text-center rounded-fitting border transition-all flex flex-col items-center justify-between ${
                selectedBodyType === item.id
                  ? "border-accent bg-accent/5 ring-1 ring-accent text-accent"
                  : "border-border hover:border-thread/50 bg-surface/30 text-ink-muted"
              }`}
            >
              <div className="py-2">{item.svg}</div>
              <div className="w-full text-center">
                <div className="text-xs font-semibold text-ink">{item.label}</div>
                <div className="text-[10px] text-ink-muted leading-tight mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Section 3: Seasonal Palette Analysis */}
      <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
        <div className="border-b border-border pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-serif text-ink font-medium">3. Seasonal Color Palette</h2>
            <p className="text-xs text-ink-muted mt-1">Harmonizes undertones with fabric dyes and neutrals.</p>
          </div>
          <button
            type="button"
            onClick={() => handlePaletteSelect("not_sure")}
            className={`text-xs px-2.5 py-1 rounded-fitting transition-all ${
              selectedPalette === "not_sure"
                ? "bg-accent text-white font-medium"
                : "bg-surface border border-border text-ink-muted hover:text-ink"
            }`}
          >
            Universal Neutrals
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              id: "autumn",
              label: "Autumn",
              desc: "Warm & Rich",
              colors: ["#B08A5B", "#8A5A12", "#3F6B4F", "#2A1E14"],
            },
            {
              id: "winter",
              label: "Winter",
              desc: "Cool & High Contrast",
              colors: ["#1F2A44", "#17181B", "#EDE8E1", "#3E445B"],
            },
            {
              id: "summer",
              label: "Summer",
              desc: "Cool & Muted",
              colors: ["#7B8FA1", "#CFD2CF", "#567189", "#D5B4B4"],
            },
            {
              id: "spring",
              label: "Spring",
              desc: "Warm & Clear",
              colors: ["#E7AB79", "#4C6B5E", "#EAE3D2", "#D68060"],
            },
          ].map((pal) => (
            <button
              key={pal.id}
              type="button"
              onClick={() => handlePaletteSelect(pal.id)}
              className={`p-4 rounded-fitting border text-left transition-all ${
                selectedPalette === pal.id
                  ? "border-accent bg-accent/5 ring-1 ring-accent"
                  : "border-border hover:border-thread/50 bg-surface/30"
              }`}
            >
              <div className="flex gap-1.5 mb-3">
                {pal.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="text-sm font-semibold text-ink">{pal.label}</div>
              <div className="text-xs text-ink-muted mt-0.5">{pal.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Section 4: Budget Tier & Gender Silhouette */}
      <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-serif text-ink font-medium">4. Silhouette & Budget Thresholds</h2>
          <p className="text-xs text-ink-muted mt-1">Hard boundaries strictly enforced in filtering.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Gender Cut */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Garment Cut / Sizing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["men", "women", "unisex"] as GenderCut[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onUpdate({ gender_cut: g })}
                  className={`py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded-fitting border transition-all ${
                    profile.gender_cut === g
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Season of Wear */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Season of Wear
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["fall", "winter", "spring", "summer"] as SeasonOfWear[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdate({ season_of_wear: s })}
                  className={`py-2.5 px-2 text-xs font-semibold capitalize rounded-fitting border transition-all ${
                    profile.season_of_wear === s
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Tiers */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Budget Tiers (Multi-select)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: "budget", label: "Tier 1: Essential", range: "$40 – $90 CAD" },
              { id: "mid", label: "Tier 2: Contemporary", range: "$90 – $180 CAD" },
              { id: "premium", label: "Tier 3: Premium", range: "$180 – $350 CAD" },
              { id: "luxury", label: "Tier 4: Heritage", range: "$350+ CAD" },
            ].map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleBudgetTierToggle(tier.id as BudgetTier)}
                className={`p-3 text-left rounded-fitting border transition-all ${
                  isBudgetSelected(tier.id as BudgetTier)
                    ? "border-moss bg-moss/5 ring-1 ring-moss text-ink"
                    : "border-border bg-surface/30 text-ink-muted hover:border-thread/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">{tier.label}</span>
                  {isBudgetSelected(tier.id as BudgetTier) && (
                    <span className="text-moss text-xs font-bold">✓</span>
                  )}
                </div>
                <div className="text-[11px] text-ink-muted mt-1">{tier.range}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Style & Lifestyle Tags */}
      <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-serif text-ink font-medium">5. Aesthetics & Lifestyle Affinity</h2>
          <p className="text-xs text-ink-muted mt-1">Calibrates stylistic nuances and brand affinities.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-2">
              Styling Aesthetics
            </label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((st) => {
                const active = (profile.preferred_styles || []).includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStyle(st)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? "bg-thread text-white border-thread shadow-xs"
                        : "bg-surface border-border text-ink hover:border-thread/50"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-2">
              Lifestyle Contexts
            </label>
            <div className="flex flex-wrap gap-2">
              {lifestyleOptions.map((lt) => {
                const active = (profile.lifestyle_tags || []).includes(lt);
                return (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => toggleLifestyle(lt)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? "bg-accent text-white border-accent shadow-xs"
                        : "bg-surface border-border text-ink hover:border-accent/50"
                    }`}
                  >
                    {lt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Action CTA */}
      <div className="pt-4 flex justify-center">
        <button
          type="button"
          disabled={isLoading}
          onClick={onSubmit}
          className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-fitting bg-accent hover:bg-accent/95 text-white font-medium text-base tracking-wide shadow-fitting-raised transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Calibrating Recommendation...</span>
            </>
          ) : (
            <span>{flow === "occasion" ? "Generate Occasion Outfit →" : "Build Modular Capsule →"}</span>
          )}
        </button>
      </div>
    </div>
  );
}
