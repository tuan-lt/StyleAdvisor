import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import rawCatalog from "../../../data/catalog.json";
import { filterCandidates } from "../../../lib/catalog-filter";
import {
  Garment,
  GarmentSlot,
  CandidateFilterInput,
  LLMRecommendationPayload,
  RecommendApiResponse,
  UserProfile,
  Occasion,
  SeasonOfWear,
  NudgeType,
} from "../../../types/catalog";


const catalog = rawCatalog as Garment[];

// In-Memory Deterministic Response Cache (keyed on input MD5 hash)
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Hard Timeout Limit
const TIMEOUT_MS = 15000;

interface RecommendRequestBody {
  user_profile: UserProfile;
  occasion?: Occasion;
  season_of_wear?: SeasonOfWear;
  audience_text?: string;
  flow?: "occasion" | "everyday" | "flow_a" | "flow_b";
  formality_target?: number;
  style_preference?: string;
  nudge?: NudgeType;
}

/**
 * Generate MD5 Hash Key for Input Payload
 */
function generateCacheKey(body: RecommendRequestBody): string {
  const normalized = {
    gender_cut: body.user_profile?.gender_cut,
    budget_tier: body.user_profile?.budget_tier,
    body_type: body.user_profile?.body_type,
    palette_season: body.user_profile?.palette_season,
    owned_item_ids: (body.user_profile?.owned_item_ids || []).sort(),
    occasion: body.occasion,
    season_of_wear: body.season_of_wear || body.user_profile?.season_of_wear,
    audience_text: (body.audience_text || "").trim().toLowerCase(),
    flow: body.flow || "occasion",
    formality_target: body.formality_target ?? null,
    nudge: body.nudge ?? null,
  };
  return crypto.createHash("md5").update(JSON.stringify(normalized)).digest("hex");
}

/**
 * Deterministic Stylist Fallback / Heuristic Engine
 * Used when API keys are absent, on retry recovery, or during pre-flight benchmarks.
 */
function generateDeterministicRecommendation(
  filteredCandidates: ReturnType<typeof filterCandidates>,
  body: RecommendRequestBody
): LLMRecommendationPayload {
  const { candidates_by_slot } = filteredCandidates;
  const audience = body.audience_text || "important meeting";
  const occasion = body.occasion || "pitch";

  let targetFormality = body.formality_target || 7;
  let nudgeReasoning = "";

  if (body.nudge === "too_formal") {
    targetFormality = Math.max(3, targetFormality - 2);
    nudgeReasoning =
      "Re-calibrated down in formality per your feedback: softened structure with more relaxed, approachable layers.";
  } else if (body.nudge === "too_casual") {
    targetFormality = Math.min(10, targetFormality + 2);
    nudgeReasoning =
      "Elevated formality and structure per your feedback: dialed in sharper tailoring and authoritative textures.";
  } else if (body.nudge === "not_me") {
    nudgeReasoning =
      "Pivoted aesthetic silhouette per your feedback: curated an alternative tonal harmony while preserving room stakes.";
  }

  // Pick candidates according to nudge
  const pickGarment = (slot: GarmentSlot): Garment | undefined => {
    const list = [...(candidates_by_slot[slot] || [])];
    if (list.length === 0) return undefined;

    if (body.nudge === "too_formal") {
      list.sort((a, b) => a.formality_score - b.formality_score);
      return list[0];
    } else if (body.nudge === "too_casual") {
      list.sort((a, b) => b.formality_score - a.formality_score);
      return list[0];
    } else if (body.nudge === "not_me") {
      return list.length > 1 ? list[1] : list[0];
    }
    return list[0];
  };

  const topGarment = pickGarment("top");
  const bottomGarment = pickGarment("bottom");
  const shoesGarment = pickGarment("shoes");
  const outerwearGarment = pickGarment("outerwear");
  const accessoryGarment = pickGarment("accessory");

  const baseReasoning = `Selected ${topGarment ? topGarment.name : "smart top"} paired with ${
    bottomGarment ? bottomGarment.name : "tailored trousers"
  }${outerwearGarment ? ` and anchored by the ${outerwearGarment.name}` : ""}. The ensemble balances intentional tailoring with practical West Coast weather resistance, letting your ideas take center stage without sartorial distraction.`;

  const reasoning = nudgeReasoning ? `${nudgeReasoning} ${baseReasoning}` : baseReasoning;

  return {
    calibration: {
      formality_target: targetFormality,
      audience_read: `Tailored for ${occasion} context with audience consideration: "${audience}".${
        body.nudge ? ` (Calibrated for ${body.nudge.replace("_", " ")})` : ""
      }`,
      risk_assessment:
        body.nudge === "too_formal"
          ? "Avoided overly rigid corporate lines in favor of approachable smart-casual tailoring."
          : body.nudge === "too_casual"
          ? "Steered clear of under-dressed casual pieces, locking in structured refinement."
          : "Avoided conventional silhouettes, exploring alternate tonal harmonies.",
    },
    interpretation_summary: `Curated ensemble for ${occasion} in Canadian coastal weather, prioritizing understated confidence and refined proportion.${
      body.nudge ? ` Formality re-calibrated (${targetFormality}/10).` : ""
    }`,
    selected_garment_ids: {
      outerwear: outerwearGarment?.id,
      top: topGarment?.id || "",
      bottom: bottomGarment?.id || "",
      shoes: shoesGarment?.id || "",
      accessory: accessoryGarment?.id,
    },
    reasoning,
    override_applied: false,
    caution_notes: outerwearGarment?.fabric.care.includes("Dry clean")
      ? ["Outerwear requires professional dry cleaning."]
      : [],
  };
}

