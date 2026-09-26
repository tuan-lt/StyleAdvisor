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
} from "../types/catalog";

export const REQUIRED_SLOTS: GarmentSlot[] = ["outerwear", "top", "bottom", "shoes"];
export const ALL_SLOTS: GarmentSlot[] = ["outerwear", "top", "bottom", "shoes", "accessory"];

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
    // Synonyms
    if (target === "pitch" && (gOccs.includes("work") || gOccs.includes("interview"))) return true;
    if (target === "court" && (gOccs.includes("interview") || gOccs.includes("formal"))) return true;
    if (target === "funeral" && (gOccs.includes("formal") || gOccs.includes("court"))) return true;
    if (target === "family" && (gOccs.includes("casual") || gOccs.includes("smart-casual"))) return true;
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

  // Exclude garments the user already owns to prevent redundant recommendation
  const ownedItemIds = new Set(inputs.owned_item_ids || []);

  // --- STEP 1: Strict Hard-Filter Base ---
  const hardFiltered = catalog.filter((garment) => {
    // Check owned exclusions
    if (ownedItemIds.has(garment.id)) return false;

    // 1. Gender / Cut (Strict Hard-Filter: Never Relaxed)
    if (!matchGender(garment.gender_cut, targetGender as any)) return false;

    // 2. Budget Tier (Strict Hard-Filter: Never Relaxed)
    if (!matchBudget(garment.budget_tier, targetBudget as any)) return false;

    // 3. Season of Wear (Strict Hard-Filter: Never Relaxed)
    if (!matchSeason(garment.season_of_wear, targetSeason as any)) return false;

    // 4. Occasion (Strict Hard-Filter for Occasion Flow: Never Relaxed)
    if (isOccasionFlow && targetOccasion) {
      if (!matchOccasion(garment.occasions, targetOccasion)) return false;
    }

    return true;
  });

  // --- OCCASION FLOW (Flow A) RELAXATION HIERARCHY ---
  if (isOccasionFlow) {
    // Attempt 0: Strict soft-filters (Palette + Style)
    const strictPool = hardFiltered.filter((garment) => {
      if (targetPalette && targetPalette !== "not_sure" && !matchPalette(garment.palette_seasons, targetPalette)) {
        return false;
      }
      if (targetStyle && !matchStyle(garment.styles, targetStyle)) {
        return false;
      }
      return true;
    });

    const strictGrouped = groupGarmentsBySlot(strictPool);
    if (hasAllRequiredSlots(strictGrouped.candidates_by_slot)) {
      return buildResult(strictGrouped, null, []);
    }

    // Attempt 1: Relax Palette Season (Fallback to nearest neutral tones)
    const paletteRelaxedPool = hardFiltered.filter((garment) => {
      if (targetStyle && !matchStyle(garment.styles, targetStyle)) {
        return false;
      }
      return true;
    });

    const paletteRelaxedGrouped = groupGarmentsBySlot(paletteRelaxedPool);
    if (hasAllRequiredSlots(paletteRelaxedGrouped.candidates_by_slot)) {
      return buildResult(paletteRelaxedGrouped, "palette", ["palette"]);
    }

    // Attempt 2: Relax Style (Fallback to Classic/Minimalist staples)
    const fullyRelaxedGrouped = groupGarmentsBySlot(hardFiltered);
    return buildResult(fullyRelaxedGrouped, "style", ["palette", "style"]);
  }

  // --- EVERYDAY FLOW (Flow B) RELAXATION HIERARCHY ---
  const lifestyleTags = inputs.lifestyle || inputs.lifestyle_tags || [];

  // Attempt 0: Filter by lifestyle if tags provided
  if (lifestyleTags.length > 0) {
    const lifestylePool = hardFiltered.filter((garment) => {
      const matchesLifestyle = lifestyleTags.some((tag) => {
        const t = tag.toLowerCase().replace(/_/g, " ");
        return (
          garment.occasions.some((occ) => occ.toLowerCase().includes(t)) ||
          (garment.description && garment.description.toLowerCase().includes(t)) ||
          (garment.styling_notes && garment.styling_notes.toLowerCase().includes(t)) ||
          (garment.styles && garment.styles.some((s) => s.toLowerCase().includes(t)))
        );
      });
      return matchesLifestyle;
    });

    const lifestyleGrouped = groupGarmentsBySlot(lifestylePool);
    if (hasAllRequiredSlots(lifestyleGrouped.candidates_by_slot)) {
      return buildResult(lifestyleGrouped, null, []);
    }
  }

  // Attempt 1: Relax Lifestyle only
  const relaxedLifestyleGrouped = groupGarmentsBySlot(hardFiltered);
  return buildResult(
    relaxedLifestyleGrouped,
    lifestyleTags.length > 0 ? "lifestyle" : null,
    lifestyleTags.length > 0 ? ["lifestyle"] : []
  );
}

function buildResult(
  grouped: {
    candidates_by_slot: Record<GarmentSlot, Garment[]>;
    candidate_ids_by_slot: Record<GarmentSlot, string[]>;
    slot_counts: Record<GarmentSlot, number>;
  },
  relaxed_field: RelaxedField | null,
  relaxed_fields: RelaxedField[]
): FilterCandidatesResult {
  const all_candidate_ids = ALL_SLOTS.flatMap((slot) => grouped.candidate_ids_by_slot[slot] || []);
  const total_candidates = all_candidate_ids.length;
  const is_valid_pool = hasAllRequiredSlots(grouped.candidates_by_slot);

  return {
    candidate_ids_by_slot: grouped.candidate_ids_by_slot,
    candidates_by_slot: grouped.candidates_by_slot,
    all_candidate_ids,
    total_candidates,
    slot_counts: grouped.slot_counts,
    relaxed_field,
    relaxed_fields,
    is_valid_pool,
  };
}
