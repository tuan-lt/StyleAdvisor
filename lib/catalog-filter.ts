import {
  Garment,
  GarmentSlot,
  GenderCut,
  BudgetTier,
  SeasonOfWear,
  Occasion,
  PaletteSeason,
  UserProfile,
  OccasionInput,
  EverydayInput,
  CandidateFilterInput,
  FilterCandidatesResult,
  RelaxedField,
  StyleOption,
  BodyType,
  ClothingSize,
} from "../types/catalog";

export const REQUIRED_SLOTS: GarmentSlot[] = ["outerwear", "top", "bottom", "shoes"];
export const ALL_SLOTS: GarmentSlot[] = ["outerwear", "top", "bottom", "shoes", "accessory"];

/**
 * Body type synonym and compatibility map.
 */
const BODY_TYPE_SYNONYMS: Record<string, string[]> = {
  rectangle: ["rectangle", "standard", "athletic", "slim", "average"],
  bottom_triangle: ["bottom_triangle", "bottom-triangle", "pear", "curvy", "triangle"],
  top_triangle: ["top_triangle", "top-triangle", "inverted-triangle", "athletic", "triangle"],
  double_triangle: ["double_triangle", "double-triangle", "hourglass", "curvy"],
  oval: ["oval", "apple", "plus", "average"],
  athletic: ["athletic", "rectangle", "top_triangle", "standard"],
  slim: ["slim", "rectangle", "standard"],
  average: ["average", "rectangle", "oval", "standard"],
  curvy: ["curvy", "hourglass", "double_triangle", "bottom_triangle", "pear"],
  tall: ["tall", "standard", "rectangle"],
  petite: ["petite", "standard", "rectangle"],
  plus: ["plus", "oval", "apple", "curvy"],
  "inverted-triangle": ["inverted-triangle", "top_triangle", "top-triangle", "athletic"],
  hourglass: ["hourglass", "double_triangle", "double-triangle", "curvy"],
  pear: ["pear", "bottom_triangle", "bottom-triangle", "curvy"],
  apple: ["apple", "oval", "plus"],
  standard: ["standard", "rectangle", "average"],
};

/**
 * Check if a garment matches the user's gender/cut preference.
 * STRICT HARD-FILTER: NEVER RELAXED.
 */
export function matchGender(
  garmentCut: GenderCut | GenderCut[],
  targetGender?: GenderCut | 'Female' | 'Neutral' | 'Male'
): boolean {
  if (!targetGender) return true;
  const target = targetGender.toLowerCase();
  if (target === "neutral" || target === "unisex") return true;

  const cuts = Array.isArray(garmentCut) ? garmentCut : [garmentCut];
  const normalizedCuts = cuts.map((c) => {
    const s = c.toLowerCase();
    if (s === "men" || s === "male") return "male";
    if (s === "women" || s === "female") return "female";
    return "neutral";
  });

  const normalizedTarget =
    target === "men" || target === "male"
      ? "male"
      : target === "women" || target === "female"
      ? "female"
      : "neutral";

  return normalizedCuts.includes(normalizedTarget) || normalizedCuts.includes("neutral");
}

/**
 * Check if a garment satisfies the user's budget tier.
 * STRICT HARD-FILTER: NEVER RELAXED.
 */
export function matchBudget(
  garmentTier: BudgetTier,
  targetBudget?: BudgetTier | BudgetTier[] | '$' | '$$' | '$$$'
): boolean {
  if (!targetBudget) return true;

  const normalizeTier = (t: string): '$' | '$$' | '$$$' => {
    if (t === "$" || t === "budget") return "$";
    if (t === "$$" || t === "mid" || t === "premium") return "$$";
    return "$$$";
  };

  const gTier = normalizeTier(garmentTier);
  const targets = (Array.isArray(targetBudget) ? targetBudget : [targetBudget]).map((t) =>
    normalizeTier(t as string)
  );

  return targets.includes(gTier);
}

/**
 * Check if a garment is appropriate for the target season of wear.
 * STRICT HARD-FILTER: NEVER RELAXED.
 */