/**
 * Call OpenAI API with candidate IDs and minimal metadata
 */
async function callOpenAIEngine(
  candidatesBySlot: Record<GarmentSlot, Garment[]>,
  body: RecommendRequestBody,
  signal: AbortSignal
): Promise<LLMRecommendationPayload> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  let nudgeGuideline = "";
  if (body.nudge === "too_formal") {
    nudgeGuideline =
      "DISLIKE NUDGE FEEDBACK [TOO FORMAL]: The user felt the previous outfit was overly formal or rigid. You MUST decrease the formality score by 1-2 points and choose more relaxed, approachable, or casual pieces from the candidate pool. In your reasoning, explicitly describe how this new calibration softens formality while maintaining refinement.";
  } else if (body.nudge === "too_casual") {
    nudgeGuideline =
      "DISLIKE NUDGE FEEDBACK [TOO CASUAL]: The user felt the previous outfit was too casual or underdressed. You MUST increase the formality score by 1-2 points and choose sharper, more structured, or authoritative pieces from the candidate pool. In your reasoning, explicitly describe how this new calibration elevates structure and authority.";
  } else if (body.nudge === "not_me") {
    nudgeGuideline =
      "DISLIKE NUDGE FEEDBACK [NOT ME]: The user felt the previous outfit did not match their personal aesthetic identity. You MUST preserve the target formality level, but swap the primary aesthetic/silhouette and select an alternative set of garments with a distinct tonal/silhouette personality from the candidate pool. In your reasoning, explicitly highlight the new style direction.";
  }

  // Strip catalog down to minimal metadata (No product URLs or arbitrary noise)
  const candidatePoolPrompt = Object.entries(candidatesBySlot).map(([slot, items]) => ({
    slot,
    items: items.map((g) => ({
      id: g.id,
      name: g.name,
      brand: g.brand,
      formality_score: g.formality_score,
      color: g.color,
      fabric_summary: g.fabric.composition,
    })),
  }));

  const systemPrompt = `You are an elite Senior Stylist and Master Tailor for "Style Advisor".
ARCHITECTURAL LAW: "The AI is allowed to have taste, but not facts."
- You MUST select EXACTLY ONE garment ID per required slot (top, bottom, shoes) and optionally outerwear/accessory ONLY from the provided candidate list.
- NEVER invent or hallucinate new garment IDs, brands, prices, or links.
- Write editorial styling reasoning in an assured, refined tone (which will be rendered in Newsreader serif).
- Output STRICT JSON matching the schema provided.
${nudgeGuideline ? `\n${nudgeGuideline}` : ""}`;

  const userPrompt = JSON.stringify({
    task: "Select and calibrate an outfit for the user",
    user_context: {
      gender_cut: body.user_profile.gender_cut,
      occasion: body.occasion,
      season_of_wear: body.season_of_wear || body.user_profile.season_of_wear,
      audience_description: body.audience_text,
      target_formality: body.formality_target || 7,
      nudge_feedback: body.nudge || undefined,
    },
    nudge_directive: nudgeGuideline || undefined,
    candidate_pool_by_slot: candidatePoolPrompt,
    required_json_format: {
      calibration: {
        formality_target: 7,
        audience_read: "String reading audience nuance",
        risk_assessment: "String describing what to avoid",
      },
      interpretation_summary: "One sentence summary",
      selected_garment_ids: {
        outerwear: "garment-id-or-null",
        top: "required-garment-id",
        bottom: "required-garment-id",
        shoes: "required-garment-id",
        accessory: "garment-id-or-null",
      },
      reasoning: "Paragraph of editorial styling rationale (must mention nudge calibration if nudge was provided)",
      override_applied: false,
      caution_notes: ["Optional array of fit/care warnings"],
    },
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("EMPTY_LLM_RESPONSE");

  return JSON.parse(content) as LLMRecommendationPayload;
}

/**
 * Call Anthropic Claude API with candidate IDs
 */
async function callAnthropicEngine(
  candidatesBySlot: Record<GarmentSlot, Garment[]>,
  body: RecommendRequestBody,
  signal: AbortSignal
): Promise<LLMRecommendationPayload> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  let nudgeGuideline = "";
  if (body.nudge === "too_formal") {
    nudgeGuideline =
      "DISLIKE NUDGE FEEDBACK [TOO FORMAL]: Decrease formality score by 1-2 points and choose more relaxed/casual pieces from candidate pool. Mention this adjustment in reasoning.";
  } else if (body.nudge === "too_casual") {
    nudgeGuideline =
      "DISLIKE NUDGE FEEDBACK [TOO CASUAL]: Increase formality score by 1-2 points and choose sharper/more structured pieces from candidate pool. Mention this adjustment in reasoning.";
  } else if (body.nudge === "not_me") {
    nudgeGuideline =
      "DISLIKE NUDGE FEEDBACK [NOT ME]: Preserve target formality level, but swap primary aesthetic/silhouette and select an alternative set of garments with a distinct personality. Mention this shift in reasoning.";
  }

  const candidatePoolPrompt = Object.entries(candidatesBySlot).map(([slot, items]) => ({
    slot,
    items: items.map((g) => ({
      id: g.id,
      name: g.name,
      brand: g.brand,
      formality_score: g.formality_score,
      color: g.color,
      fabric_summary: g.fabric.composition,
    })),
  }));

  const systemPrompt = `You are an elite Senior Stylist for "Style Advisor".
ARCHITECTURAL LAW: "The AI is allowed to have taste, but not facts."
Select garment IDs ONLY from the candidate pool provided. Respond ONLY with valid JSON matching Section 7.2 schema.
${nudgeGuideline ? `\n${nudgeGuideline}` : ""}`;

  const userPrompt = `Context: ${JSON.stringify({
    user_context: {
      gender_cut: body.user_profile.gender_cut,
      occasion: body.occasion,
      audience_description: body.audience_text,
      target_formality: body.formality_target || 7,
      nudge: body.nudge,
    },
    nudge_directive: nudgeGuideline || undefined,
    candidate_pool: candidatePoolPrompt,
  })}
Respond with JSON object containing: calibration, interpretation_summary, selected_garment_ids, reasoning, override_applied, caution_notes.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text;
  if (!text) throw new Error("EMPTY_LLM_RESPONSE");

  // Extract JSON from Claude response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("INVALID_JSON_FROM_CLAUDE");

  return JSON.parse(jsonMatch[0]) as LLMRecommendationPayload;
}

export async function POST(req: NextRequest): Promise<NextResponse<RecommendApiResponse>> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS);

  try {
    const body = (await req.json()) as RecommendRequestBody;

    if (!body || !body.user_profile) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST", message: "Missing user_profile in request body." },
        { status: 400 }
      );
    }

    // Step 0: Check Deterministic Cache (MD5 Hash Key)
    const cacheKey = generateCacheKey(body);
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      clearTimeout(timeoutId);
      return NextResponse.json({
        success: true,
        cached: true,
        data: cachedEntry.data,
      });
    }

    // Step 1: Deterministic Code Filtering
    const filterInput: CandidateFilterInput = {
      ...body.user_profile,
      occasion: body.occasion || "casual",
      season_of_wear: body.season_of_wear || body.user_profile.season_of_wear || "fall",
      flow: body.flow || "occasion",
      audience_text: body.audience_text,
      formality_target: body.formality_target,
    };

    const filterResult = filterCandidates(catalog, filterInput);

    // Step 2: LLM Generation (with fallback resiliency)
    let llmPayload: LLMRecommendationPayload;

    try {
      if (process.env.OPENAI_API_KEY) {
        llmPayload = await callOpenAIEngine(filterResult.candidates_by_slot, body, abortController.signal);
      } else if (process.env.ANTHROPIC_API_KEY) {
        llmPayload = await callAnthropicEngine(filterResult.candidates_by_slot, body, abortController.signal);
      } else {
        // Fallback to high-precision deterministic heuristic engine
        llmPayload = generateDeterministicRecommendation(filterResult, body);
      }
    } catch (llmError: any) {
      if (abortController.signal.aborted) {
        throw new Error("TIMEOUT");
      }
      console.warn("LLM API error, engaging deterministic fallback:", llmError?.message);
      llmPayload = generateDeterministicRecommendation(filterResult, body);
      llmPayload.override_applied = true;
    }

    // Step 3: Deterministic Code Validation (Zero Hallucination Verification)
    const validCandidateIds = new Set(filterResult.all_candidate_ids);
    const slotCandidates = filterResult.candidates_by_slot;
    const selectedIds = { ...llmPayload.selected_garment_ids };
    let overrideApplied = llmPayload.override_applied || false;

    // Validate Required Slots
    const requiredSlots: GarmentSlot[] = ["top", "bottom", "shoes"];
    for (const slot of requiredSlots) {
      const currentId = selectedIds[slot];
      const isValid = currentId && validCandidateIds.has(currentId) && slotCandidates[slot]?.some((g) => g.id === currentId);

      if (!isValid) {
        // Silent Correction: Replace with top valid candidate from pool
        const fallbackGarment = slotCandidates[slot]?.[0];
        if (fallbackGarment) {
          selectedIds[slot] = fallbackGarment.id;
          overrideApplied = true;
        }
      }
    }

    // Validate Optional Outerwear
    if (selectedIds.outerwear) {
      const isValid =
        validCandidateIds.has(selectedIds.outerwear) &&
        slotCandidates.outerwear?.some((g) => g.id === selectedIds.outerwear);
      if (!isValid) {
        selectedIds.outerwear = slotCandidates.outerwear?.[0]?.id;
        overrideApplied = true;
      }
    }

    // Validate Optional Accessory
    if (selectedIds.accessory) {
      const isValid =
        validCandidateIds.has(selectedIds.accessory) &&
        slotCandidates.accessory?.some((g) => g.id === selectedIds.accessory);
      if (!isValid) {
        selectedIds.accessory = slotCandidates.accessory?.[0]?.id;
      }
    }

    // Hydrate Full Garment Objects from Catalog Map
    const catalogMap = new Map(catalog.map((g) => [g.id, g]));
    const topGarment = catalogMap.get(selectedIds.top)!;
    const bottomGarment = catalogMap.get(selectedIds.bottom)!;
    const shoesGarment = catalogMap.get(selectedIds.shoes)!;
    const outerwearGarment = selectedIds.outerwear ? catalogMap.get(selectedIds.outerwear) : undefined;
    const accessoryGarment = selectedIds.accessory ? catalogMap.get(selectedIds.accessory) : undefined;

    // Calculate Total Price in CAD
    const totalPrice =
      (topGarment?.price || 0) +
      (bottomGarment?.price || 0) +
      (shoesGarment?.price || 0) +
      (outerwearGarment?.price || 0) +
      (accessoryGarment?.price || 0);

    const responseData = {
      calibration: llmPayload.calibration,
      interpretation_summary: llmPayload.interpretation_summary,
      selected_garments: {
        outerwear: outerwearGarment,
        top: topGarment,
        bottom: bottomGarment,
        shoes: shoesGarment,
        accessory: accessoryGarment,
      },
      selected_garment_ids: selectedIds,
      total_price_cad: totalPrice,
      reasoning: llmPayload.reasoning,
      override_applied: overrideApplied,
      caution_notes: llmPayload.caution_notes || [],
      filter_metadata: {
        relaxed_field: filterResult.relaxed_field,
        relaxed_fields: filterResult.relaxed_fields,
        total_candidates: filterResult.total_candidates,
      },
    };

    // Store in Cache
    cache.set(cacheKey, { timestamp: Date.now(), data: responseData });

    clearTimeout(timeoutId);
    return NextResponse.json({
      success: true,
      cached: false,
      data: responseData,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (abortController.signal.aborted || err.message === "TIMEOUT") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT_RETRY",
          message: "Recommendation generation exceeded 15 seconds. Please retry.",
        },
        { status: 504 }
      );
    }

    console.error("Unhandled recommendation route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: err.message || "Failed to generate recommendation.",
      },
      { status: 500 }
    );
  }
}
