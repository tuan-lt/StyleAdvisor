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
import { useLanguage } from "../lib/LanguageContext";

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
  const { language, t } = useLanguage();
  const isFr = language === "fr";

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
        next = [current[1], tag];
      } else {
        next = [...current, tag];
      }
    }
    onUpdate({ lifestyle: next, lifestyle_tags: next });
  };

  const styleOptions: { id: StyleOption; label: string; desc: string }[] = [
    { id: "casual", label: isFr ? "Décontracté" : "Casual", desc: isFr ? "Facile, chaleureux, détendu" : "Effortless, approachable, relaxed" },
    { id: "classic", label: isFr ? "Classique" : "Classic", desc: isFr ? "Coupes nettes, intemporel, soigné" : "Tailored, timeless, structured" },
    { id: "trendy", label: isFr ? "Moderne / Tendance" : "Trendy", desc: isFr ? "Actuel, silhouettes fraîches, affirmé" : "Contemporary, directional, sharp" },
    { id: "sporty", label: isFr ? "Sportif & Actif" : "Sporty", desc: isFr ? "Tissus techniques, confort de mouvement" : "Athletic mobility, technical fabrics" },
    { id: "nerdy", label: isFr ? "Minimaliste" : "Nerdy", desc: isFr ? "Épuré, réfléchi, basiques soignés" : "Subtle, functional, considered minimalism" },
    { id: "fabulous", label: isFr ? "Élégant & Chic" : "Fabulous", desc: isFr ? "Matières nobles, luxe discret, raffiné" : "Bold drape, elevated luxury, refined" },
  ];

  const lifestyleOptions: { id: LifestyleTag; label: string; desc: string }[] = [
    { id: "office_professional", label: isFr ? "Travail en bureau" : "Office Professional", desc: isFr ? "Réunions & bureau hybride" : "Downtown hybrid & meetings" },
    { id: "new_grad", label: isFr ? "Début de carrière" : "New Grad", desc: isFr ? "Entretiens & intégration professionnelle" : "Career entry & interviews" },
    { id: "family", label: isFr ? "Famille & Quotidien" : "Family", desc: isFr ? "École, fin de semaine & confort" : "School drop-offs & weekends" },
    { id: "outdoors", label: isFr ? "Plein air & Ville" : "Outdoors", desc: isFr ? "Pluie, marche urbaine & transports" : "West Coast rain & transit" },
  ];

  const occasionTiles: { id: Occasion; label: string; context: string }[] = [
    { id: "pitch", label: isFr ? "Pitch / Présentation d'affaires" : "Pitching to investors", context: isFr ? "Crédible, rassurant sans rigidité" : "Founder stakes, VC credibility" },
    { id: "interview", label: isFr ? "Entrevue d'embauche" : "Job interview", context: isFr ? "Professionnel, compétent et soigné" : "Professional competence & poise" },
    { id: "family", label: isFr ? "Rencontre familiale" : "Meeting partner's family", context: isFr ? "Chaleureux, respectueux et élégant" : "Warm, respectful, considered" },
    { id: "date", label: isFr ? "Premier rendez-vous / Soirée" : "First date", context: isFr ? "Raffiné, à l'aise et charmant" : "Refined, comfortable, magnetic" },
    { id: "court", label: isFr ? "Cérémonie / Cadre formel" : "Court appearance", context: isFr ? "Protocole strict, tenue solennelle" : "Strict decorum, solemn respect" },
    { id: "funeral", label: isFr ? "Recueillement / Cérémonie" : "Funeral / Memorial", context: isFr ? "Respect discret, tons sobres" : "Quiet respect, subdued palette" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10 pb-20">
      {/* Header Cue */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thread/10 text-thread text-xs font-medium tracking-wide uppercase">
          {isFr ? "Profil de cabine d'essayage" : "Fitting Room Intake"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-normal">
          {isFr ? "Votre profil de style" : "Shared User Profile"}
        </h1>
        <p className="text-sm sm:text-base font-serif italic text-ink-muted max-w-xl mx-auto">
          {isFr ? "« Quelques questions simples pour trouver vos tenues idéales »" : "“Nine quick questions, about a minute”"}
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
          <div className="text-base font-serif font-medium">
            {isFr ? "Occasion spéciale" : "High-Stakes Occasion"}
          </div>
          <div className="text-xs opacity-80 mt-0.5">
            {isFr ? "1 tenue complète pensée pour votre événement" : "Exactly 1 complete outfit calibrated for room stakes"}
          </div>
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
          <div className="text-base font-serif font-medium">
            {isFr ? "Garde-robe capsule du quotidien" : "Everyday Capsule Wardrobe"}
          </div>
          <div className="text-xs opacity-80 mt-0.5">
            {isFr ? "15 pièces coordonnées & 3 tenues prêtes à porter" : "Coordinated 15-piece matrix & 3 worked outfits"}
          </div>
        </button>
      </div>

      {/* Target Occasion (Only shown when Flow A is active) */}
      {flow === "occasion" && (
        <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-serif text-ink font-medium">
              {isFr ? "Choix de l'occasion" : "Occasion Selection"}
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              {isFr ? "Choisissez le contexte précis pour lequel vous vous habillez." : "Select the specific room context you need to dress for."}
            </p>
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

          {/* Audience-Fit Free-Text Input */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {isFr ? "Précisions sur l'ambiance ou les personnes (facultatif)" : "Audience-fit context (Optional Room Expectations)"}
              </label>
              <button
                type="button"
                onClick={() => onAudienceChange(isFr ? "Rencontre d'équipe informelle dans un café à Vancouver" : "Seed fund, partners are ex-engineers, meeting at their office in Gastown")}
                className="text-xs text-thread hover:underline cursor-pointer"
              >
                {isFr ? "Exemple" : "Demo Preset"}
              </button>
            </div>
            <input
              type="text"
              value={audienceText}
              onChange={(e) => onAudienceChange(e.target.value)}
              placeholder={isFr ? "ex. Dîner avec un mentor, café décontracté ou écrivez 'NoAI' pour le mode algorithmique" : "e.g., Tech partners in Gastown, coffee chat with a mentor..."}
              className="w-full px-4 py-2.5 text-sm bg-surface border border-border rounded-fitting focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </section>
      )}

      {/* Profile Variables */}
      <section className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-8 shadow-fitting-card">
        {/* 1. Gender */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            {isFr ? "1. Rayon de vêtements" : "1. Clothing Department"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "Women", cut: "female" as GenderCut, label: isFr ? "Femme" : "Womenswear", icon: "✨" },
              { id: "Neutral", cut: "neutral" as GenderCut, label: isFr ? "Unisexe" : "Neutral", icon: "🌿" },
              { id: "Men", cut: "male" as GenderCut, label: isFr ? "Homme" : "Menswear", icon: "👔" },
            ].map((g) => {
              const isSelected = profile.gender_expression === g.id || profile.gender_cut === g.cut;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onUpdate({ gender_expression: g.id as any, gender_cut: g.cut })}
                  className={`p-3 text-center rounded-fitting border transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                      : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                  }`}
                >
                  <div className="text-base">{g.icon}</div>
                  <div className="text-xs font-semibold text-ink mt-1">{g.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Budget Tier */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            {isFr ? "2. Fourchette de prix" : "2. Price Range"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { tier: "$", label: isFr ? "$ (Accessible)" : "$ (Accessible)", desc: isFr ? "Moins de 100 $ / pièce" : "Under $100 / piece" },
              { tier: "$$", label: isFr ? "$$ (Gamme moyenne)" : "$$ (Mid-Range)", desc: isFr ? "100 $ - 250 $ / pièce" : "$100 - $250 / piece" },
              { tier: "$$$", label: isFr ? "$$$ (Haut de gamme)" : "$$$ (Premium)", desc: isFr ? "250 $+ / pièce" : "$250+ / piece" },
            ].map((b) => (
              <button
                key={b.tier}
                type="button"
                onClick={() => handleBudgetSelect(b.tier as any)}
                className={`p-3 text-left rounded-fitting border transition-all ${
                  profile.budget === b.tier || profile.budget_tier === b.tier
                    ? "border-accent bg-accent/5 ring-1 ring-accent text-ink"
                    : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                }`}
              >
                <div className="text-sm font-semibold text-ink">{b.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Clothing Size */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            {isFr ? "3. Taille habituelle" : "3. Standard Sizing"}
          </label>
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
              {isFr ? "4. Morphologie & Silhouette" : "4. Body Silhouette"}
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
              {isFr ? "Pas certain(e)" : "Not sure"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: "rectangle", label: isFr ? "Rectangle" : "Rectangle", sub: isFr ? "Silhouette droite" : "Straight column lines" },
              { id: "bottom_triangle", label: isFr ? "Poire / Triangle" : "Teardrop / Pear", sub: isFr ? "Hanches plus larges" : "Broader hips & thighs" },
              { id: "oval", label: isFr ? "Ovale / Ronde" : "Oval / Apple", sub: isFr ? "Lignes douces au centre" : "Softer rounded midsection" },
              { id: "top_triangle", label: isFr ? "Triangle inversé" : "Inverted Triangle", sub: isFr ? "Épaules larges" : "Broad athletic shoulders" },
              { id: "double_triangle", label: isFr ? "Sablier" : "Hourglass", sub: isFr ? "Taille cintrée marquée" : "Defined nipped waist" },
              { id: "standard", label: isFr ? "Standard classique" : "Standard Balanced", sub: isFr ? "Proportions équilibrées" : "Evenly distributed" },
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
              {isFr ? "5. Palette de couleurs saisonnière" : "5. Seasonal Colour Analysis"}
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
              {isFr ? "Pas certain(e)" : "Not sure"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "winter", label: isFr ? "Hiver" : "Winter", swatches: ["#1F2A44", "#1C1B19", "#FFFFFF", "#521820"], desc: isFr ? "Contraste net & marine" : "High contrast & cool navy" },
              { id: "autumn", label: isFr ? "Automne" : "Autumn", swatches: ["#B08A5B", "#3F6B4F", "#8A5A12", "#4A3319"], desc: isFr ? "Camel, forêt & ocre" : "Earthy, camel, moss & ochre" },
              { id: "summer", label: isFr ? "Été" : "Summer", swatches: ["#8CA4B8", "#B5A7BD", "#E4DED4", "#5F7482"], desc: isFr ? "Doux, poudré & bleu" : "Soft, muted & rose tones" },
              { id: "spring", label: isFr ? "Printemps" : "Spring", swatches: ["#D4A373", "#CCD5AE", "#FAEDCD", "#E76F51"], desc: isFr ? "Chaud, doré & corail" : "Warm, clear & bright tones" },
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
              {isFr ? "6. Teint de peau (facultatif)" : "6. Complexion Tone (Optional)"}
            </label>
            <span className="text-xs text-ink-muted">
              {isFr ? "Aide à suggérer votre meilleure palette" : "Used to calibrate palette if 'Not sure'"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["Light", "Medium", "Dark"] as const).map((comp) => {
              const label = isFr
                ? comp === "Light"
                  ? "Teint clair"
                  : comp === "Medium"
                  ? "Teint moyen"
                  : "Teint foncé"
                : comp;
              return (
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
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Style */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            {isFr ? "7. Style vestimentaire" : "7. Personal Style Identity"}
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
            {isFr ? "8. Météo & Climat actuel" : "8. Active Climate & Season"}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "Fall/Winter",
                label: isFr ? "Automne / Hiver (Frais & Froid)" : "Fall / Winter (Rain & Cold)",
                desc: isFr ? "Superpositions, tricots chauds & vestes imperméables" : "Layering, knitwear, water-resistant outerwear",
              },
              {
                id: "Spring/Summer",
                label: isFr ? "Printemps / Été (Doux à chaud)" : "Spring / Summer (Warm)",
                desc: isFr ? "Cotons légers, coupes décontractées & lin respirant" : "Breathable cottons, lightweight tailoring, linens",
              },
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

        {/* 9. Lifestyle Context */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              {isFr ? "9. Cadre de vie (jusqu'à 2 choix)" : "9. Lifestyle Context (Select up to 2)"}
            </label>
            <span className="text-xs text-ink-muted">
              {isFr ? "Utile pour la capsule du quotidien" : "Used for everyday capsule utility"}
            </span>
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
              <span>{isFr ? "Composition de votre look..." : "Consulting Fitting Room Engine..."}</span>
            </>
          ) : (
            <span>
              {flow === "occasion"
                ? (isFr ? "Générer ma tenue complète →" : "Generate Decisive Outfit")
                : (isFr ? "Créer ma garde-robe capsule (15 pièces) →" : "Assemble 15-Item Capsule")}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