export function matchSeason(
  garmentSeasons: SeasonOfWear[],
  targetSeason?: SeasonOfWear | 'Spring/Summer' | 'Fall/Winter'
): boolean {
  if (!targetSeason) return true;
  const target = targetSeason.toLowerCase().replace(/[^a-z]/g, "");

  const normalizedGarmentSeasons = (garmentSeasons || []).map((s) =>
    s.toLowerCase().replace(/[^a-z]/g, "")
  );

  if (
    normalizedGarmentSeasons.includes("allseason") ||
    normalizedGarmentSeasons.includes("all_season")
  ) {
    return true;
  }

  if (target.includes("spring") || target.includes("summer")) {
    return (
      normalizedGarmentSeasons.includes("springsummer") ||
      normalizedGarmentSeasons.includes("spring") ||
      normalizedGarmentSeasons.includes("summer")
    );
  }

  if (target.includes("fall") || target.includes("winter")) {
    return (
      normalizedGarmentSeasons.includes("fallwinter") ||
      normalizedGarmentSeasons.includes("fall") ||
      normalizedGarmentSeasons.includes("winter")
    );
  }

  return true;
}

/**
 * Check if a garment matches the target occasion.
 * STRICT HARD-FILTER: NEVER RELAXED for Occasion Flow.
 */
export function matchOccasion(
  garmentOccasions: Occasion[],
  targetOccasion?: Occasion | Occasion[]
): boolean {
  if (!targetOccasion) return true;
  const targets = (Array.isArray(targetOccasion) ? targetOccasion : [targetOccasion]).map((o) =>
    o.toLowerCase()
  );
  const gOccs = (garmentOccasions || []).map((o) => o.toLowerCase());

  return targets.some((target) => {
    if (gOccs.includes(target)) return true;
    // Synonyms and semantic equivalents
    if (
      (target === "date" || target === "date-night") &&
      (gOccs.includes("date") ||
        gOccs.includes("date-night") ||
        gOccs.includes("dinner-out") ||
        gOccs.includes("smart-casual"))
    ) {
      return true;
    }
    if (target === "wedding" && (gOccs.includes("wedding") || gOccs.includes("formal") || gOccs.includes("date") || gOccs.includes("date-night") || gOccs.includes("smart-casual") || gOccs.includes("pitch"))) return true;
    if (target === "pitch" && (gOccs.includes("work") || gOccs.includes("interview") || gOccs.includes("business-casual"))) return true;
    if (target === "interview" && (gOccs.includes("work") || gOccs.includes("pitch") || gOccs.includes("formal"))) return true;
    if (target === "court" && (gOccs.includes("interview") || gOccs.includes("formal"))) return true;
    if (target === "funeral" && (gOccs.includes("formal") || gOccs.includes("court"))) return true;
    if (target === "family" && (gOccs.includes("casual") || gOccs.includes("smart-casual") || gOccs.includes("dinner-out"))) return true;
    return false;
  });
}

/**
 * Check if a garment matches the target palette season.
 * SOFT FILTER (Relaxable in Step 1 for Flow A).
 */
export function matchPalette(
  garmentPalettes: PaletteSeason[],
  targetPalette?: PaletteSeason
): boolean {
  if (!targetPalette || targetPalette === "not_sure") return true;
  const baseSeason = targetPalette.split("_").pop() as PaletteSeason;
  return garmentPalettes.includes(targetPalette) || garmentPalettes.includes(baseSeason);
}

/**
 * Check if garment matches the target style (PRD 6 styles).
 */
export function matchStyle(
  garmentStyles: StyleOption[] | undefined,
  targetStyle?: StyleOption
): boolean {
  if (!targetStyle) return true;
  if (!garmentStyles || garmentStyles.length === 0) return true;
  const target = targetStyle.toLowerCase();
  return garmentStyles.some((s) => s.toLowerCase() === target || target.includes(s.toLowerCase()));
}

/**
 * Check if a garment silhouette flatters the target body type.
 * SOFT FILTER (Relaxable).
 */
