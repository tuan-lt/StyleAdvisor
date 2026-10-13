import {
  Garment,
  GarmentSlot,
  Occasion,
  PaletteSeason,
  StyleOption,
  BodyType,
  ClothingSize,
} from "../types/catalog";
import { matchBodyType, matchSize } from "./catalog-filter";

export interface ScoreGarmentOptions {
  targetFormality?: number; // 1 to 5
  targetPalette?: PaletteSeason | string;
  targetStyle?: StyleOption | string;
  targetOccasion?: Occasion | string;
  targetBodyType?: BodyType | string;
  targetSize?: ClothingSize | string;
  audienceText?: string;
  excludedIds?: Set<string>;
}

/**
 * Calculates a comprehensive suitability score for a garment.
 * Evaluates formality proximity, palette match, style match, occasion match,
 * body silhouette flattering score, size range accommodation, and styling notes synergy.
 * Scale is typically between 0 and 40+.
 */
export function scoreGarment(garment: Garment, options: ScoreGarmentOptions): number {
  let score = 10; // base score

  // 1. Formality proximity (closer to targetFormality = higher score)
  const targetFormality = options.targetFormality ?? 4;
  const targetScore10 = targetFormality * 2; // convert 1-5 to 1-10
  const garmentFormality = garment.formality_score || 6;
  const formalityDiff = Math.abs(garmentFormality - targetScore10);
  score += Math.max(0, 10 - formalityDiff * 2);

  // 2. Palette Match Bonus (+4)
  if (options.targetPalette && options.targetPalette !== "not_sure" && garment.palette_seasons) {
    const p = options.targetPalette.toLowerCase();
    const baseP = p.split("_").pop() || p;
    const gPalettes = (garment.palette_seasons || []).map((s) => s.toLowerCase());
    if (gPalettes.includes(p) || gPalettes.includes(baseP)) {
      score += 4;
    }
  }

  // 3. Style Match Bonus (+4)
  if (options.targetStyle && garment.styles && garment.styles.length > 0) {
    const s = options.targetStyle.toLowerCase();
    const gStyles = garment.styles.map((st) => st.toLowerCase());
    if (gStyles.some((st) => st === s || s.includes(st))) {
      score += 4;
    }
  }

  // 4. Occasion Match Bonus (+4 for direct, +2 for related)
  if (options.targetOccasion && garment.occasions) {
    const occ = options.targetOccasion.toLowerCase();
    const gOccs = garment.occasions.map((o) => o.toLowerCase());
    if (
      gOccs.includes(occ) ||
      ((occ === "date" || occ === "date-night") && (gOccs.includes("date") || gOccs.includes("date-night")))
    ) {
      score += 4;
    } else if (
      ((occ === "date" || occ === "date-night") && (gOccs.includes("dinner-out") || gOccs.includes("smart-casual"))) ||
      (occ === "pitch" && (gOccs.includes("work") || gOccs.includes("smart-casual") || gOccs.includes("interview"))) ||
      (occ === "interview" && (gOccs.includes("work") || gOccs.includes("formal") || gOccs.includes("pitch"))) ||
      (occ === "family" && (gOccs.includes("casual") || gOccs.includes("smart-casual"))) ||
      (occ === "casual" && gOccs.includes("smart-casual")) ||
      (occ === "work" && gOccs.includes("smart-casual"))
    ) {
      score += 2;
    }
  }

  // 5. Body Type Silhouette Match Bonus (+4 for direct, +2 for compatible synonym)
  if (
    options.targetBodyType &&
    options.targetBodyType !== "not_sure" &&
    garment.body_types &&
    garment.body_types.length > 0
  ) {
    const target = options.targetBodyType.toLowerCase().trim();
    const normalizedBodyTypes = garment.body_types.map((b) => b.toLowerCase().trim());
    if (normalizedBodyTypes.includes(target)) {
      score += 4;
    } else if (matchBodyType(garment.body_types, options.targetBodyType as any)) {
      score += 2;
    }
  }

  // 6. Size Range Availability Bonus (+3)
  if (options.targetSize && garment.size_range) {
    if (matchSize(garment.size_range, options.targetSize)) {
      score += 3;
    }
  }

  // 7. Styling Notes Contextual & Editorial Synergy Bonus (+1 to +5)
  if (garment.styling_notes && garment.styling_notes.trim() !== "") {
    const notes = garment.styling_notes.toLowerCase();
    let notesBonus = 0;

    // Occasion context synergy in stylist notes
    if (options.targetOccasion) {
      const occ = options.targetOccasion.toLowerCase();
      if (notes.includes(occ)) {
        notesBonus += 3;
      } else if (
        (occ === "pitch" && (notes.includes("founder") || notes.includes("pitch") || notes.includes("blazer") || notes.includes("tailored"))) ||
        (occ === "interview" && (notes.includes("sharp") || notes.includes("professional") || notes.includes("tailored") || notes.includes("poise"))) ||
        (occ === "court" && (notes.includes("solemn") || notes.includes("formal") || notes.includes("structured") || notes.includes("slacks"))) ||
        (occ === "funeral" && (notes.includes("subdued") || notes.includes("dark") || notes.includes("quiet") || notes.includes("respect"))) ||
        (occ === "casual" && (notes.includes("relaxed") || notes.includes("effortless") || notes.includes("everyday") || notes.includes("canadian")))
      ) {
        notesBonus += 2;
      }
    }

    // Free-text audience context keywords matching
    if (options.audienceText) {
      const audienceWords = options.audienceText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      for (const word of audienceWords) {
        if (notes.includes(word)) {
          notesBonus += 1;
          break;
        }
      }
    }

    // Style match in styling notes
    if (options.targetStyle && notes.includes(options.targetStyle.toLowerCase())) {
      notesBonus += 1;
    }

    score += Math.min(5, notesBonus);
  }

  // 8. In-Stock Bonus (+2)
  if (garment.in_stock) {
    score += 2;
  }

  // 9. Penalty for previously seen/displayed items (-50)
  if (options.excludedIds && options.excludedIds.has(garment.id)) {
    score -= 50;
  }

  return score;
}

