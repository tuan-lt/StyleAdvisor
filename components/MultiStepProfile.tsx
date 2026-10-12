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
import { useLanguage } from "../lib/LanguageContext";

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
  const { language, t } = useLanguage();
  const isFr = language === "fr";

  // Step index:
  // 0 -> Step 01: Styling Goal & Fit (Goal + Gender Cut)
  // 1 -> Step 02: Occasion / Setting (Event / Routine)
  // 2 -> Step 03: Personal Style
  // 3 -> Step 04: Body Shape & Proportions
  // 4 -> Step 05: Color Palette & Complexion
  // 5 -> Step 06: Weather, Sizing & Budget -> Final Submit
  const [currentStep, setCurrentStep] = useState<number>(0);

  const TOTAL_STEPS = 6;

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
  // DATA AND OPTIONS (FRIENDLY & RELATABLE)
  // ----------------------------------------------------

  const genderOptions = [
    {
      id: "Female",
      cut: "female" as GenderCut,
      icon: "✨",
      label: isFr ? "Mode féminine" : "Womenswear",
      desc: isFr
        ? "Vestons ajustés, pantalons fluides, robes et silhouettes féminines"
        : "Tailored blazers, fluid trousers, dresses, and feminine silhouettes",
    },
    {
      id: "Neutral",
      cut: "neutral" as GenderCut,
      icon: "🌿",
      label: isFr ? "Unisexe / Neutre" : "Neutral",
      desc: isFr
        ? "Lignes minimalistes, coupes décontractées et essentiels faciles à agencer"
        : "Clean minimal lines, relaxed boxy fits, and versatile everyday cuts",
    },
    {
      id: "Male",
      cut: "male" as GenderCut,
      icon: "👔",
      label: isFr ? "Mode masculine" : "Menswear",
      desc: isFr
        ? "Épaules structurées, chinos classiques, chemises nettes et tricots doux"
        : "Structured shoulders, classic chinos, clean button-ups, and knitwear",
    },
  ];

  const styleArchetypes = [
    {
      id: "classic",
      label: isFr ? "Classique & Soigné" : "Classic & Sharp",
      desc: isFr
        ? "Coupes intemporelles, chemises nettes, lignes épurées et souliers cirés"
        : "Timeless tailoring, crisp shirts, clean lines, and polished shoes",
      images: {
        male: "/images/styles/menswear_classic.jpg",
        female: "/images/styles/womenswear_classic.jpg",
        neutral: "/images/styles/neutral_classic.jpg",
      },
    },
    {
      id: "casual",
      label: isFr ? "Facile & Décontracté" : "Easygoing & Relaxed",
      desc: isFr
        ? "Chinos confortables, cotons doux, baskets simples et allure détendue"
        : "Comfy chinos, soft cotton layers, simple sneakers, and clean everyday vibes",
      images: {
        male: "/images/styles/menswear_casual.jpg",
        female: "/images/styles/womenswear_casual.jpg",
        neutral: "/images/styles/neutral_casual.jpg",
      },
    },
    {
      id: "trendy",
      label: isFr ? "Moderne & Tendance" : "Modern & Streetwise",
      desc: isFr
        ? "Coupes amples, plis fluides, matières actuelles et silhouettes fraîches"
        : "Boxy cuts, relaxed pleats, contemporary streetwear textures, and fresh silhouettes",
      images: {
        male: "/images/styles/menswear_trendy.jpg",
        female: "/images/styles/womenswear_trendy.jpg",
        neutral: "/images/styles/neutral_trendy.jpg",
      },
    },
    {
      id: "sporty",
      label: isFr ? "Actif & Urbain" : "Active & Commuter",
      desc: isFr
        ? "Matières extensibles techniques, vestes imperméables et confort sportif"
        : "Stretch performance fabrics, sleek water-repellent layers, and athletic comfort",
      images: {
        male: "/images/styles/menswear_sporty.jpg",
        female: "/images/styles/womenswear_sporty.jpg",
        neutral: "/images/styles/neutral_sporty.jpg",
      },
    },
    {
      id: "nerdy",
      label: isFr ? "Minimaliste & Réfléchi" : "Smart & Minimalist",
      desc: isFr
        ? "Basiques soignés, cols roulés fins, mailles douces et simplicité élégante"
        : "Thoughtful basics, fine turtlenecks, tasteful knitwear, and founder-chic simplicity",
      images: {
        male: "/images/styles/menswear_nerdy.jpg",
        female: "/images/styles/womenswear_nerdy.jpg",
        neutral: "/images/styles/neutral_nerdy.jpg",
      },
    },
    {
      id: "fabulous",
      label: isFr ? "Élégant & Haut de gamme" : "Elevated & Luxurious",
      desc: isFr
        ? "Mélanges laine et cachemire, textures subtiles et luxe discret"
        : "Fine wool-cashmere blends, subtle textures, and understated quiet luxury",
      images: {
        male: "/images/styles/menswear_fabulous.jpg",
        female: "/images/styles/womenswear_fabulous.jpg",
        neutral: "/images/styles/neutral_fabulous.jpg",
      },
    },
  ];

  const bodyTypeOptions = [
    {
      id: "rectangle",
      label: isFr ? "Rectangle / Droit" : "Rectangle / Straight",
      tag: isFr ? "Silhouette droite" : "Straight Frame",
      sub: isFr
        ? "Épaules et hanches de largeur similaire ; parfait pour les vestes superposées et coupes droites"
        : "Shoulders and hips are about the same width; great for layered jackets and neat tailoring",
      images: {
        female: "/images/body-shapes/rectangle.png",
        male: "/images/body-shapes/male_rectangle.png",
        neutral: "/images/body-shapes/male_rectangle.png",
      },
    },
    {
      id: "bottom_triangle",
      label: isFr ? "Poire / Triangle" : "Pear / Triangle",
      tag: isFr ? "Silhouette en A" : "A-Frame",
      sub: isFr
        ? "Hanches un peu plus larges que les épaules ; harmonisé avec des hauts travaillés et pantalons fluides"
        : "Hips are slightly wider than shoulders; balanced with eye-catching tops and easy wide-leg pants",
      images: {
        female: "/images/body-shapes/pear.png",
        male: "/images/body-shapes/male_triangle.png",
        neutral: "/images/body-shapes/male_triangle.png",
      },
    },
    {
      id: "oval",
      label: isFr ? "Ovale / Ronde" : "Oval / Round",
      tag: isFr ? "Silhouette douce" : "Soft Frame",
      sub: isFr
        ? "Buste ou taille plus généreux ; superbe avec vestes ouvertes, tombés fluides et coupes confortables"
        : "Fuller midsection; looks great with open jackets, soft vertical drapes, and relaxed fits",
      images: {
        female: "/images/body-shapes/oval.png",
        male: "/images/body-shapes/male_oval.png",
        neutral: "/images/body-shapes/male_oval.png",
      },
    },
    {
      id: "top_triangle",
      label: isFr ? "Triangle inversé" : "Inverted Triangle",
      tag: isFr ? "Silhouette en V" : "V-Frame",
      sub: isFr
        ? "Épaules larges et hanches plus étroites ; mis en valeur par des bas droits ou amples et vestes déstructurées"
        : "Broad shoulders tapering down to narrower hips; looks best with relaxed pants and softer shoulders",
      images: {
        female: "/images/body-shapes/inverted_triangle.png",
        male: "/images/body-shapes/male_inverted_triangle.png",
        neutral: "/images/body-shapes/male_inverted_triangle.png",
      },
    },
    {
      id: "double_triangle",
      label: isFr ? "Sablier" : "Hourglass",
      tag: isFr ? "Silhouette cintrée" : "Curved Frame",
      sub: isFr
        ? "Buste et hanches équilibrés avec taille marquée ; sublimé par des coupes cintrées et manteaux ceinturés"
        : "Balanced bust and hips with a defined waist; highlighted by fitted styles and belted coats",
      images: {
        female: "/images/body-shapes/hourglass.png",
        male: "/images/body-shapes/male_hourglass.png",
        neutral: "/images/body-shapes/hourglass.png",
      },
    },
    {
      id: "standard",
      label: isFr ? "Trapèze / Régulier" : "Trapezoid / Regular",
      tag: isFr ? "Coupe classique" : "Classic Fit",
      sub: isFr
        ? "Proportions équilibrées convenant à la plupart des coupes canadiennes de prêt-à-porter standard"
        : "Proportional build that works well with most standard off-the-rack Canadian cuts",
      images: {
        female: "/images/body-shapes/standard.png",
        male: "/images/body-shapes/male_trapezoid.png",
        neutral: "/images/body-shapes/standard.png",
      },
    },
  ];

  const seasonalPalettes = [
    {
      id: "winter" as PaletteSeason,
      name: isFr ? "Palette Hiver" : "Winter Palette",
      icon: "❄️",
      undertone: isFr ? "Frais & Fort contraste" : "Cool & High Contrast",
      accentBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      desc: isFr
        ? "Net, intense & froid : Bleu marine profond, noir pur, blanc éclatant, bordeaux & vert pin"
        : "Crisp, bold & cool: Deep Navy, Pure Black, Stark White, Crimson Burgundy & Pine Green",
      swatches: ["#0B0F19", "#FFFFFF", "#1E3A8A", "#BE123C", "#0D9488", "#581C87", "#0284C7", "#9D174D"],
    },
    {
      id: "spring" as PaletteSeason,
      name: isFr ? "Palette Printemps" : "Spring Palette",
      icon: "🌸",
      undertone: isFr ? "Chaud & Éclat doré" : "Warm & Radiant Glow",
      accentBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      desc: isFr
        ? "Frais, chaleureux & lumineux : Camel doré, corail, ambre miel, blé & turquoise"
        : "Fresh, warm & sunny: Warm Camel, Coral Pink, Honey Amber, Golden Wheat & Turquoise",
      swatches: ["#D97706", "#EA580C", "#0D9488", "#CA8A04", "#F59E0B", "#FEF3C7", "#14B8A6", "#FB923C"],
    },
    {
      id: "autumn" as PaletteSeason,
      name: isFr ? "Palette Automne" : "Autumn Palette",
      icon: "🍂",
      undertone: isFr ? "Chaud & Terres riches" : "Warm & Earthy Rich",
      accentBg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      desc: isFr
        ? "Profond, boisé & chaleureux : Rouille, vert forêt, ocre épicé, chocolat noir & cannelle"
        : "Deep, earthy & spicy: Rich Rust, Forest Green, Spicy Ochre, Dark Chocolate & Cinnamon",
      swatches: ["#9A3412", "#15803D", "#A16207", "#78350F", "#C2410C", "#FDE68A", "#4D7C0F", "#B45309"],
    },
    {
      id: "summer" as PaletteSeason,
      name: isFr ? "Palette Été" : "Summer Palette",
      icon: "☀️",
      undertone: isFr ? "Frais & Doux poudré" : "Cool & Soft Muted",
      accentBg: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      desc: isFr
        ? "Doux, apaisant & poudré : Gris ardoise, vieux rose, bleu poudré, lavande & avoine douce"
        : "Soft, gentle & muted: Slate Grey, Dusty Rose, Powder Blue, Muted Lavender & Soft Oatmeal",
      swatches: ["#334155", "#64748B", "#94A3B8", "#A855F7", "#F1F5F9", "#BE185D", "#475569", "#7C3AED"],
    },
  ];

  const occasionOptions = [
    {
      id: "pitch" as Occasion,
      label: isFr ? "Présentation / Réunion d'affaires" : "Pitching or Big Meeting",
      context: isFr
        ? "Rencontre de partenaires ou clients — crédible sans paraître trop guindé"
        : "Meeting partners, pitching clients or presenting — look credible without feeling overdressed",
      image: "/images/occasions/pitch.jpg",
    },
    {
      id: "interview" as Occasion,
      label: isFr ? "Entrevue d'embauche" : "Job Interview",
      context: isFr
        ? "Confiant, soigné et professionnel pour faire une excellente première impression"
        : "Confident, sharp, and put-together so you make a great first impression",
      image: "/images/occasions/interview.jpg",
    },
    {
      id: "family" as Occasion,
      label: isFr ? "Rencontre de famille" : "Meeting the Family",
      context: isFr
        ? "Chaleureux, respectueux et élégant pour les réunions de famille"
        : "Warm, respectful, and comfortably stylish for family gatherings",
      image: "/images/occasions/family.jpg",
    },
    {
      id: "date" as Occasion,
      label: isFr ? "Soirée / Sortie au restaurant" : "Date Night or Dinner Out",
      context: isFr
        ? "Naturellement charmant et confortable pour un souper ou un verre en ville"
        : "Effortlessly charming and comfortable for an evening dinner or drinks",
      image: "/images/occasions/date.jpg",
    },
    {
      id: "court" as Occasion,
      label: isFr ? "Cérémonie / Cadre officiel" : "Formal / Official Event",
      context: isFr
        ? "Sobre, conservateur et impeccable pour les cérémonies et contextes formels"
        : "Clean, conservative, and polished for ceremonies or official settings",
      image: "/images/occasions/court.jpg",
    },
    {
      id: "funeral" as Occasion,
      label: isFr ? "Événement solennel / Recueillement" : "Memorial or Solemn Event",
      context: isFr
        ? "Respectueux, sobre, discret et digne"
        : "Respectful, dark, understated and dignified",
      image: "/images/occasions/funeral.jpg",
    },
  ];

  const lifestyleOptions = [
    {
      id: "office_professional" as LifestyleTag,
      label: isFr ? "Bureau & Travail hybride" : "Work & Hybrid Office",
      desc: isFr
        ? "Partagé entre le télétravail et les réunions au bureau en ville"
        : "Split between home desk and downtown office meetings",
      image: "/images/lifestyles/office_professional.jpg",
    },
    {
      id: "new_grad" as LifestyleTag,
      label: isFr ? "Début de carrière / Diplômé" : "Starting Out / New Grad",
      desc: isFr
        ? "Une garde-robe de base fiable et abordable pour faire bonne impression"
        : "Building a reliable starter wardrobe that punches above its price tag",
      image: "/images/lifestyles/new_grad.jpg",
    },
    {
      id: "family" as LifestyleTag,
      label: isFr ? "Famille & Fin de semaine" : "Family & Weekend Routine",
      desc: isFr
        ? "École, courses, café du samedi et confort pratique toute la journée"
        : "School drop-offs, weekend coffee, errands and all-day durable comfort",
      image: "/images/lifestyles/family.jpg",
    },
    {
      id: "outdoors" as LifestyleTag,
      label: isFr ? "En déplacement & Transports" : "Transit & On-the-Go",
      desc: isFr
        ? "Superpositions parées pour la météo, la marche urbaine et les sorties"
        : "Weather-ready layers for city walking, transit, and spontaneous weekend plans",
      image: "/images/lifestyles/outdoors.jpg",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      {/* Step Progress Tracker & Guiding Header */}
      <div className="bg-surface-raised border border-border rounded-fitting-lg p-5 sm:p-6 shadow-fitting-card space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-thread/15 text-thread uppercase tracking-wider font-bold">
              {isFr ? `Étape 0${currentStep + 1} sur 0${TOTAL_STEPS}` : `Step 0${currentStep + 1} of 0${TOTAL_STEPS}`}
            </span>
            <span className="text-ink-muted hidden sm:inline-block">
              {currentStep === 0 && (isFr ? "Objectif & Silhouette" : "Styling Goal & Fit")}
              {currentStep === 1 && (flow === "occasion" ? (isFr ? "Où allez-vous ?" : "Where are you heading?") : (isFr ? "Votre quotidien" : "Your Weekly Routine"))}
              {currentStep === 2 && (isFr ? "Votre style" : "Your Style Vibe")}
              {currentStep === 3 && (isFr ? "Votre morphologie" : "Your Body Shape")}
              {currentStep === 4 && (isFr ? "Vos meilleures couleurs" : "Your Best Colors")}
              {currentStep === 5 && (isFr ? "Tailles, Météo & Budget" : "Sizes, Weather & Budget")}
            </span>
          </div>

          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="text-ink-muted hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>←</span> {t.common.back}
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
      {/* STEP 01: GOAL SELECTION & SIZING FIT */}
      {/* ============================================================ */}
      {currentStep === 0 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-8 shadow-fitting-card animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-2 border-b border-border pb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-thread">
              {isFr ? "Étape 01 • Objectif & Silhouette" : "Step 01 • Styling Goal & Fit"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-ink font-normal">
              {isFr ? "Que préparons-nous aujourd'hui ?" : "What are we styling today?"}
            </h1>
            <p className="text-sm sm:text-base text-ink-muted max-w-lg mx-auto">
              {isFr
                ? "Choisissez votre objectif, puis la coupe avec laquelle vous vous sentez le plus à l'aise."
                : "Pick your goal, then choose the clothing cut you feel most comfortable wearing."}
            </p>
          </div>

          {/* Goal selection */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">
              {isFr ? "1. Choisissez votre objectif" : "1. Choose your styling goal"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FLOW A CARD */}
              <div
                onClick={() => onFlowChange("occasion")}
                className={`group rounded-fitting border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  flow === "occasion"
                    ? "border-accent ring-2 ring-accent/30 bg-surface/90 shadow-xs"
                    : "border-border hover:border-thread/50 bg-surface/30 hover:bg-surface/50"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0 leading-none">🎯</span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-ink group-hover:text-accent transition-colors">
                      {isFr ? "Une tenue parfaite pour une occasion" : "One Perfect Outfit for an Event"}
                    </h3>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {isFr
                      ? "Un entretien, une présentation, un rendez-vous ou une fête de famille ? Obtenez 1 tenue complète de la tête aux pieds spécialement pensée pour l'occasion."
                      : "Have an upcoming interview, big meeting, date, or family gathering? Get 1 complete head-to-toe outfit tailored specifically for the occasion."}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className={flow === "occasion" ? "font-bold text-accent" : "text-ink-muted"}>
                    {flow === "occasion"
                      ? (isFr ? "✓ Sélectionné" : "✓ Selected")
                      : (isFr ? "Toucher pour choisir" : "Tap to select")}
                  </span>
                </div>
              </div>

              {/* FLOW B CARD */}
              <div
                onClick={() => onFlowChange("everyday")}
                className={`group rounded-fitting border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  flow === "everyday"
                    ? "border-accent ring-2 ring-accent/30 bg-surface/90 shadow-xs"
                    : "border-border hover:border-thread/50 bg-surface/30 hover:bg-surface/50"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0 leading-none">🔄</span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-ink group-hover:text-thread transition-colors">
                      {isFr ? "Garde-robe capsule du quotidien" : "Everyday Mix-and-Match Capsule"}
                    </h3>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {isFr
                      ? "Fatigué(e) d'un placard plein sans rien à vous mettre ? Créez une capsule de 15 pièces modulables où chaque pièce s'agence naturellement avec les autres."
                      : "Tired of a full closet with nothing to wear? Build a versatile 15-piece wardrobe where every top, bottom, and layer matches naturally."}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className={flow === "everyday" ? "font-bold text-thread" : "text-ink-muted"}>
                    {flow === "everyday"
                      ? (isFr ? "✓ Sélectionné" : "✓ Selected")
                      : (isFr ? "Toucher pour choisir" : "Tap to select")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gender / Sizing Fit Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">
              {isFr ? "2. Rayon vestimentaire" : "2. Department"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {genderOptions.map((g) => {
                const isSelected =
                  profile.gender_expression === g.id || profile.gender_cut === g.cut;
                return (
                  <div
                    key={g.id}
                    onClick={() => onUpdate({ gender_expression: g.id as any, gender_cut: g.cut })}
                    className={`group rounded-fitting border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "border-accent ring-2 ring-accent/30 bg-surface/90 shadow-xs"
                        : "border-border hover:border-thread/50 bg-surface/30 hover:bg-surface/50"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0 leading-none">{g.icon}</span>
                        <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors">
                          {g.label}
                        </h3>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {g.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className={isSelected ? "font-bold text-accent" : "text-ink-muted"}>
                        {isSelected
                          ? (isFr ? "✓ Sélectionné" : "✓ Selected")
                          : (isFr ? "Toucher pour choisir" : "Tap to select")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1 Continue button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer shadow-xs"
            >
              {isFr
                ? `Continuer vers ${flow === "occasion" ? "l'événement" : "le quotidien"} →`
                : `Continue to ${flow === "occasion" ? "The Event" : "Weekly Routine"} →`}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 02: OCCASION & SETTING */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          {flow === "occasion" ? (
            /* FLOW A: 6 Occasion Photo Tiles + Audience Free-Text */
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-thread">
                  {isFr ? "Étape 02 • L'Événement" : "Step 02 • The Event"}
                </div>
                <h2 className="text-2xl font-serif text-ink font-medium mt-1">
                  {isFr ? "Où allez-vous ?" : "Where are you heading?"}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">
                  {isFr
                    ? "Indiquez l'événement pour nous permettre d'adapter le bon niveau de tenue et de confort."
                    : "Pick the event or meeting so we can tailor the right level of polish and formality."}
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
                          ? "border-accent ring-2 ring-accent/30 bg-surface/50 shadow-xs"
                          : "border-border hover:border-thread/50 bg-surface/20"
                      }`}
                    >
                      <div>
                        <div className="aspect-[16/10] relative overflow-hidden bg-surface">
                          <img
                            src={occ.image}
                            alt={occ.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
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

              {/* Free Text Input for Extra Context */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink">
                    {isFr
                      ? "Des précisions sur l'endroit ou les personnes ? (Facultatif)"
                      : "Any extra details about the vibe? (Optional)"}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      onAudienceChange(
                        isFr
                          ? "Rencontre avec des fondateurs de start-up dans un café à Vancouver"
                          : "Meeting tech startup founders at a casual coffee shop in Vancouver"
                      )
                    }
                    className="text-xs text-thread hover:underline cursor-pointer"
                  >
                    {isFr ? "Exemple" : "Use example"}
                  </button>
                </div>
                <input
                  type="text"
                  value={audienceText}
                  onChange={(e) => onAudienceChange(e.target.value)}
                  placeholder={
                    isFr
                      ? "ex. Café informel avec un collègue, dîner entre amis, ou écrivez 'NoAI' pour le mode déterministe"
                      : "e.g. Meeting tech partners at a casual cafe, or type 'NoAI' for pure algorithm mode"
                  }
                  className="w-full px-4 py-3 text-sm bg-surface/40 border border-border rounded-fitting focus:outline-none focus:ring-1 focus:ring-accent focus:bg-surface-raised transition-all"
                />
                {/\bno[-_\s]?ai\b/i.test(audienceText) && (
                  <div className="flex items-center gap-1.5 text-xs text-thread font-medium pt-1 animate-fadeIn">
                    <span>⚡</span>
                    <span>
                      {isFr
                        ? "Mode NoAI actif : Algorithmes de style déterministes purs."
                        : "NoAI mode active: Using pure deterministic styling algorithms (no AI models will be called)."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FLOW B: 4 Lifestyle Tiles */
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-thread">
                  {isFr ? "Étape 02 • Rythme de la semaine" : "Step 02 • Weekly Routine"}
                </div>
                <h2 className="text-2xl font-serif text-ink font-medium mt-1">
                  {isFr ? "À quoi ressemble votre semaine ?" : "What does your week look like?"}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">
                  {isFr
                    ? "Choisissez jusqu'à 2 cadres qui décrivent votre routine habituelle."
                    : "Choose up to 2 settings that describe your regular everyday routine."}
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
                          ? "border-accent ring-2 ring-accent/30 bg-surface/50 shadow-xs"
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

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer shadow-xs"
            >
              {isFr ? "Continuer vers le style personnel →" : "Continue to Personal Style →"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 03: PERSONAL STYLE IDENTITY */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-thread">
              {isFr ? "Étape 03 • Style personnel" : "Step 03 • Personal Style"}
            </div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-1">
              {isFr ? "Quel est votre style préféré ?" : "What's your preferred style vibe?"}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              {isFr
                ? "Choisissez l'esthétique dans laquelle vous vous sentez le plus naturel et à l'aise."
                : "Choose the aesthetic that feels most natural and comfortable to you."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {styleArchetypes.map((st) => {
              const currentGenderCut: "female" | "male" | "neutral" =
                profile.gender_cut === "female" || profile.gender_expression === "Female"
                  ? "female"
                  : profile.gender_cut === "male" || profile.gender_expression === "Male"
                  ? "male"
                  : "neutral";
              const styleImg = st.images[currentGenderCut] || st.images.male;
              const isSelected =
                profile.style === st.id || profile.preferred_styles?.includes(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => onUpdate({ style: st.id, preferred_styles: [st.id] })}
                  className={`group rounded-fitting border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30 bg-surface/50 shadow-xs"
                      : "border-border hover:border-thread/50 bg-surface/20"
                  }`}
                >
                  <div>
                    <div className="aspect-[3/4] relative overflow-hidden bg-surface">
                      <img
                        src={styleImg}
                        alt={st.label}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
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
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer shadow-xs"
            >
              {isFr ? "Continuer vers la morphologie →" : "Continue to Body Shape →"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 04: BODY SILHOUETTE & PROPORTIONS */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-thread">
                {isFr ? "Étape 04 • Morphologie & Coupe" : "Step 04 • Body Fit & Shape"}
              </div>
              <h2 className="text-2xl font-serif text-ink font-medium mt-1">
                {isFr ? "Quelle est votre morphologie ?" : "What's your body shape?"}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                {isFr
                  ? "Nous aide à choisir des coupes et des longueurs qui mettent naturellement en valeur votre silhouette."
                  : "Helps us pick cuts, sleeve lengths, and jacket structures that look great on your build."}
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
              {isFr ? "Pas certain(e) ? (Choisir Standard)" : "Not sure? (Pick Standard)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {bodyTypeOptions.map((b) => {
              const currentGenderCut: "female" | "male" | "neutral" =
                profile.gender_cut === "female" || profile.gender_expression === "Female"
                  ? "female"
                  : profile.gender_cut === "male" || profile.gender_expression === "Male"
                  ? "male"
                  : "neutral";
              const bodyImg = b.images[currentGenderCut] || b.images.male;
              const isSelected = profile.body_type === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => onUpdate({ body_type: b.id as BodyType })}
                  className={`group rounded-fitting-lg border overflow-hidden cursor-pointer transition-all duration-300 shadow-fitting-card hover:shadow-fitting-raised flex flex-col justify-between ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30 bg-surface-raised"
                      : "border-border hover:border-thread/50 bg-surface-raised"
                  }`}
                >
                  <div>
                    <div className="aspect-[4/5] relative overflow-hidden bg-white p-3 flex items-center justify-center border-b border-border">
                      <img
                        src={bodyImg}
                        alt={b.label}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-surface-raised/95 backdrop-blur-xs text-ink text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-border shadow-xs">
                        {b.tag}
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h4 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">{b.label}</h4>
                      <p className="text-xs text-ink-muted leading-relaxed">{b.sub}</p>
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
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer shadow-xs"
            >
              {isFr ? "Continuer vers la palette de couleurs →" : "Continue to Color Palette →"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 05: 4-SEASON COLOR ANALYSIS & COMPLEXION */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-7 shadow-fitting-card animate-fadeIn">
          {/* Header */}
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-thread">
                {isFr ? "Étape 05 • Palette de couleurs" : "Step 05 • Color Palette"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-ink font-medium mt-1">
                {isFr ? "Quelles couleurs vous mettent en valeur ?" : "What colors look best on you?"}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                {isFr
                  ? "Choisissez la palette saisonnière qui illumine naturellement votre teint, vos yeux et vos cheveux."
                  : "Choose the seasonal color palette that naturally complements your skin tone, eyes, and hair."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handlePaletteSelect("not_sure");
                handleNext();
              }}
              className="text-xs px-3.5 py-2 rounded-fitting bg-surface border border-border text-ink-muted hover:text-ink cursor-pointer shrink-0 transition-all shadow-xs"
            >
              {isFr ? "Pas certain(e) ? (Tons neutres universels)" : "Not sure? (Universal Neutrals)"}
            </button>
          </div>

          {/* 4 Seasonal Palette Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {seasonalPalettes.map((p) => {
              const isSelected =
                profile.palette_season === p.id ||
                profile.seasonal_colour === p.id ||
                (typeof profile.palette_season === "string" && profile.palette_season.includes(p.id));
              return (
                <div
                  key={p.id}
                  onClick={() => handlePaletteSelect(p.id)}
                  className={`group rounded-fitting border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-accent ring-2 ring-accent/30 bg-surface/90 shadow-xs"
                      : "border-border hover:border-thread/50 bg-surface/30 hover:bg-surface/50"
                  }`}
                >
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0 leading-none">{p.icon}</span>
                        <h4 className="text-base font-serif font-bold text-ink group-hover:text-accent transition-colors">
                          {p.name}
                        </h4>
                      </div>
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border mt-2 ${p.accentBg}`}>
                        {p.undertone}
                      </span>
                    </div>

                    {/* Dot Matrix Swatches */}
                    <div className="bg-surface/80 border border-border/70 rounded p-2.5">
                      <div className="grid grid-cols-4 gap-2 justify-items-center">
                        {p.swatches.map((hex, i) => (
                          <span
                            key={i}
                            title={hex}
                            className="w-5 h-5 rounded-full border border-black/15 shadow-2xs group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className={isSelected ? "font-bold text-accent" : "text-ink-muted"}>
                      {isSelected
                        ? (isFr ? "✓ Sélectionné" : "✓ Selected")
                        : (isFr ? "Toucher pour choisir" : "Tap to select")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skin Tone & Undertone Helper */}
          <div className="pt-3 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {isFr ? "Guide rapide : Selon votre teint" : "Quick Guide: Match with Skin Tone"}
              </div>
              <span className="text-[11px] text-ink-muted">
                {isFr ? "Sélectionne automatiquement votre meilleure palette" : "Auto-selects your best palette"}
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
                  : `${comp} Complexion`;
                return (
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
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-sm font-medium tracking-wide transition-all cursor-pointer shadow-xs"
            >
              {isFr ? "Continuer vers tailles & budget →" : "Continue to Sizes & Budget →"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 06: CLIMATE, SIZE, BUDGET & FINAL SUBMIT */}
      {/* ============================================================ */}
      {currentStep === 5 && (
        <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-8 shadow-fitting-card animate-fadeIn">
          <div className="border-b border-border pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-thread">
              {isFr ? "Étape 06 • Détails pratiques" : "Step 06 • Practical Details"}
            </div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-1">
              {isFr ? "Météo, Taille & Budget" : "Weather, Sizing & Budget"}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              {isFr
                ? "Les derniers détails pour que chaque vêtement recommandé soit disponible et confortable."
                : "Final details so every recommendation is in-stock and in your comfort zone."}
            </p>
          </div>

          {/* Climate / Weather Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              {isFr ? "Météo / Saison actuelle" : "Current Weather / Season"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "Fall/Winter" as const,
                  label: isFr
                    ? "Automne & Hiver (Froid, pluie ou neige)"
                    : "Fall & Winter (Cool, Rain or Snow)",
                  desc: isFr
                    ? "Laines chaudes, tricots douillets, manteaux imperméables & bottes"
                    : "Warm wools, cozy knitwear, water-resistant layers & boots",
                  image: "/images/climates/fall_winter.jpg",
                },
                {
                  id: "Spring/Summer" as const,
                  label: isFr
                    ? "Printemps & Été (Doux à chaud)"
                    : "Spring & Summer (Mild to Warm)",
                  desc: isFr
                    ? "Cotons respirants, lins légers et vestons déstructurés d'été"
                    : "Breathable cottons, lightweight linens & easy unlined tailoring",
                  image: "/images/climates/spring_summer.jpg",
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
                        ? "border-accent ring-2 ring-accent/30 bg-surface/50 shadow-xs"
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
                {isFr ? "Fourchette de prix" : "Price Range"}
              </label>
              <span className="text-xs text-thread font-semibold">
                {isFr ? "100% Vêtements réels et en stock" : "100% Real In-Stock Items"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  tier: "$",
                  label: isFr ? "$ (Accessible)" : "$ (Value)",
                  desc: isFr
                    ? "Moins de 100 $ / pièce (Kotn, RW&CO Essentiels, Tentree)"
                    : "Under $100 / piece (Kotn, RW&CO Essentials, Tentree)",
                },
                {
                  tier: "$$",
                  label: isFr ? "$$ (Gamme moyenne)" : "$$ (Mid-Range)",
                  desc: isFr
                    ? "100 $ - 250 $ / pièce (Aritzia, Lululemon, Vessi, Frank And Oak)"
                    : "$100 - $250 / piece (Aritzia, Lululemon, Vessi, Frank And Oak)",
                },
                {
                  tier: "$$$",
                  label: isFr ? "$$$ (Haut de gamme)" : "$$$ (Premium)",
                  desc: isFr
                    ? "250 $+ / pièce (Club Monaco, Canada Goose, Mackage, Maguire)"
                    : "$250+ / piece (Club Monaco, Canada Goose, Mackage, Maguire)",
                },
              ].map((b) => (
                <button
                  key={b.tier}
                  type="button"
                  onClick={() => onUpdate({ budget: b.tier as any, budget_tier: b.tier as any })}
                  className={`p-3.5 text-left rounded-fitting border transition-all cursor-pointer ${
                    profile.budget === b.tier || profile.budget_tier === b.tier
                      ? "border-accent bg-accent/5 ring-1 ring-accent text-ink shadow-xs"
                      : "border-border hover:border-thread/50 bg-surface/40 text-ink-muted"
                  }`}
                >
                  <div className="text-sm font-bold text-ink">{b.label}</div>
                  <div className="text-xs text-ink-muted mt-1 leading-snug">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink">
              {isFr ? "Votre taille habituelle" : "Your Usual Size"}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdate({ size })}
                  className={`py-2 text-xs font-bold rounded-fitting border transition-all cursor-pointer ${
                    profile.size === size
                      ? "bg-accent text-white border-accent shadow-xs"
                      : "bg-surface border-border text-ink hover:border-thread/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

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
                  <span>{isFr ? "Composition de votre look..." : "Putting your look together..."}</span>
                </>
              ) : (
                <span>
                  {flow === "occasion"
                    ? (isFr ? "Voir ma tenue →" : "See My Outfit →")
                    : (isFr ? "Créer ma garde-robe capsule →" : "Build My Capsule Wardrobe →")}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
