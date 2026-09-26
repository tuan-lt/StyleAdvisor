"use client";

import React, { useState } from "react";
import {
  UserProfile,
  GenderCut,
  BudgetTier,
  BodyType,
  PaletteSeason,
  SeasonOfWear,
  Occasion,
  ClothingSize,
  Complexion,
  StyleOption,
  LifestyleTag,
} from "../types/catalog";

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
  const [selectedBodyType, setSelectedBodyType] = useState<string>(profile.body_type || "rectangle");
  const [selectedPalette, setSelectedPalette] = useState<string>(profile.seasonal_colour || profile.palette_season || "autumn");

  const handleBodyTypeSelect = (type: string) => {
    setSelectedBodyType(type);
    if (type === "not_sure") {
      onUpdate({ body_type: "rectangle" });
    } else {
      onUpdate({ body_type: type as BodyType });
    }
  };

  const handlePaletteSelect = (palette: string) => {
    setSelectedPalette(palette);
    if (palette === "not_sure") {
      // Default to neutral palette per PRD Section 5 FR-1.3
      onUpdate({ seasonal_colour: "autumn", palette_season: "autumn" });
    } else {
      onUpdate({ seasonal_colour: palette as PaletteSeason, palette_season: palette as PaletteSeason });
    }
  };

  const handleBudgetSelect = (tier: "$" | "$$" | "$$$") => {
    onUpdate({ budget: tier, budget_tier: tier });
  };

  const handleSizeSelect = (size: ClothingSize) => {
    onUpdate({ size });
  };

  const handleComplexionSelect = (complexion: Complexion) => {
    onUpdate({ complexion });
    // Auto-recommend palette if user previously chose "not_sure"
    if (selectedPalette === "not_sure") {
      if (complexion === "dark") handlePaletteSelect("winter");
      else if (complexion === "medium") handlePaletteSelect("autumn");
      else handlePaletteSelect("summer");
    }
  };

  const handleStyleSelect = (style: StyleOption) => {
    onUpdate({ style, preferred_styles: [style] });
  };

  const handleClimateSelect = (climate: "Spring/Summer" | "Fall/Winter") => {
    onUpdate({
      season_or_climate: climate,
      season_of_wear: climate === "Spring/Summer" ? "spring_summer" : "fall_winter",
    });
  };

  const handleLifestyleToggle = (tag: LifestyleTag) => {
    const current = profile.lifestyle || profile.lifestyle_tags || [];
    let next: LifestyleTag[];
    if (current.includes(tag)) {
      next = current.filter((t) => t !== tag);
    } else {
      if (current.length >= 2) {
        next = [current[1], tag]; // keep maximum 2
      } else {
        next = [...current, tag];
      }
    }
    onUpdate({ lifestyle: next, lifestyle_tags: next });
  };

  const styleOptions: { id: StyleOption; label: string; desc: string }[] = [
    { id: "casual", label: "Casual", desc: "Effortless, approachable, relaxed" },
    { id: "classic", label: "Classic", desc: "Tailored, timeless, structured" },
    { id: "trendy", label: "Trendy", desc: "Contemporary, directional, sharp" },
    { id: "sporty", label: "Sporty", desc: "Athletic mobility, technical fabrics" },
    { id: "nerdy", label: "Nerdy", desc: "Subtle, functional, considered minimalism" },
    { id: "fabulous", label: "Fabulous", desc: "Bold drape, elevated luxury, refined" },
  ];

  const lifestyleOptions: { id: LifestyleTag; label: string; desc: string }[] = [
    { id: "office_professional", label: "Office Professional", desc: "Downtown hybrid & meetings" },
    { id: "new_grad", label: "New Grad", desc: "Career entry & interviews" },
    { id: "family", label: "Family", desc: "School drop-offs & weekends" },
    { id: "outdoors", label: "Outdoors", desc: "West Coast rain & transit" },
  ];

  const occasionTiles: { id: Occasion; label: string; context: string }[] = [
    { id: "pitch", label: "Pitching to investors", context: "Founder stakes, VC credibility" },
    { id: "interview", label: "Job interview", context: "Professional competence & poise" },
    { id: "family", label: "Meeting partner's family", context: "Warm, respectful, considered" },
    { id: "date", label: "First date", context: "Refined, comfortable, magnetic" },
    { id: "court", label: "Court appearance", context: "Strict decorum, solemn respect" },
    { id: "funeral", label: "Funeral / Memorial", context: "Quiet respect, subdued palette" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10 pb-20">
      {/* Header Cue (PRD FR-1.1) */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thread/10 text-thread text-xs font-medium tracking-wide uppercase">
          Fitting Room Intake
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-normal">
          Shared User Profile
        </h1>
        <p className="text-sm sm:text-base font-serif italic text-ink-muted max-w-xl mx-auto">
          “Nine quick questions, about a minute”
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
          <div className="text-base font-serif font-medium">High-Stakes Occasion</div>
          <div className="text-xs opacity-80 mt-0.5">Exactly 1 complete outfit calibrated for room stakes</div>
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
          <div className="text-base font-serif font-medium">Everyday Capsule Wardrobe</div>
          <div className="text-xs opacity-80 mt-0.5">Coordinated 15-piece matrix & 3 worked outfits</div>
        </button>
      </div>

      {/* Target Occasion (Only shown when Flow A is active) */}
      {flow === "occasion" && (
        <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-serif text-ink font-medium">Occasion Selection (6 High-Stakes Moments)</h2>
            <p className="text-xs text-ink-muted mt-1">Select the specific room context you need to dress for.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {occasionTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => onOccasionChange(tile.id)}
                className={`p-3.5 text-left rounded-fitting border transition-all ${
                  occasion === tile.id
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/30 text-ink-muted"
                }`}
              >
                <div className="text-sm font-semibold text-ink">{tile.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{tile.context}</div>
              </button>
            ))}
          </div>

          {/* Audience-Fit Free-Text Input (PRD FR-2.2) */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Audience-fit context (Optional Room Expectations)
              </label>
              <button
                type="button"
                onClick={() => onAudienceChange("Seed fund, partners are ex-engineers, meeting at their office in Gastown")}
                className="text-xs text-thread hover:underline"
              >
                Demo Preset (Sam's Pitch)
              </button>
            </div>
            <input
              type="text"
              value={audienceText}
              onChange={(e) => onAudienceChange(e.target.value)}
              placeholder="e.g. Seed fund, partners are ex-engineers, meeting at their office in Gastown"
              className="w-full px-4 py-3 text-sm bg-surface/40 border border-border rounded-fitting focus:outline-none focus:ring-1 focus:ring-accent focus:bg-surface-raised transition-all"
            />
            <p className="text-xs text-ink-muted italic">
              Edge handling: Off-topic or empty entries are gracefully handled, falling back to occasion norms.
            </p>
          </div>
        </section>
      )}

      {/* 9 Variables Intake Form (PRD FR-1.3) */}
      <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-8 shadow-fitting-card">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-serif text-ink font-medium">Profile Calibration (9 Variables)</h2>
          <p className="text-xs text-ink-muted mt-1">Stored locally in browser `localStorage`. No login required.</p>
        </div>

        {/* 1. Gender expression */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            1. Gender Expression
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["Female", "Neutral", "Male"] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => onUpdate({ gender_expression: gender, gender_cut: gender.toLowerCase() as GenderCut })}
                className={`py-2.5 px-4 text-sm font-medium rounded-fitting border text-center transition-all ${
                  (profile.gender_expression === gender || profile.gender_cut === gender.toLowerCase())
                    ? "border-accent bg-accent text-white"
                    : "border-border hover:border-thread/50 bg-surface/40 text-ink"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Budget */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              2. Budget Tier
            </label>
            <span className="text-xs text-ink-muted">Hard constraint (never relaxed)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { tier: "$", label: "$ (Value)", desc: "Under $100/garment" },
              { tier: "$$", label: "$$ (Mid-Tier)", desc: "$100 - $250/garment" },
              { tier: "$$$", label: "$$$ (Premium)", desc: "$250+/garment" },
            ].map((b) => (
              <button
                key={b.tier}
                type="button"
                onClick={() => handleBudgetSelect(b.tier as any)}
                className={`p-3 text-left rounded-fitting border transition-all ${
                  (profile.budget === b.tier || profile.budget_tier === b.tier)
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                }`}
              >
                <div className="text-sm font-bold text-ink">{b.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Size */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              3. Size Spectrum
            </label>
            <span className="text-xs text-ink-muted">Soft preference (biases ranking)</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeSelect(size)}
                className={`py-2 text-sm font-medium rounded-fitting border text-center transition-all ${
                  profile.size === size
                    ? "border-accent bg-accent text-white"
                    : "border-border hover:border-thread/50 bg-surface/40 text-ink"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Body Type */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              4. Body Silhouette
            </label>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: "rectangle", label: "Rectangle", sub: "Straight column lines" },
              { id: "bottom_triangle", label: "Teardrop / Pear", sub: "Broader hips & thighs" },
              { id: "oval", label: "Oval / Apple", sub: "Softer rounded midsection" },
              { id: "top_triangle", label: "Inverted Triangle", sub: "Broad athletic shoulders" },
              { id: "double_triangle", label: "Hourglass", sub: "Defined nipped waist" },
              { id: "standard", label: "Standard Balanced", sub: "Evenly distributed" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleBodyTypeSelect(b.id)}
                className={`p-3 text-center rounded-fitting border transition-all ${
                  selectedBodyType === b.id
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/30 text-ink-muted"
                }`}
              >
                <div className="text-xs font-semibold text-ink">{b.label}</div>
                <div className="text-[11px] text-ink-muted mt-0.5">{b.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Seasonal Colour */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              5. Seasonal Colour Analysis
            </label>
            <button
              type="button"
              onClick={() => handlePaletteSelect("not_sure")}
              className={`text-xs px-2.5 py-1 rounded-fitting transition-all ${
                selectedPalette === "not_sure"
                  ? "bg-accent text-white font-medium"
                  : "bg-surface border border-border text-ink-muted hover:text-ink"
              }`}
            >
              Not sure
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "winter", label: "Winter", swatches: ["#1F2A44", "#1C1B19", "#FFFFFF", "#521820"], desc: "High contrast & cool navy" },
              { id: "autumn", label: "Autumn", swatches: ["#B08A5B", "#3F6B4F", "#8A5A12", "#4A3319"], desc: "Earthy, camel, moss & ochre" },
              { id: "summer", label: "Summer", swatches: ["#8CA4B8", "#B5A7BD", "#E4DED4", "#5F7482"], desc: "Soft, muted & rose tones" },
              { id: "spring", label: "Spring", swatches: ["#D4A373", "#CCD5AE", "#FAEDCD", "#E76F51"], desc: "Warm, clear & bright tones" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePaletteSelect(p.id)}
                className={`p-3 text-left rounded-fitting border transition-all ${
                  selectedPalette === p.id
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/30 text-ink-muted"
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {p.swatches.map((hex, i) => (
                    <span key={i} className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                  ))}
                </div>
                <div className="text-sm font-semibold text-ink">{p.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Complexion (Optional) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              6. Complexion Tone (Optional)
            </label>
            <span className="text-xs text-ink-muted">Used to calibrate palette if "Not sure"</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["Light", "Medium", "Dark"] as const).map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => handleComplexionSelect(comp.toLowerCase() as Complexion)}
                className={`py-2 px-3 text-sm rounded-fitting border text-center transition-all ${
                  profile.complexion === comp.toLowerCase()
                    ? "border-accent bg-accent text-white font-medium"
                    : "border-border hover:border-thread/50 bg-surface/40 text-ink"
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Style (6 Options from PRD) */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            7. Personal Style Identity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {styleOptions.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStyleSelect(st.id)}
                className={`p-3 text-left rounded-fitting border transition-all ${
                  (profile.style === st.id || profile.preferred_styles?.includes(st.id))
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                }`}
              >
                <div className="text-sm font-semibold text-ink">{st.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 8. Season or Climate */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            8. Active Climate & Season
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "Fall/Winter", label: "Fall / Winter (Rain & Cold)", desc: "Layering, knitwear, water-resistant outerwear" },
              { id: "Spring/Summer", label: "Spring / Summer (Warm)", desc: "Breathable cottons, lightweight tailoring, linens" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleClimateSelect(c.id as any)}
                className={`p-3 text-left rounded-fitting border transition-all ${
                  (profile.season_or_climate === c.id || (c.id.includes("Fall") && profile.season_of_wear === "fall_winter"))
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                }`}
              >
                <div className="text-sm font-semibold text-ink">{c.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 9. Lifestyle (Multi-select up to 2) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              9. Lifestyle Context (Select up to 2)
            </label>
            <span className="text-xs text-ink-muted">Used for everyday capsule utility</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {lifestyleOptions.map((ls) => {
              const isSelected = (profile.lifestyle || profile.lifestyle_tags || []).includes(ls.id);
              return (
                <button
                  key={ls.id}
                  type="button"
                  onClick={() => handleLifestyleToggle(ls.id)}
                  className={`p-3 text-left rounded-fitting border transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                      : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                  }`}
                >
                  <div className="text-xs font-bold text-ink">{ls.label}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">{ls.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Submit Action */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-accent hover:bg-navy-light text-white font-serif text-lg tracking-wide rounded-fitting shadow-fitting-raised transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Consulting Fitting Room Engine...</span>
            </>
          ) : (
            <span>
              {flow === "occasion" ? "Generate Decisive Outfit" : "Assemble 15-Item Capsule"}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
