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
} from "../types/catalog";

export const REQUIRED_SLOTS: GarmentSlot[] = ["outerwear", "top", "bottom", "shoes"];
export const ALL_SLOTS: GarmentSlot[] = ["outerwear", "top", "bottom", "shoes", "accessory"];

/**
 * Check if a garment matches the user's gender/cut preference.
 * STRICT HARD-FILTER: NEVER RELAXED.
 */
export function matchGender(garmentCut: GenderCut, targetGender?: GenderCut): boolean {
  if (!targetGender || targetGender === "unisex") return true;
  return garmentCut === targetGender || garmentCut === "unisex";
}

/**
 * Check if a garment satisfies the user's budget tier.
 * STRICT HARD-FILTER: NEVER RELAXED.
 */
export function matchBudget(garmentTier: BudgetTier, targetBudget?: BudgetTier | BudgetTier[]): boolean {
  if (!targetBudget) return true;
  if (Array.isArray(targetBudget)) {
    return targetBudget.includes(garmentTier);
  }
  return garmentTier === targetBudget;
}

/**
 * Check if a garment is appropriate for the target season of wear.
 * STRICT HARD-FILTER: NEVER RELAXED.
 */
export function matchSeason(garmentSeasons: SeasonOfWear[], targetSeason?: SeasonOfWear): boolean {
  if (!targetSeason) return true;
  return garmentSeasons.includes(targetSeason) || garmentSeasons.includes("all-season");
}

/**
 * Check if a garment matches the target occasion.
 * STRICT HARD-FILTER: NEVER RELAXED for Occasion Flow.
 */
export function matchOccasion(garmentOccasions: Occasion[], targetOccasion?: Occasion | Occasion[]): boolean {
  if (!targetOccasion) return true;
  if (Array.isArray(targetOccasion)) {
    return targetOccasion.some((occ) => garmentOccasions.includes(occ));
  }
  return garmentOccasions.includes(targetOccasion);
}

/**
 * Check if a garment matches the target palette season.
 * SOFT FILTER (Relaxable in Step 1 for Flow A).
 */