/**
 * Scores and ranks a list of candidates from highest to lowest score.
 */
export function rankCandidates(
  candidates: Garment[],
  options: ScoreGarmentOptions
): { garment: Garment; score: number }[] {
  const scored = candidates.map((g) => ({
    garment: g,
    score: scoreGarment(g, options),
  }));

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Selects 15 modular foundation items for the Capsule Wardrobe (Flow B)
 * with a balanced mix of formal/work and casual/weekend essentials.
 *
 * Slots breakdown:
 * - 5 Tops: 2 formal/smart (formality >= 6) + 3 casual/relaxed (formality <= 5)
 * - 4 Bottoms: 2 formal/tailored (formality >= 6) + 2 casual/denim (formality <= 5)
 * - 3 Outerwear: 1 structured (blazer/coat) + 1 overshirt/cardigan + 1 weatherproof technical
 * - 2 Shoes: 1 formal leather/loafer + 1 casual/weatherproof sneaker
 * - 1 Accessory: 1 versatile everyday bag/belt
 */
export function selectBalancedCapsule15(
  catalog: Garment[],
  options?: ScoreGarmentOptions & { iteration?: number }
): Garment[] {
  const iteration = options?.iteration || 0;
  const opts = options || {};

  function pickSlotBalanced(
    slot: GarmentSlot,
    formalCount: number,
    casualCount: number
  ): Garment[] {
    const slotItems = catalog.filter((g) => g.slot === slot);
    if (slotItems.length === 0) return [];

    const formalRanked = rankCandidates(
      slotItems.filter((g) => (g.formality_score || 6) >= 6),
      { ...opts, targetFormality: 4 }
    ).map((r) => r.garment);

    const casualRanked = rankCandidates(
      slotItems.filter((g) => (g.formality_score || 6) < 6),
      { ...opts, targetFormality: 2 }
    ).map((r) => r.garment);

    // Fallbacks if one bucket is small
    const allRanked = rankCandidates(slotItems, { ...opts, targetFormality: 3 }).map((r) => r.garment);

    const pickedFormal: Garment[] = [];
    const pickedCasual: Garment[] = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < formalCount; i++) {
      const idx = (iteration + i) % (formalRanked.length || 1);
      const item = formalRanked[idx] || allRanked.find((g) => !usedIds.has(g.id));
      if (item && !usedIds.has(item.id)) {
        pickedFormal.push(item);
        usedIds.add(item.id);
      }
    }

    for (let i = 0; i < casualCount; i++) {
      const idx = (iteration + i) % (casualRanked.length || 1);
      const item = casualRanked[idx] || allRanked.find((g) => !usedIds.has(g.id));
      if (item && !usedIds.has(item.id)) {
        pickedCasual.push(item);
        usedIds.add(item.id);
      }
    }

    // Fill remaining if needed
    const totalNeeded = formalCount + casualCount;
    while (pickedFormal.length + pickedCasual.length < totalNeeded && allRanked.length > usedIds.size) {
      const fallback = allRanked.find((g) => !usedIds.has(g.id));
      if (fallback) {
        pickedCasual.push(fallback);
        usedIds.add(fallback.id);
      } else {
        break;
      }
    }

    return [...pickedFormal, ...pickedCasual];
  }

  // Tops: 2 formal, 3 casual
  const tops = pickSlotBalanced("top", 2, 3);

  // Bottoms: 2 formal (wool trousers/suit pants), 2 casual (jeans/chinos)
  const bottoms = pickSlotBalanced("bottom", 2, 2);

  // Outerwear: 1 structured (formality >= 6), 2 casual/weatherproof
  const outerwear = pickSlotBalanced("outerwear", 1, 2);

  // Shoes: 1 formal leather, 1 casual sneaker
  const shoes = pickSlotBalanced("shoes", 1, 1);

  // Accessory: 1 versatile
  const accessoryCandidates = rankCandidates(
    catalog.filter((g) => g.slot === "accessory"),
    { ...opts, targetFormality: 3 }
  ).map((r) => r.garment);

  const accessory = accessoryCandidates[iteration % Math.max(1, accessoryCandidates.length)] || catalog.find((g) => g.slot === "accessory");

  return [...tops, ...bottoms, ...outerwear, ...shoes, ...(accessory ? [accessory] : [])];
}