export function matchBodyType(
  garmentBodyTypes?: BodyType[],
  targetBodyType?: BodyType | string
): boolean {
  if (!targetBodyType || targetBodyType === "not_sure") return true;
  if (!garmentBodyTypes || garmentBodyTypes.length === 0) return true;

  const target = targetBodyType.toLowerCase().trim();
  const normalizedGarmentTypes = garmentBodyTypes.map((b) => b.toLowerCase().trim());

  if (normalizedGarmentTypes.includes(target)) return true;

  const synonyms = BODY_TYPE_SYNONYMS[target] || [target];
  return normalizedGarmentTypes.some((b) => synonyms.includes(b));
}

const SIZE_ORDER: Record<string, number> = {
  xs: 1,
  s: 2,
  m: 3,
  l: 4,
  xl: 5,
  xxl: 6,
};

/**
 * Check if a garment size range accommodates the target clothing size.
 * SOFT FILTER (Relaxable).
 */
export function matchSize(
  garmentSizeRange?: string,
  targetSize?: ClothingSize | string
): boolean {
  if (!targetSize) return true;
  if (!garmentSizeRange || garmentSizeRange.trim() === "") return true;

  const rawRange = garmentSizeRange.toLowerCase().trim();

  // Accessories / One size / Universal fits
  if (
    rawRange.includes("one size") ||
    rawRange.includes("os") ||
    rawRange.includes("universal") ||
    rawRange.includes("all")
  ) {
    return true;
  }

  const cleanTarget = targetSize.toLowerCase().trim();
  const targetRank = SIZE_ORDER[cleanTarget];

  // If exact token exists in size_range (e.g. "XS, S, M, L" or "M")
  const regex = new RegExp(`\\b${cleanTarget}\\b`, "i");
  if (regex.test(rawRange)) return true;

  // Check letter range like "XS - XXL" or "S - XL"
  const rangeMatch = rawRange.match(/([a-z]+)\s*[-–—to]+\s*([a-z]+)/i);
  if (rangeMatch && targetRank) {
    const minRank = SIZE_ORDER[rangeMatch[1].toLowerCase()];
    const maxRank = SIZE_ORDER[rangeMatch[2].toLowerCase()];
    if (minRank && maxRank) {
      return targetRank >= minRank && targetRank <= maxRank;
    }
  }

  // Check waist sizes e.g. "28W - 38W" or numeric sizes "00 - 16 US"
  if (rawRange.includes("w") || /\d+\s*[-–—]\s*\d+/.test(rawRange)) {
    const numbers = rawRange.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const minNum = parseInt(numbers[0], 10);
      const maxNum = parseInt(numbers[numbers.length - 1], 10);
      if (cleanTarget === "xs" && minNum <= 28) return true;
      if (cleanTarget === "s" && minNum <= 30 && maxNum >= 28) return true;
      if (cleanTarget === "m" && minNum <= 32 && maxNum >= 30) return true;
      if (cleanTarget === "l" && minNum <= 34 && maxNum >= 32) return true;
      if (cleanTarget === "xl" && minNum <= 38 && maxNum >= 34) return true;
      if (cleanTarget === "xxl" && maxNum >= 38) return true;
    }
    return true;
  }

  return true;
}

/**
 * Group garments by slot and collect candidate IDs.
 */
export function groupGarmentsBySlot(garments: Garment[]): {
  candidates_by_slot: Record<GarmentSlot, Garment[]>;
  candidate_ids_by_slot: Record<GarmentSlot, string[]>;
  slot_counts: Record<GarmentSlot, number>;
} {
  const candidates_by_slot: Record<GarmentSlot, Garment[]> = {
    outerwear: [],
    top: [],
    bottom: [],
    shoes: [],
    accessory: [],
  };

  const candidate_ids_by_slot: Record<GarmentSlot, string[]> = {
    outerwear: [],
    top: [],
    bottom: [],
    shoes: [],
    accessory: [],
  };

  const slot_counts: Record<GarmentSlot, number> = {
    outerwear: 0,
    top: 0,
    bottom: 0,
    shoes: 0,
    accessory: 0,
  };

  for (const garment of garments) {
    if (candidates_by_slot[garment.slot]) {
      candidates_by_slot[garment.slot].push(garment);
      candidate_ids_by_slot[garment.slot].push(garment.id);
      slot_counts[garment.slot] += 1;
    }
  }

  return { candidates_by_slot, candidate_ids_by_slot, slot_counts };
}