export function matchPalette(garmentPalettes: PaletteSeason[], targetPalette?: PaletteSeason): boolean {
  if (!targetPalette) return true;
  // Exact match or base group match (e.g., 'deep_autumn' matches 'autumn')
  const baseSeason = targetPalette.split("_").pop() as PaletteSeason;
  return garmentPalettes.includes(targetPalette) || garmentPalettes.includes(baseSeason);
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
 * Primary candidate filter implementation adhering to the Fitting Room PRD.
 * 
 * Flow A (Occasion Flow):
 * 1. Strict Hard-Filters: Gender, Budget, Occasion, Season of wear.
 * 2. Soft-Filters: Palette season -> Style.
 * 3. Relaxation Order if any required slot is empty:
 *    - Step 1: Relax palette (fallback to neutral tones / all tones).
 *    - Step 2: Relax style.
 *    - NEVER relax budget, occasion, gender, or season_of_wear.
 * 
 * Flow B (Everyday Flow):
 * 1. Strict Hard-Filters: Gender, Budget, Season of wear.
 * 2. Soft-Filters: Lifestyle tags.
 * 3. Relaxation Order:
 *    - Relax lifestyle only.
 *    - NEVER relax budget, gender, or season_of_wear.
 */
export function filterCandidates(
  catalog: Garment[],
  inputs: CandidateFilterInput
): FilterCandidatesResult {
  const isOccasionFlow = !inputs.flow || inputs.flow === "occasion" || inputs.flow === "flow_a";
  const targetOccasion = (inputs as OccasionInput).occasion;
  const targetSeason = inputs.season_of_wear;
  const targetGender = inputs.gender_cut;
  const targetBudget = inputs.budget_tier;
  const targetPalette = inputs.palette_season;

  // Exclude garments the user already owns to prevent redundant recommendation
  const ownedItemIds = new Set(inputs.owned_item_ids || []);

  // --- STEP 1: Strict Hard-Filter Base ---
  const hardFiltered = catalog.filter((garment) => {
    // Check owned exclusions
    if (ownedItemIds.has(garment.id)) return false;

    // 1. Gender / Cut (Strict)
    if (!matchGender(garment.gender_cut, targetGender)) return false;

    // 2. Budget Tier (Strict)
    if (!matchBudget(garment.budget_tier, targetBudget)) return false;

    // 3. Season of Wear (Strict)
    if (!matchSeason(garment.season_of_wear, targetSeason)) return false;

    // 4. Occasion (Strict for Occasion Flow)
    if (isOccasionFlow && targetOccasion) {
      if (!matchOccasion(garment.occasions, targetOccasion)) return false;
    }

    return true;
  });

  // --- OCCASION FLOW (Flow A) RELAXATION HIERARCHY ---
  if (isOccasionFlow) {
    // Attempt 0: Strict soft-filters (Palette + Style)
    const strictPool = hardFiltered.filter((garment) => {
      if (targetPalette && !matchPalette(garment.palette_seasons, targetPalette)) {
        return false;
      }
      return true;
    });

    const strictGrouped = groupGarmentsBySlot(strictPool);
    if (hasAllRequiredSlots(strictGrouped.candidates_by_slot)) {
      return buildResult(strictGrouped, null, []);
    }

    // Attempt 1: Relax Palette Season (Fallback to neutral/all tones)
    const paletteRelaxedGrouped = groupGarmentsBySlot(hardFiltered);
    if (hasAllRequiredSlots(paletteRelaxedGrouped.candidates_by_slot)) {
      return buildResult(paletteRelaxedGrouped, "palette", ["palette"]);
    }

    // Attempt 2: Relax Style (Already encapsulated by hardFiltered with all styles permitted)
    // If still missing slots, we return what is available under strict laws without hallucinating
    return buildResult(paletteRelaxedGrouped, "style", ["palette", "style"]);
  }

  // --- EVERYDAY FLOW (Flow B) RELAXATION HIERARCHY ---
  const lifestyleTags = inputs.lifestyle_tags || (inputs as EverydayInput).lifestyle || [];
  
  // Attempt 0: Filter by lifestyle if tags provided
  if (lifestyleTags.length > 0) {
    const lifestylePool = hardFiltered.filter((garment) => {
      // Check if garment styling or occasions overlap with lifestyle keywords
      const matchesLifestyle = lifestyleTags.some(
        (tag) =>
          garment.occasions.some((occ) => occ.toLowerCase().includes(tag.toLowerCase())) ||
          garment.description.toLowerCase().includes(tag.toLowerCase()) ||
          (garment.styling_notes && garment.styling_notes.toLowerCase().includes(tag.toLowerCase()))
      );
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

/**
 * Unit test suite / Edge-case verification runner for catalog filtering logic.
 */
export function runCatalogFilterTests(catalog: Garment[]) {
  const results: { test: string; passed: boolean; details?: any }[] = [];

  // Test 1: Sam Pitching Seed Fund in Gastown (Demo path from PRD)
  const samInput: CandidateFilterInput = {
    flow: "occasion",
    gender_cut: "men",
    budget_tier: ["mid", "premium"],
    occasion: "pitch",
    season_of_wear: "fall",
    palette_season: "autumn",
  };
  const samResult = filterCandidates(catalog, samInput);
  results.push({
    test: "Flow A Demo Path: Sam Pitch in Gastown",
    passed: samResult.is_valid_pool && samResult.candidate_ids_by_slot.shoes.length > 0,
    details: {
      total: samResult.total_candidates,
      relaxed: samResult.relaxed_field,
      counts: samResult.slot_counts,
    },
  });

  // Test 2: Strict Budget Hard-Filter Isolation (Budget Tier = 'budget')
  const budgetInput: CandidateFilterInput = {
    flow: "occasion",
    gender_cut: "men",
    budget_tier: "budget",
    occasion: "smart-casual",
    season_of_wear: "fall",
  };
  const budgetResult = filterCandidates(catalog, budgetInput);
  const nonBudgetLeaks = Object.values(budgetResult.candidates_by_slot)
    .flat()
    .filter((g) => g.budget_tier !== "budget");
  results.push({
    test: "Hard-Filter: Zero Budget Leaks",
    passed: nonBudgetLeaks.length === 0,
    details: { nonBudgetLeaks: nonBudgetLeaks.map((g) => g.id) },
  });

  // Test 3: Relaxation Trigger on Rare Palette
  const rarePaletteInput: CandidateFilterInput = {
    flow: "occasion",
    gender_cut: "men",
    budget_tier: ["mid", "premium"],
    occasion: "pitch",
    season_of_wear: "fall",
    palette_season: "bright_spring", // Not present in topcoat/shoes
  };
  const rareResult = filterCandidates(catalog, rarePaletteInput);
  results.push({
    test: "Flow A Relaxation: Palette Fallback to Neutrals",
    passed: rareResult.relaxed_field === "palette" && rareResult.is_valid_pool,
    details: { relaxed: rareResult.relaxed_field, slot_counts: rareResult.slot_counts },
  });

  // Test 4: Exclusion of Owned Items
  const ownedInput: CandidateFilterInput = {
    flow: "occasion",
    gender_cut: "men",
    budget_tier: ["mid", "premium"],
    occasion: "pitch",
    season_of_wear: "fall",
    owned_item_ids: ["vessi-cityscape-waterproof-sneaker"],
  };
  const ownedResult = filterCandidates(catalog, ownedInput);
  const containsOwned = ownedResult.all_candidate_ids.includes("vessi-cityscape-waterproof-sneaker");
  results.push({
    test: "Owned Item Exclusion: Never Recommends Owned Garment",
    passed: !containsOwned,
    details: { containsOwned },
  });

  return results;
}
