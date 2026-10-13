"use client";

import React, { useState, useMemo } from "react";
import { Garment, GarmentSlot, UserProfile, CapsuleAiData } from "../types/catalog";
import { matchGender } from "../lib/catalog-filter";
import {
  selectBalancedCapsule15,
  assembleWorkedOutfit,
  rankCandidates,
} from "../lib/garment-scorer";
import rawCatalog from "../data/catalog.json";
import { useLanguage } from "../lib/LanguageContext";

const catalog = rawCatalog as Garment[];

interface CapsuleResultProps {
  profile?: UserProfile;
  ownedItemIds: string[];
  onToggleOwned: (garmentId: string) => void;
  onAddToCart: (garment: Garment) => void;
  onAddAllToCart: (garments: Garment[]) => void;
  cartItemIds: string[];
  onBackToEdit: () => void;
  onReplanCapsule?: () => void;
  isReplanning?: boolean;
  capsuleAiData?: CapsuleAiData;
}

export function CapsuleResult({
  profile,
  ownedItemIds,
  onToggleOwned,
  onAddToCart,
  onAddAllToCart,
  cartItemIds,
  onBackToEdit,
  onReplanCapsule,
  isReplanning,
  capsuleAiData,
}: CapsuleResultProps) {
  const { language, t } = useLanguage();
  const isFr = language === "fr";

  const [activeCombinationIndex, setActiveCombinationIndex] = useState<number>(0);
  const [filterSlot, setFilterSlot] = useState<string>("all");
  const [capsuleIteration, setCapsuleIteration] = useState<number>(0);

  const gender = profile?.gender_expression || profile?.gender_cut || "unisex";
  const activeCatalog = useMemo(() => {
    const matched = catalog.filter((g) => matchGender(g.gender_cut, gender as any));
    return matched.length >= 10 ? matched : catalog;
  }, [gender]);

  // Select 15 modular foundation items with balanced formal/casual distribution
  const capsule15: Garment[] = useMemo(() => {
    return selectBalancedCapsule15(activeCatalog, {
      targetPalette: profile?.seasonal_colour || profile?.palette_season,
      targetStyle: profile?.style || (profile?.preferred_styles && profile?.preferred_styles[0]),
      iteration: capsuleIteration,
    });
  }, [activeCatalog, profile, capsuleIteration]);

  // Starter Set of 5 Core Foundation Pieces
  const starterSetIds = useMemo(() => {
    const top = rankCandidates(capsule15.filter((g) => g.slot === "top"), { targetFormality: 3 })[0]?.garment?.id || "";
    const bottom = rankCandidates(capsule15.filter((g) => g.slot === "bottom"), { targetFormality: 3 })[0]?.garment?.id || "";
    const outerwear = rankCandidates(capsule15.filter((g) => g.slot === "outerwear"), { targetFormality: 3 })[0]?.garment?.id || "";
    const shoes = rankCandidates(capsule15.filter((g) => g.slot === "shoes"), { targetFormality: 3 })[0]?.garment?.id || "";
    const accessory = capsule15.find((g) => g.slot === "accessory")?.id || "";

    return new Set([top, bottom, outerwear, shoes, accessory].filter(Boolean));
  }, [capsule15]);

  // 3 Worked Outfits dynamically assembled according to context and target formality
  const combinations = useMemo(() => {
    const scoringOpts = {
      targetPalette: profile?.seasonal_colour || profile?.palette_season,
      targetStyle: profile?.style || (profile?.preferred_styles && profile?.preferred_styles[0]),
    };

    // Outfit 01: Hybrid Office (Formality 4)
    const officeOutfit = assembleWorkedOutfit(capsule15, 4, "work", scoringOpts);
    const officeGarments = [officeOutfit.outerwear, officeOutfit.top, officeOutfit.bottom, officeOutfit.shoes].filter(Boolean) as Garment[];

    // Outfit 02: Downtown Studio (Formality 3)
    const studioOutfit = assembleWorkedOutfit(capsule15, 3, "smart-casual", {
      ...scoringOpts,
      excludedIds: new Set(officeGarments.map((g) => g.id)),
    });
    const studioGarments = [
      studioOutfit.top,
      studioOutfit.bottom,
      studioOutfit.shoes,
      studioOutfit.accessory || studioOutfit.outerwear,
    ].filter(Boolean) as Garment[];

    // Outfit 03: Weekend Commute & Offsite (Formality 2)
    const weekendOutfit = assembleWorkedOutfit(capsule15, 2, "casual", {
      ...scoringOpts,
      excludedIds: new Set([...officeGarments.map((g) => g.id), ...studioGarments.map((g) => g.id)]),
    });
    const weekendGarments = [
      weekendOutfit.outerwear,
      weekendOutfit.top,
      weekendOutfit.bottom,
      weekendOutfit.shoes,
    ].filter(Boolean) as Garment[];

    const defaultLooks = [
      {
        id: "combo-1",
        title: isFr
          ? "Tenue 01 : Bureau hybride & Rencontre client"
          : "Worked Outfit 01: Hybrid Office & Client Review",
        subtitle: isFr
          ? "Coupe soignée avec un confort pensé pour toute la journée"
          : "Tailored structure with breathable all-day mobility",
        formality: 4,
        garments: officeGarments,
        styling_tip: isFr
          ? "Boutonnez le veston pour vos rendez-vous formels ; mariez-le avec un pantalon habillé neutre pour une élégance canadienne sans effort."
          : "Button the blazer when entering formal rooms; pair with neutral tailored trousers for effortless Canadian polish.",
      },
      {
        id: "combo-2",
        title: isFr
          ? "Tenue 02 : Studio créatif & Rencontre d'équipe"
          : "Worked Outfit 02: Downtown Studio & Creative Standup",
        subtitle: isFr
          ? "Lignes épurées et coton doux certifié pour un style détendu"
          : "Minimalist drape paired with comfortable certified organic cotton",
        formality: 3,
        garments: studioGarments,
        styling_tip: isFr
          ? "Des superpositions douces permettent de passer aisément du bureau du matin aux espaces de cotravail de l'après-midi."
          : "Clean tonal layering allows easy movement between morning meetings and afternoon creative coworking spaces.",
      },
      {
        title: isFr
          ? "Tenue 03 : Fin de semaine & Déplacements"
          : "Worked Outfit 03: Weekend Commute & Offsite",
        subtitle: isFr
          ? "Protection météo et allure décontractée et soignée"
          : "Weatherproof protection with sleek minimalist casual lines",
        formality: 2,
        garments: weekendGarments,
        styling_tip: isFr
          ? "Des chaussures imperméables et un jean souple vous gardent bien au sec sans rien sacrifier à votre style."
          : "Waterproof footwear and flexible casual denim keep you dry and comfortable in coastal drizzle without sacrificing style.",
      },
    ];

    const aiData = capsuleAiData;
    if (aiData) {
      const looks = aiData.looks;
      if (looks && looks.length >= 3) {
        return looks.slice(0, 3).map((aiLook, idx) => {
        const defaultGarments = idx === 0 ? officeGarments : idx === 1 ? studioGarments : weekendGarments;
        let chosenGarments = defaultGarments;

        if (aiLook.garment_ids && aiLook.garment_ids.length > 0) {
          const matched = aiLook.garment_ids
            .map((id) => capsule15.find((g) => g.id === id))
            .filter(Boolean) as Garment[];
          if (matched.length >= 3) {
            chosenGarments = matched;
          }
        }

        return {
          id: `combo-${idx + 1}`,
          title: aiLook.title || defaultLooks[idx].title,
          subtitle: aiLook.subtitle || defaultLooks[idx].subtitle,
          formality: typeof aiLook.formality === "number" ? aiLook.formality : defaultLooks[idx].formality,
          garments: chosenGarments,
          styling_tip: aiLook.styling_tip || defaultLooks[idx].styling_tip,
        };
      });
      }
    }

    return defaultLooks;
  }, [capsule15, profile, isFr, capsuleAiData]);

  const handleReplan = () => {
    setCapsuleIteration((prev) => prev + 1);
    if (onReplanCapsule) {
      onReplanCapsule();
    }
  };

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
          <span>←</span> {isFr ? "Retour au profil d'essayage" : "Back to Fitting Profile"}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted font-mono">
            {isFr ? "Garde-robe capsule de 15 pièces" : "15-Piece Capsule Matrix"}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-verified/15 text-verified font-bold">
            {isFr ? "Plus de 12 déclinaisons" : "12+ Outfit Variations"}
          </span>
        </div>
      </div>

      {/* 1. Headline & Lifestyle Reasoning Paragraph */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-4 shadow-fitting-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-thread">
              {isFr ? "Votre garde-robe capsule du quotidien" : "Your Everyday Capsule Wardrobe"}
            </span>
            {capsuleAiData?.ai_model && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-semibold">
                <span>✨</span>
                <span>{isFr ? `Styliste IA • ${capsuleAiData.ai_model}` : `AI Stylist • ${capsuleAiData.ai_model}`}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleReplan}
            disabled={isReplanning}
            className="text-xs font-semibold px-3 py-1.5 rounded-fitting bg-surface border border-border hover:border-accent text-ink transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{isReplanning ? (isFr ? "Re-génération..." : "Re-curating...") : (isFr ? "Re-composer la capsule" : "Re-curate Wardrobe")}</span>
          </button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-ink font-medium">
          {isFr ? "La capsule de 15 pièces coordonnées" : "The 15-Piece Mix & Match Wardrobe"}
        </h1>
        <p className="font-serif text-[18px] sm:text-[19px] text-ink leading-relaxed italic">
          {capsuleAiData?.intro_editorial ||
            (isFr
              ? "« Conçue pour la vraie vie et la météo canadienne. Nous avons réuni 15 pièces polyvalentes aux teintes complémentaires pour que chaque haut s'accorde naturellement avec chaque bas. Fini le casse-tête du matin : un style soigné et sans effort au quotidien. »"
              : "“Designed for real life and changing Canadian weather. We handpicked 15 versatile pieces in complementary tones so that every single top pairs naturally with every bottom. No more morning guesswork—just effortless style every day.”")}
        </p>
        {capsuleAiData?.versatility_metric && (
          <div className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted bg-surface/70 border border-border/80 px-3 py-1.5 rounded-fitting">
            <span className="text-accent font-bold">⚡</span>
            <span>{capsuleAiData.versatility_metric}</span>
          </div>
        )}
      </div>

      {/* 2. 3 Worked Outfits */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg overflow-hidden shadow-fitting-raised">
        <div className="p-5 sm:p-6 border-b border-border bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-thread">
              {isFr ? "Exemples de tenues" : "Example Outfits"}
            </div>
            <h2 className="text-xl font-serif text-ink mt-0.5 font-medium">
              {isFr ? "3 combinaisons prêtes à porter" : "3 Ready-to-Wear Combinations"}
            </h2>
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
                {isFr ? `Look 0${idx + 1}` : `Look 0${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Active Worked Outfit Breakdown */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-medium text-ink">{activeCombo.title}</h3>
              <p className="text-xs text-ink-muted">{activeCombo.subtitle}</p>
            </div>
            {(() => {
              const unownedComboGarments = activeCombo.garments.filter(
                (g) => !ownedItemIds.includes(g.id) && !cartItemIds.includes(g.id)
              );
              return unownedComboGarments.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onAddAllToCart(unownedComboGarments)}
                  className="self-start sm:self-auto px-3.5 py-1.5 bg-accent text-white rounded text-xs font-medium hover:bg-accent/90 transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>
                    {isFr
                      ? `Ajouter le Look au panier (${unownedComboGarments.length})`
                      : `Add Look to Cart (${unownedComboGarments.length})`}
                  </span>
                </button>
              ) : (
                <span className="self-start sm:self-auto text-xs font-medium text-verified flex items-center gap-1">
                  ✓ {isFr ? "Look complet au panier" : "Look items in cart / owned"}
                </span>
              );
            })()}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activeCombo.garments.map((garment) => {
              const isOwned = ownedItemIds.includes(garment.id);
              const isInCart = cartItemIds.includes(garment.id);
              const productUrl = garment.product_url || garment.retailer_url;

              return (
                <div
                  key={garment.id}
                  className={`p-3 rounded-fitting border transition-all flex flex-col justify-between ${
                    isOwned ? "bg-surface/50 opacity-70 border-dashed border-border" : "bg-surface/30 border-border"
                  }`}
                >
                  <div className="space-y-2">
                    <a
                      href={productUrl || "#"}
                      target={productUrl ? "_blank" : undefined}
                      rel={productUrl ? "noopener noreferrer" : undefined}
                      className="group/img block aspect-3/4 rounded bg-surface border border-border overflow-hidden relative cursor-pointer hover:border-accent hover:ring-2 hover:ring-accent/20 transition-all"
                      title={
                        productUrl
                          ? (isFr
                              ? `Voir « ${garment.name} » chez ${garment.brand} (ouvre dans un nouvel onglet)`
                              : `View "${garment.name}" on ${garment.brand} (opens in new tab)`)
                          : undefined
                      }
                    >
                      <img src={garment.image_url} alt={garment.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" />
                      <span className="absolute bottom-1 right-1 text-[9px] uppercase font-bold bg-accent text-white px-1 rounded">
                        {garment.slot}
                      </span>
                      {productUrl && (
                        <div className="absolute inset-0 bg-ink/15 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="w-5 h-5 rounded-full bg-surface-raised/95 text-ink text-[10px] font-bold flex items-center justify-center shadow-xs">
                            ↗
                          </span>
                        </div>
                      )}
                    </a>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-thread">{garment.brand}</div>
                      <div className="text-xs font-serif font-medium text-ink line-clamp-1">
                        <a
                          href={productUrl || "#"}
                          target={productUrl ? "_blank" : undefined}
                          rel={productUrl ? "noopener noreferrer" : undefined}
                          className="hover:text-accent hover:underline decoration-accent/40 transition-colors inline-flex items-center gap-1 group/title cursor-pointer max-w-full"
                          title={
                            productUrl
                              ? (isFr
                                  ? `Voir « ${garment.name} » chez ${garment.brand} (ouvre dans un nouvel onglet)`
                                  : `View "${garment.name}" on ${garment.brand} (opens in new tab)`)
                              : undefined
                          }
                        >
                          <span className="truncate">{garment.name}</span>
                          {productUrl && (
                            <span className="text-[10px] text-ink-muted/70 group-hover/title:text-accent group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all shrink-0">
                              ↗
                            </span>
                          )}
                        </a>
                      </div>
                      <div className="text-xs font-bold text-ink font-mono mt-0.5">
                        ${(garment.price_cad || garment.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
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
                        <span>{isOwned ? (isFr ? "Déjà acquis" : "Owned") : (isFr ? "J'ai cette pièce" : "I have this")}</span>
                      </label>

                      {productUrl && (
                        <a
                          href={productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-thread hover:underline font-medium text-[10px]"
                        >
                          {isFr ? "Boutique ↗" : "Store ↗"}
                        </a>
                      )}
                    </div>

                    {!isOwned && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(garment)}
                        disabled={isInCart}
                        className={`w-full py-1.5 rounded text-[11px] font-medium transition-all ${
                          isInCart
                            ? "bg-verified/15 text-verified border border-verified/30 cursor-default"
                            : "bg-surface border border-border text-ink hover:border-accent hover:bg-accent/5 cursor-pointer"
                        }`}
                      >
                        {isInCart ? (isFr ? "✓ Au panier" : "✓ In Cart") : (isFr ? "+ Panier" : "+ Cart")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-surface/60 border border-border rounded-fitting p-3.5 flex items-start gap-2.5 text-xs text-ink-muted">
            <span className="text-thread font-bold">{isFr ? "Conseil de style :" : "Styling Note:"}</span>
            <span>{activeCombo.styling_tip}</span>
          </div>
        </div>
      </div>

      {/* 3. 15-Item Interactive Grid with Starter Set of 5 Highlight */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-raised">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-thread">
                {isFr ? "Inventaire de la capsule" : "Capsule Inventory"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-surface border border-border text-ink-muted font-mono">
                {isFr ? "15 pièces" : "15 Items"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-ink mt-0.5 font-medium">
              {isFr ? "Grille des 15 pièces coordonnées" : "Coordinated Capsule Grid"}
            </h2>
          </div>

          {/* Running Totals */}
          <div className="flex flex-wrap items-center gap-4 text-right">
            <div className="bg-surface border border-border rounded-fitting px-3 py-2 text-left">
              <div className="text-[11px] font-bold text-thread uppercase tracking-wider">
                {isFr ? "Trousse de départ (5 pièces)" : "Starter Set of 5"}
              </div>
              <div className="text-sm font-bold text-ink font-mono">${starterSetTotal.toFixed(2)} CAD</div>
            </div>
            <div className="bg-surface border border-border rounded-fitting px-3 py-2 text-left">
              <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                {unownedCapsuleItems.length < 15
                  ? (isFr ? `Pièces à acquérir (${unownedCapsuleItems.length})` : `Remaining (${unownedCapsuleItems.length})`)
                  : (isFr ? "Total des 15 pièces" : "Full 15-Piece Total")}
              </div>
              <div className="text-sm font-bold text-ink font-mono">${unownedCapsuleTotal.toFixed(2)} CAD</div>
            </div>
            <button
              type="button"
              onClick={() => onAddAllToCart(unownedCapsuleItems)}
              disabled={unownedCapsuleItems.length === 0}
              className="py-2.5 px-4 rounded-fitting bg-accent hover:bg-navy-light text-white text-xs font-semibold tracking-wide transition-all disabled:opacity-40 cursor-pointer"
            >
              {unownedCapsuleItems.length === 0
                ? (isFr ? "Votre garde-robe couvre tout" : "Wardrobe Covers This")
                : (isFr ? `Tout ajouter au panier (${unownedCapsuleItems.length})` : `Add All to Cart (${unownedCapsuleItems.length})`)}
            </button>
          </div>
        </div>

        {/* Slot Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: isFr ? "Toutes les 15 pièces" : "All 15 Pieces" },
            { id: "starter", label: isFr ? "★ Trousse clé (5 pièces)" : "★ Starter Set of 5" },
            { id: "outerwear", label: isFr ? "Vestes (3)" : "Outerwear (3)" },
            { id: "top", label: isFr ? "Hauts (5)" : "Tops (5)" },
            { id: "bottom", label: isFr ? "Bas (4)" : "Bottoms (4)" },
            { id: "shoes", label: isFr ? "Chaussures (2)" : "Shoes (2)" },
            { id: "accessory", label: isFr ? "Accessoires (1)" : "Accessories (1)" },
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
            const productUrl = garment.product_url || garment.retailer_url;

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
                  <a
                    href={productUrl || "#"}
                    target={productUrl ? "_blank" : undefined}
                    rel={productUrl ? "noopener noreferrer" : undefined}
                    className="group/img block aspect-3/4 rounded bg-surface border border-border overflow-hidden relative cursor-pointer hover:border-accent hover:ring-2 hover:ring-accent/20 transition-all"
                    title={
                      productUrl
                        ? (isFr
                            ? `Voir « ${garment.name} » chez ${garment.brand} (ouvre dans un nouvel onglet)`
                            : `View "${garment.name}" on ${garment.brand} (opens in new tab)`)
                        : undefined
                    }
                  >
                    {garment.image_url ? (
                      <img
                        src={garment.image_url}
                        alt={garment.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-ink-muted bg-surface/80">
                        {isFr ? "Image" : "No Img"}
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] uppercase font-bold bg-accent text-white px-1 rounded">
                      {garment.slot}
                    </span>
                    {isStarter && (
                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-thread text-white px-1.5 py-0.5 rounded shadow-xs">
                        {isFr ? "★ Clé" : "★ Core"}
                      </span>
                    )}
                    {productUrl && (
                      <div className="absolute inset-0 bg-ink/15 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="w-5 h-5 rounded-full bg-surface-raised/95 text-ink text-[10px] font-bold flex items-center justify-center shadow-xs">
                          ↗
                        </span>
                      </div>
                    )}
                  </a>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-thread tracking-wider">{garment.brand}</div>
                    <h4 className="text-xs font-serif font-medium text-ink line-clamp-1 mt-0.5">
                      <a
                        href={productUrl || "#"}
                        target={productUrl ? "_blank" : undefined}
                        rel={productUrl ? "noopener noreferrer" : undefined}
                        className="hover:text-accent hover:underline decoration-accent/40 transition-colors inline-flex items-center gap-1 group/title cursor-pointer max-w-full"
                        title={
                          productUrl
                            ? (isFr
                                ? `Voir « ${garment.name} » chez ${garment.brand} (ouvre dans un nouvel onglet)`
                                : `View "${garment.name}" on ${garment.brand} (opens in new tab)`)
                            : undefined
                        }
                      >
                        <span className="truncate">{garment.name}</span>
                        {productUrl && (
                          <span className="text-[10px] text-ink-muted/70 group-hover/title:text-accent group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all shrink-0">
                            ↗
                          </span>
                        )}
                      </a>
                    </h4>
                    <div className="text-xs font-bold text-ink font-mono mt-1">
                      ${(garment.price_cad || garment.price || 0).toFixed(2)} CAD
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="flex items-center gap-1.5 text-ink-muted cursor-pointer hover:text-ink">
                      <input
                        type="checkbox"
                        checked={isOwned}
                        onChange={() => {
                          onToggleOwned(garment.id);
                          if (onReplanCapsule) onReplanCapsule();
                        }}
                        className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent"
                      />
                      <span>{isOwned ? (isFr ? "Acquis" : "Owned") : (isFr ? "J'ai déjà" : "I have this")}</span>
                    </label>

                    <a
                      href={garment.retailer_url || garment.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-thread hover:underline font-medium text-[10px]"
                    >
                      {isFr ? "Boutique ↗" : "Store ↗"}
                    </a>
                  </div>

                  {!isOwned && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(garment)}
                      disabled={isInCart}
                      className={`w-full py-1 rounded text-[11px] font-medium transition-all ${
                        isInCart
                          ? "bg-verified/15 text-verified border border-verified/30 cursor-default"
                          : "bg-surface border border-border text-ink hover:border-accent cursor-pointer"
                      }`}
                    >
                      {isInCart ? (isFr ? "✓ Au panier" : "✓ In Cart") : (isFr ? "+ Panier" : "+ Cart")}
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