/**
 * Checks whether all 4 required slots (outerwear, top, bottom, shoes) have >= 1 candidate.
 */
export function hasAllRequiredSlots(candidatesBySlot: Record<GarmentSlot, Garment[]>): boolean {
  return REQUIRED_SLOTS.every((slot) => candidatesBySlot[slot] && candidatesBySlot[slot].length > 0);
}

/**
 * Primary candidate filter implementation adhering to the Fitting Room PRD v4.2.
 * Implements intelligent multi-tier per-slot relaxation with body_type and size support
 * so that all slots (outerwear, top, bottom, shoes) are guaranteed to have candidate items.
 */
export function filterCandidates(
  catalog: Garment[],
  inputs: CandidateFilterInput
): FilterCandidatesResult {
  const isOccasionFlow = !inputs.flow || inputs.flow === "occasion" || inputs.flow === "flow_a";
  const targetOccasion = (inputs as OccasionInput).occasion;
  const targetSeason = inputs.season_or_climate || inputs.season_of_wear;
  const targetGender = inputs.gender_expression || inputs.gender_cut;
  const targetBudget = inputs.budget || inputs.budget_tier;
  const targetPalette = inputs.seasonal_colour || inputs.palette_season;
  const targetStyle = inputs.style || (inputs.preferred_styles && inputs.preferred_styles[0]);
  const targetBodyType = inputs.body_type;
  const targetSize = inputs.size;

  // Exclude garments the user already owns to prevent redundant recommendation
  const ownedItemIds = new Set(inputs.owned_item_ids || []);

  // Base pool respecting unowned status and strict gender cut
  const genderPool = catalog.filter((garment) => {
    if (ownedItemIds.has(garment.id)) return false;
    return matchGender(garment.gender_cut, targetGender as any);
  });

  const relaxedFields: RelaxedField[] = [];
  const candidates_by_slot: Record<GarmentSlot, Garment[]> = {
    outerwear: [],
    top: [],
    bottom: [],
    shoes: [],
    accessory: [],
  };

  for (const slot of ALL_SLOTS) {
    const slotPool = genderPool.filter((g) => g.slot === slot);
    if (slotPool.length === 0) continue;

    // Tier 1: Strict soft-filters (Budget + Season + Occasion/Lifestyle + Palette + Style + BodyType + Size)
    let candidates = slotPool.filter((g) => {
      if (!matchBudget(g.budget_tier, targetBudget as any)) return false;
      if (!matchSeason(g.season_of_wear, targetSeason as any)) return false;
      if (isOccasionFlow && targetOccasion && !matchOccasion(g.occasions, targetOccasion)) return false;
      if (targetPalette && targetPalette !== "not_sure" && !matchPalette(g.palette_seasons, targetPalette)) return false;
      if (targetStyle && !matchStyle(g.styles, targetStyle)) return false;
      if (targetBodyType && targetBodyType !== "not_sure" && !matchBodyType(g.body_types, targetBodyType)) return false;
      if (targetSize && !matchSize(g.size_range, targetSize)) return false;
      return true;
    });

    // Tier 2: Relax Palette
    if (candidates.length === 0) {
      candidates = slotPool.filter((g) => {
        if (!matchBudget(g.budget_tier, targetBudget as any)) return false;
        if (!matchSeason(g.season_of_wear, targetSeason as any)) return false;
        if (isOccasionFlow && targetOccasion && !matchOccasion(g.occasions, targetOccasion)) return false;
        if (targetStyle && !matchStyle(g.styles, targetStyle)) return false;
        if (targetBodyType && targetBodyType !== "not_sure" && !matchBodyType(g.body_types, targetBodyType)) return false;
        if (targetSize && !matchSize(g.size_range, targetSize)) return false;
        return true;
      });
      if (candidates.length > 0 && !relaxedFields.includes("palette")) {
        relaxedFields.push("palette");
      }
    }

    // Tier 3: Relax Style
    if (candidates.length === 0) {
      candidates = slotPool.filter((g) => {
        if (!matchBudget(g.budget_tier, targetBudget as any)) return false;
        if (!matchSeason(g.season_of_wear, targetSeason as any)) return false;
        if (isOccasionFlow && targetOccasion && !matchOccasion(g.occasions, targetOccasion)) return false;
        if (targetBodyType && targetBodyType !== "not_sure" && !matchBodyType(g.body_types, targetBodyType)) return false;
        if (targetSize && !matchSize(g.size_range, targetSize)) return false;
        return true;
      });
      if (candidates.length > 0 && !relaxedFields.includes("style")) {
        relaxedFields.push("style");
      }
    }

    // Tier 4: Relax Body Type & Size
    if (candidates.length === 0) {
      candidates = slotPool.filter((g) => {
        if (!matchBudget(g.budget_tier, targetBudget as any)) return false;
        if (!matchSeason(g.season_of_wear, targetSeason as any)) return false;
        if (isOccasionFlow && targetOccasion && !matchOccasion(g.occasions, targetOccasion)) return false;
        return true;
      });
      if (candidates.length > 0) {
        if (targetBodyType && targetBodyType !== "not_sure" && !relaxedFields.includes("body_type")) {
          relaxedFields.push("body_type");
        }
        if (targetSize && !relaxedFields.includes("size")) {
          relaxedFields.push("size");
        }
      }
    }

    // Tier 5: Relax Occasion / Lifestyle (fallback to versatile work/casual staples)
    if (candidates.length === 0 && isOccasionFlow && targetOccasion) {
      candidates = slotPool.filter((g) => {
        if (!matchBudget(g.budget_tier, targetBudget as any)) return false;
        if (!matchSeason(g.season_of_wear, targetSeason as any)) return false;
        return true;
      });
      if (candidates.length > 0 && !relaxedFields.includes("occasion")) {
        relaxedFields.push("occasion");
      }
    }

    // Tier 6: Relax Budget (allow adjacent tiers matching season)
    if (candidates.length === 0) {
      candidates = slotPool.filter((g) => {
        if (!matchSeason(g.season_of_wear, targetSeason as any)) return false;
        return true;
      });
      if (candidates.length > 0 && !relaxedFields.includes("budget")) {
        relaxedFields.push("budget");
      }
    }

    // Tier 7: Relax Season (fallback to all gender-matched items in this slot)
    if (candidates.length === 0) {
      candidates = slotPool;
      if (!relaxedFields.includes("season")) {
        relaxedFields.push("season");
      }
    }

    candidates_by_slot[slot] = candidates;
  }

  const candidate_ids_by_slot: Record<GarmentSlot, string[]> = {
    outerwear: (candidates_by_slot.outerwear || []).map((g) => g.id),
    top: (candidates_by_slot.top || []).map((g) => g.id),
    bottom: (candidates_by_slot.bottom || []).map((g) => g.id),
    shoes: (candidates_by_slot.shoes || []).map((g) => g.id),
    accessory: (candidates_by_slot.accessory || []).map((g) => g.id),
  };

  const slot_counts: Record<GarmentSlot, number> = {
    outerwear: candidates_by_slot.outerwear.length,
    top: candidates_by_slot.top.length,
    bottom: candidates_by_slot.bottom.length,
    shoes: candidates_by_slot.shoes.length,
    accessory: candidates_by_slot.accessory.length,
  };

  const all_candidate_ids = ALL_SLOTS.flatMap((slot) => candidate_ids_by_slot[slot] || []);
  const total_candidates = all_candidate_ids.length;
  const is_valid_pool = hasAllRequiredSlots(candidates_by_slot);
  const relaxed_field = relaxedFields.length > 0 ? relaxedFields[0] : null;
  const relaxed_fields = relaxedFields;

  return {
    candidate_ids_by_slot,
    candidates_by_slot,
    all_candidate_ids,
    total_candidates,
    slot_counts,
    relaxed_field,
    relaxed_fields,
    is_valid_pool,
  };
}