/**
 * Assembles a worked outfit matching the specific formality and context.
 */
export function assembleWorkedOutfit(
  capsule15: Garment[],
  targetFormality: number, // 4 for Office, 3 for Studio, 2 for Weekend
  targetOccasion: string,
  options?: ScoreGarmentOptions
): {
  outerwear?: Garment;
  top: Garment;
  bottom: Garment;
  shoes: Garment;
  accessory?: Garment;
} {
  const pickBestInSlot = (slot: GarmentSlot): Garment | undefined => {
    const slotItems = capsule15.filter((g) => g.slot === slot);
    if (slotItems.length === 0) return undefined;

    const ranked = rankCandidates(slotItems, {
      ...options,
      targetFormality,
      targetOccasion: targetOccasion as Occasion,
    });

    return ranked[0]?.garment;
  };

  const top = pickBestInSlot("top") || capsule15.find((g) => g.slot === "top")!;
  const bottom = pickBestInSlot("bottom") || capsule15.find((g) => g.slot === "bottom")!;
  const shoes = pickBestInSlot("shoes") || capsule15.find((g) => g.slot === "shoes")!;
  const outerwear = pickBestInSlot("outerwear");
  const accessory = pickBestInSlot("accessory");

  return { top, bottom, shoes, outerwear, accessory };
}

/**
 * Get natural contextual default formality (1-5) calibrated for each occasion
 */
export function getDefaultFormalityForOccasion(occasion?: string): number {
  if (!occasion) return 3.5;
  const occ = occasion.toLowerCase().replace(/[^a-z]/g, "");
  if (occ === "court" || occ === "funeral") return 5;
  if (occ === "pitch" || occ === "interview") return 4;
  if (occ === "date" || occ === "datenight") return 3;
  if (occ === "family") return 3;
  if (occ === "casual") return 2;
  return 3.5;
}

