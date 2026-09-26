"use client";

import React, { useState } from "react";
import {
  UserProfile,
  GenderCut,
  BudgetTier,
  BodyType,
  PaletteSeason,
  Occasion,
  ClothingSize,
  Complexion,
  StyleOption,
  LifestyleTag,
} from "../types/catalog";

interface MultiStepProfileProps {
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

export function MultiStepProfile({
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
}: MultiStepProfileProps) {
  // Step index: 0 = Goal, 1 = Gender, 2 = Body Silhouette, 3 = Palette, 4 = Style, 5 = Climate & Budget, 6 = Context/Occasion
  const [currentStep, setCurrentStep] = useState<number>(0);

  const TOTAL_STEPS = 7; // Steps 0 to 6

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBodyTypeSelect = (type: string) => {
    if (type === "not_sure") {
      onUpdate({ body_type: "rectangle" });
    } else {
      onUpdate({ body_type: type as BodyType });
    }
  };

  const handlePaletteSelect = (palette: string) => {
    if (palette === "not_sure") {
      onUpdate({ seasonal_colour: "autumn", palette_season: "autumn" });
    } else {
      onUpdate({ seasonal_colour: palette as PaletteSeason, palette_season: palette as PaletteSeason });
    }
  };

  const handleComplexionSelect = (complexion: Complexion) => {
    onUpdate({ complexion });
    if (profile.seasonal_colour === "not_sure" || !profile.seasonal_colour) {
      if (complexion === "dark") handlePaletteSelect("winter");
      else if (complexion === "medium") handlePaletteSelect("autumn");
      else handlePaletteSelect("summer");
    }
  };

  const handleLifestyleToggle = (tag: LifestyleTag) => {
    const current = profile.lifestyle || profile.lifestyle_tags || [];
    let next: LifestyleTag[];
    if (current.includes(tag)) {
      next = current.filter((t) => t !== tag);
    } else {
      if (current.length >= 2) {
        next = [current[1], tag];
      } else {
        next = [...current, tag];
      }
    }
    onUpdate({ lifestyle: next, lifestyle_tags: next });
  };

  // ----------------------------------------------------
  // DATA WITH HIGH QUALITY EDITORIAL IMAGES
  // ----------------------------------------------------

  const genderOptions = [
    {
      id: "Female",
      cut: "female" as GenderCut,
      label: "Female Expression",
      desc: "Tailored drape, fluid trousers & structured blazers",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "Neutral",
      cut: "neutral" as GenderCut,
      label: "Neutral / Fluid",
      desc: "Minimalist silhouettes & architectural unisex lines",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "Male",
      cut: "male" as GenderCut,
      label: "Male Expression",
      desc: "Structured shoulders, clean chinos & fine knitwear",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const bodyTypeOptions = [
    {
      id: "rectangle",
      label: "Rectangle",
      sub: "Balanced shoulders, chest & hips with clean lines",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "bottom_triangle",
      label: "Bottom Triangle",
      sub: "Broader hips and thighs; favors wide-leg trousers",
      image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "oval",
      label: "Oval Frame",
      sub: "Softer midsection; elevated by open unstructured layers",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "top_triangle",
      label: "Top Triangle",
      sub: "Broad athletic shoulders tapering toward waist",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "double_triangle",
      label: "Double Triangle",
      sub: "Defined waist proportion with balanced curves",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const seasonalPalettes = [
    {
      id: "winter",
      label: "Winter Palette",
      swatches: ["#1F2A44", "#1C1B19", "#FFFFFF", "#521820"],
      desc: "High contrast cool tones: Deep Navy, Charcoal, Crisp White & Burgundy",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "autumn",
      label: "Autumn Palette",
      swatches: ["#B08A5B", "#3F6B4F", "#8A5A12", "#4A3319"],
      desc: "Warm earthy tones: Camel, Moss Green, Ochre & Deep Chocolate",
      image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "summer",
      label: "Summer Palette",
      swatches: ["#8CA4B8", "#B5A7BD", "#E4DED4", "#5F7482"],
      desc: "Soft muted tones: Pearl Slate, Dusty Rose, Oatmeal & Soft Blue",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "spring",
      label: "Spring Palette",
      swatches: ["#D4A373", "#CCD5AE", "#FAEDCD", "#E76F51"],
      desc: "Bright warm tones: Warm Sand, Light Sage, Cream & Coral",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const styleArchetypes = [
    {
      id: "classic",
      label: "Classic Sartorial",
      desc: "Timeless tailoring, sharp lapels, structured fabrics",
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "casual",
      label: "Approachable Casual",
      desc: "Effortless chinos, soft cotton layers, relaxed polish",
      image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "trendy",
      label: "Directional Trendy",
      desc: "Modern boxy cuts, relaxed pleats, contemporary edge",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "sporty",
      label: "Technical Sporty",
      desc: "4-way stretch fabrics, commuter resilience, sleek mobility",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "nerdy",
      label: "Considered Nerdy",
      desc: "Purposeful minimalism, fine turtlenecks, tech founder vibe",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "fabulous",
      label: "Elevated Fabulous",
      desc: "Rich wool-cashmere drape, silk textures, quiet luxury",
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const occasionOptions = [
    {
      id: "pitch" as Occasion,
      label: "Pitching to investors",
      context: "VCs in Gastown / Toronto, founder credibility without stiff suits",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "interview" as Occasion,
      label: "Job interview",
      context: "Commanding competence, polished lines, sharp executive presence",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "family" as Occasion,
      label: "Meeting partner's family",
      context: "Warm, respectful, considered and approachable elegance",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "date" as Occasion,
      label: "First date",
      context: "Magnetic, comfortable tailoring suited for evening dining",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "court" as Occasion,
      label: "Court appearance",
      context: "Strict institutional decorum, solemn respect, clean lines",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "funeral" as Occasion,
      label: "Funeral / Memorial",
      context: "Quiet respect, subdued dark tones, solemn dignity",
      image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const lifestyleOptions = [
    {
      id: "office_professional" as LifestyleTag,
      label: "Office Professional",
      desc: "Downtown Vancouver hybrid schedule, meetings & desks",
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "new_grad" as LifestyleTag,
      label: "New Grad / Career Launch",
      desc: "Building initial professional foundation & interview wardrobe",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "family" as LifestyleTag,
      label: "Family & Parenting",
      desc: "School drop-offs, weekend playgrounds & durable comfort",
      image: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "outdoors" as LifestyleTag,
      label: "West Coast Transit & Outdoors",
      desc: "Rain-resistant layering, coastal commuting & weekend trails",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      {/* Step Progress Tracker & Guiding Header */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-5 sm:p-6 shadow-fitting-card space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-thread/15 text-thread uppercase tracking-wider font-bold">
              Step 0{currentStep + 1} of 0{TOTAL_STEPS}
            </span>
            <span className="text-ink-muted hidden sm:inline-block">
              {currentStep === 0 && "Mission Objective"}
              {currentStep === 1 && "Gender & Proportions"}
              {currentStep === 2 && "Body Silhouette"}
              {currentStep === 3 && "Colour Analysis"}
              {currentStep === 4 && "Style Archetype"}
              {currentStep === 5 && "Climate & Budget"}
              {currentStep === 6 && (flow === "occasion" ? "Occasion & Room Context" : "Lifestyle Utility")}
            </span>
          </div>

          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="text-ink-muted hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>←</span> Previous Step
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
          <div
            className="bg-accent h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* STEP 0: MISSION SELECTION (FLOW A vs FLOW B) */}
      {/* ============================================================ */}
      {currentStep === 0 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif text-ink font-normal">
              Choose Your Styling Mission
            </h1>
            <p className="text-sm sm:text-base text-ink-muted font-serif italic max-w-lg mx-auto">
              “Gain confidence with our style advisor. Remove the guesswork.”
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* FLOW A CARD */}
            <div
              onClick={() => {
                onFlowChange("occasion");
                handleNext();
              }}
              className={`group rounded-fitting-lg border overflow-hidden cursor-pointer transition-all duration-300 shadow-fitting-card hover:shadow-fitting-raised ${
                flow === "occasion"
                  ? "border-accent ring-2 ring-accent/30 bg-surface-raised"
                  : "border-border bg-surface-raised hover:border-thread/50"
              }`}
            >
              <div className="aspect-16/10 relative overflow-hidden bg-surface">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
                  alt="High-Stakes Occasion"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-accent text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-xs">
                  FLOW A
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-serif font-medium text-ink group-hover:text-accent transition-colors">
                  High-Stakes Occasion (FLOW A)
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Pitching seed funds in Gastown, high-profile interviews, family dinners, court hearings or memorials.
                  Delivers <strong>exactly 1 complete head-to-toe outfit</strong> calibrated for room decorum in under 1 minute.
                </p>
                <div className="pt-2 flex items-center text-xs font-bold text-thread group-hover:underline">
                  Start High-Stakes Flow →
                </div>
              </div>
            </div>

            {/* FLOW B CARD */}
            <div
              onClick={() => {
                onFlowChange("everyday");
                handleNext();
              }}
              className={`group rounded-fitting-lg border overflow-hidden cursor-pointer transition-all duration-300 shadow-fitting-card hover:shadow-fitting-raised ${
                flow === "everyday"
                  ? "border-accent ring-2 ring-accent/30 bg-surface-raised"
                  : "border-border bg-surface-raised hover:border-thread/50"
              }`}
            >
              <div className="aspect-16/10 relative overflow-hidden bg-surface">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
                  alt="Everyday Capsule Wardrobe"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-thread text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-xs">
                  FLOW B
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-serif font-medium text-ink group-hover:text-thread transition-colors">
                  Everyday Capsule Wardrobe (FLOW B)
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Tired of decision fatigue? Assemble a cohesive <strong>15-piece modular wardrobe</strong> with 3 worked combinations and a highlighted <strong>Starter Set of 5</strong>.
                </p>
                <div className="pt-2 flex items-center text-xs font-bold text-thread group-hover:underline">
                  Build 15-Item Capsule →
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: GENDER EXPRESSION & CUT */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-thread">Step 1 • Silhouette Foundation</div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-1">Gender Expression & Tailoring Cut</h2>
            <p className="text-xs text-ink-muted mt-1">
              Calibrates torso shoulder widths, waist tapers, and sleeve drop ratios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {genderOptions.map((g) => {
              const isSelected =
                profile.gender_expression === g.id || profile.gender_cut === g.cut;
              return (
                <div
                  key={g.id}
                  onClick={() => onUpdate({ gender_expression: g.id as any, gender_cut: g.cut })}
                  className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30 bg-surface/50"
                      : "border-border hover:border-thread/50 bg-surface/20"
                  }`}
                >
                  <div className="aspect-4/3 relative overflow-hidden bg-surface">
                    <img src={g.image} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="text-sm font-bold text-ink">{g.label}</h3>
                    <p className="text-xs text-ink-muted">{g.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              Continue to Body Silhouette →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: BODY SILHOUETTE & PROPORTIONS */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-thread">Step 2 • Frame & Proportions</div>
              <h2 className="text-2xl font-serif text-ink font-medium mt-1">Body Silhouette Archetype</h2>
              <p className="text-xs text-ink-muted mt-1">
                Ensures lapel widths, fabric drape, and jacket drops flatter your natural frame.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleBodyTypeSelect("not_sure");
                handleNext();
              }}
              className="text-xs px-3 py-1.5 rounded-fitting bg-surface border border-border text-ink-muted hover:text-ink cursor-pointer shrink-0"
            >
              Not sure (Default Balanced)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {bodyTypeOptions.map((b) => {
              const isSelected = profile.body_type === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => onUpdate({ body_type: b.id as BodyType })}
                  className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30 bg-surface/50"
                      : "border-border hover:border-thread/50 bg-surface/20"
                  }`}
                >
                  <div>
                    <div className="aspect-3/4 relative overflow-hidden bg-surface">
                      <img src={b.image} alt={b.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="text-xs font-bold text-ink">{b.label}</h4>
                      <p className="text-[11px] text-ink-muted leading-snug">{b.sub}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              Continue to Seasonal Colour →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: SEASONAL COLOUR ANALYSIS & COMPLEXION */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-thread">Step 3 • Color Theory</div>
              <h2 className="text-2xl font-serif text-ink font-medium mt-1">Seasonal Colour Analysis</h2>
              <p className="text-xs text-ink-muted mt-1">
                Colors that illuminate your facial undertones without competing for attention.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handlePaletteSelect("not_sure");
                handleNext();
              }}
              className="text-xs px-3 py-1.5 rounded-fitting bg-surface border border-border text-ink-muted hover:text-ink cursor-pointer shrink-0"
            >
              Not sure (Universal Neutrals)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {seasonalPalettes.map((p) => {
              const isSelected =
                profile.seasonal_colour === p.id || profile.palette_season === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handlePaletteSelect(p.id)}
                  className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30 bg-surface/50"
                      : "border-border hover:border-thread/50 bg-surface/20"
                  }`}
                >
                  <div>
                    <div className="aspect-4/3 relative overflow-hidden bg-surface">
                      <img src={p.image} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex gap-1.5">
                        {p.swatches.map((hex, i) => (
                          <span key={i} className="w-4 h-4 rounded-full border border-black/15" style={{ backgroundColor: hex }} />
                        ))}
                      </div>
                      <h4 className="text-sm font-bold text-ink">{p.label}</h4>
                      <p className="text-xs text-ink-muted leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complexion helper */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Optional: Skin Tone Undertone Reference
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["Light", "Medium", "Dark"] as const).map((comp) => (
                <button
                  key={comp}
                  type="button"
                  onClick={() => handleComplexionSelect(comp.toLowerCase() as Complexion)}
                  className={`py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                    profile.complexion === comp.toLowerCase()
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {comp} Complexion
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              Continue to Personal Style →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: PERSONAL STYLE IDENTITY (6 ARCHETYPES) */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-thread">Step 4 • Aesthetic Identity</div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-1">Personal Style Archetype</h2>
            <p className="text-xs text-ink-muted mt-1">
              Informs how the AI calibrates formality without stripping away your authentic identity.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {styleArchetypes.map((st) => {
              const isSelected =
                profile.style === st.id || profile.preferred_styles?.includes(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => onUpdate({ style: st.id, preferred_styles: [st.id] })}
                  className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30 bg-surface/50"
                      : "border-border hover:border-thread/50 bg-surface/20"
                  }`}
                >
                  <div>
                    <div className="aspect-16/10 relative overflow-hidden bg-surface">
                      <img src={st.image} alt={st.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <h4 className="text-sm font-bold text-ink">{st.label}</h4>
                      <p className="text-xs text-ink-muted leading-relaxed">{st.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              Continue to Climate & Budget →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 5: CLIMATE, SIZE & BUDGET TIER */}
      {/* ============================================================ */}
      {currentStep === 5 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-8 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-thread">Step 5 • Constraints & Climate</div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-1">Climate, Sizing & Budget Tier</h2>
            <p className="text-xs text-ink-muted mt-1">
              Hard constraints applied deterministically in code before LLM inference.
            </p>
          </div>

          {/* Climate selection with images */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              Active Canadian Weather Season
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "Fall/Winter" as const,
                  label: "Fall / Winter (Rain & Cold)",
                  desc: "Water-resistant outerwear, virgin wool, fine knitwear & thermal layering",
                  image: "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?auto=format&fit=crop&w=800&q=80",
                },
                {
                  id: "Spring/Summer" as const,
                  label: "Spring / Summer (Warm)",
                  desc: "Breathable Egyptian cotton, linen blends, lightweight unlined tailoring",
                  image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                },
              ].map((c) => {
                const isSelected =
                  profile.season_or_climate === c.id ||
                  (c.id.includes("Fall") && profile.season_of_wear === "fall_winter");
                return (
                  <div
                    key={c.id}
                    onClick={() =>
                      onUpdate({
                        season_or_climate: c.id,
                        season_of_wear: c.id.includes("Fall") ? "fall_winter" : "spring_summer",
                      })
                    }
                    className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all flex items-center gap-3 p-3 ${
                      isSelected
                        ? "border-accent ring-2 ring-accent/30 bg-surface/50"
                        : "border-border hover:border-thread/50 bg-surface/20"
                    }`}
                  >
                    <img src={c.image} alt={c.label} className="w-20 h-16 rounded object-cover shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-ink">{c.label}</h4>
                      <p className="text-[11px] text-ink-muted leading-snug mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Tier */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink">
                Budget Tier (Hard Constraint: Never Relaxed)
              </label>
              <span className="text-xs text-thread font-semibold font-mono">100% In-Stock Canadian Catalog</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { tier: "$", label: "$ (Value)", desc: "Under $100 / garment (Kotn, RW&CO Essentials, Tentree)" },
                { tier: "$$", label: "$$ (Mid-Tier)", desc: "$100 - $250 / garment (Aritzia, Lululemon, Vessi, Frank And Oak)" },
                { tier: "$$$", label: "$$$ (Premium)", desc: "$250+ / garment (Club Monaco, Canada Goose, Mackage, Maguire)" },
              ].map((b) => (
                <button
                  key={b.tier}
                  type="button"
                  onClick={() => onUpdate({ budget: b.tier as any, budget_tier: b.tier as any })}
                  className={`p-3.5 text-left rounded-fitting border transition-all cursor-pointer ${
                    profile.budget === b.tier || profile.budget_tier === b.tier
                      ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                      : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                  }`}
                >
                  <div className="text-sm font-bold text-ink font-mono">{b.label}</div>
                  <div className="text-xs text-ink-muted mt-1 leading-snug">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Spectrum */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              Size Reference
            </label>
            <div className="grid grid-cols-6 gap-2">
              {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdate({ size })}
                  className={`py-2 text-xs font-bold rounded-fitting border transition-all cursor-pointer ${
                    profile.size === size
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-border text-ink hover:border-thread/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              Continue to {flow === "occasion" ? "Occasion Selection" : "Lifestyle Selection"} →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 6: CONTEXT & AUDIENCE-FIT (FLOW A vs FLOW B) */}
      {/* ============================================================ */}
      {currentStep === 6 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          {flow === "occasion" ? (
            /* FLOW A: 6 Occasion Photo Tiles + Audience Free-Text */
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-thread">Step 6 • High-Stakes Occasion</div>
                <h2 className="text-2xl font-serif text-ink font-medium mt-1">Room Decorum & Stakes</h2>
                <p className="text-xs text-ink-muted mt-1">
                  Select the exact room setting to calibrate formality and trigger occasion override protections.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {occasionOptions.map((occ) => {
                  const isSelected = occasion === occ.id;
                  return (
                    <div
                      key={occ.id}
                      onClick={() => onOccasionChange(occ.id)}
                      className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/30 bg-surface/50"
                          : "border-border hover:border-thread/50 bg-surface/20"
                      }`}
                    >
                      <div>
                        <div className="aspect-16/10 relative overflow-hidden bg-surface">
                          <img src={occ.image} alt={occ.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-3 space-y-0.5">
                          <h4 className="text-xs font-bold text-ink">{occ.label}</h4>
                          <p className="text-[11px] text-ink-muted leading-tight">{occ.context}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Audience-Fit Free Text Input */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink">
                    Audience-fit context (Optional Room Expectations)
                  </label>
                  <button
                    type="button"
                    onClick={() => onAudienceChange("Seed fund, partners are ex-engineers, meeting at their office in Gastown")}
                    className="text-xs text-thread hover:underline cursor-pointer"
                  >
                    Demo Preset (Persona Sam)
                  </button>
                </div>
                <input
                  type="text"
                  value={audienceText}
                  onChange={(e) => onAudienceChange(e.target.value)}
                  placeholder="e.g. Seed fund, partners are ex-engineers, meeting at their office in Gastown"
                  className="w-full px-4 py-3 text-sm bg-surface/40 border border-border rounded-fitting focus:outline-none focus:ring-1 focus:ring-accent focus:bg-surface-raised transition-all"
                />
              </div>
            </div>
          ) : (
            /* FLOW B: 4 Lifestyle Tiles */
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-thread">Step 6 • Lifestyle Utility</div>
                <h2 className="text-2xl font-serif text-ink font-medium mt-1">Everyday Wardrobe Context</h2>
                <p className="text-xs text-ink-muted mt-1">
                  Select up to 2 contexts that reflect your hybrid week.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lifestyleOptions.map((ls) => {
                  const isSelected = (profile.lifestyle || profile.lifestyle_tags || []).includes(ls.id);
                  return (
                    <div
                      key={ls.id}
                      onClick={() => handleLifestyleToggle(ls.id)}
                      className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all flex items-center gap-3.5 p-3.5 ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/30 bg-surface/50"
                          : "border-border hover:border-thread/50 bg-surface/20"
                      }`}
                    >
                      <img src={ls.image} alt={ls.label} className="w-20 h-20 rounded object-cover shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-ink">{ls.label}</h4>
                        <p className="text-xs text-ink-muted leading-snug mt-1">{ls.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Submit CTA */}
          <div className="pt-6 border-t border-border">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-accent hover:bg-navy-light text-white font-serif text-lg tracking-wide rounded-fitting shadow-fitting-raised transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Calibrating Zero-Hallucination Recommendation...</span>
                </>
              ) : (
                <span>
                  {flow === "occasion" ? "Generate Decisive Outfit →" : "Assemble 15-Item Capsule Matrix →"}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
