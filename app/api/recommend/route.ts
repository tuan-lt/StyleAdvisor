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
  StyleOption,
} from "../../../types/catalog";

const catalog = rawCatalog as Garment[];

// In-Memory Deterministic Response Cache (keyed on input MD5 hash)
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Hard Timeout Limit per PRD Section 7.3
const TIMEOUT_MS = 15000;

interface RecommendRequestBody {
  user_profile: UserProfile;
  occasion?: Occasion;
  season_of_wear?: SeasonOfWear;
  season_or_climate?: string;
  audience_text?: string;
  flow?: "occasion" | "everyday" | "flow_a" | "flow_b";
  formality_target?: number;
  style_preference?: string;
  nudge?: NudgeType;
  owned_item_ids?: string[];
}

/**
 * Generate MD5 Hash Key for Input Payload
 */
function generateCacheKey(body: RecommendRequestBody): string {
  const normalized = {
    gender: body.user_profile?.gender_expression || body.user_profile?.gender_cut || "male",
    budget: body.user_profile?.budget || body.user_profile?.budget_tier || "$$",
    body_type: body.user_profile?.body_type || "rectangle",
    palette: body.user_profile?.seasonal_colour || body.user_profile?.palette_season || "autumn",
    size: body.user_profile?.size || "M",
    style: body.user_profile?.style || (body.user_profile?.preferred_styles && body.user_profile.preferred_styles[0]) || "classic",
    owned_item_ids: (body.owned_item_ids || body.user_profile?.owned_item_ids || []).slice().sort(),
    occasion: body.occasion || "pitch",
    season: body.season_or_climate || body.season_of_wear || body.user_profile?.season_or_climate || body.user_profile?.season_of_wear || "fall_winter",
    audience_text: (body.audience_text || "").trim().toLowerCase(),
    flow: body.flow || "occasion",
    formality_target: body.formality_target ?? null,
    nudge: body.nudge ?? null,
  };
  return crypto.createHash("md5").update(JSON.stringify(normalized)).digest("hex");
}

/**
 * Detect Occasion Overrides per PRD FR-2.5
 */
function checkOccasionOverride(occasion: Occasion, style?: StyleOption): string | null {
  if (!style) return null;
  const s = style.toLowerCase();
  const occ = occasion.toLowerCase();

  if (occ === "funeral") {
    if (s.includes("trendy") || s.includes("fabulous") || s.includes("sporty")) {
      return "You picked " + (style.charAt(0).toUpperCase() + style.slice(1)) + ". For a funeral, we've kept the silhouette modern but the colours quiet.";
    }
  }

  if (occ === "court") {
    if (s.includes("fabulous") || s.includes("trendy") || s.includes("casual")) {
      return "You picked " + (style.charAt(0).toUpperCase() + style.slice(1)) + ". For a court appearance, we've dialed in solemn structure and subdued tonal balance.";
    }
  }

  return null;
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
  const audience = body.audience_text || "seed fund partners, ex-engineers in Gastown";
  const occasion = body.occasion || "pitch";
  const style = body.user_profile?.style || (body.user_profile?.preferred_styles && body.user_profile.preferred_styles[0]) || "classic";

  let targetFormality = body.formality_target || (occasion === "court" || occasion === "funeral" ? 5 : 4);
  let signal = "considered_not_corporate";
  let nudgeReasoning = "";

  if (body.nudge === "too_formal") {
    targetFormality = Math.max(2, targetFormality - 1);
    signal = "approachable_understated";
    nudgeReasoning =
      "Re-calibrated down in formality per your feedback: softened structure with more relaxed, approachable layers.";
  } else if (body.nudge === "too_casual") {
    targetFormality = Math.min(5, targetFormality + 1);
    signal = "structured_authority";
    nudgeReasoning =
      "Elevated formality and structure per your feedback: dialed in sharper tailoring and authoritative textures.";
  } else if (body.nudge === "not_me") {
    signal = "tonal_alternative";
    nudgeReasoning =
      "Pivoted aesthetic silhouette per your feedback: curated an alternative tonal harmony while preserving room stakes.";
  }

  const overrideApplied = checkOccasionOverride(occasion, style);

  // Pick candidates according to nudge
  const pickGarment = (slot: GarmentSlot): Garment | undefined => {
    const list = [...(candidates_by_slot[slot] || [])];
    if (list.length === 0) return undefined;

    if (body.nudge === "too_formal") {
      list.sort((a, b) => (a.formality_level || a.formality_score / 2) - (b.formality_level || b.formality_score / 2));
      return list[0];
    } else if (body.nudge === "too_casual") {
      list.sort((a, b) => (b.formality_level || b.formality_score / 2) - (a.formality_level || a.formality_score / 2));
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

  // Specific high-taste styling reasoning matching PRD persona Sam
  let reasoning = "";
  if (occasion === "pitch") {
    reasoning = `For a pitching session with former engineering partners in Gastown, structure matters more than corporate formality. We paired the ${
      outerwearGarment ? outerwearGarment.name : "unstructured blazer"
    } with clean ${bottomGarment ? bottomGarment.name : "tailored chinos"} and ${
      topGarment ? topGarment.name : "minimalist knitwear"
    } to project founder credibility without looking stiff or out of touch.`;
  } else if (occasion === "funeral") {
    reasoning = `For a somber memorial service, quiet decorum takes precedence over personal fashion. We selected subdued ${
      outerwearGarment ? outerwearGarment.name : "dark outerwear"
    } with ${bottomGarment ? bottomGarment.name : "dark trousers"} and clean ${
      shoesGarment ? shoesGarment.name : "formal footwear"
    } to show profound respect.`;
  } else if (occasion === "court") {
    reasoning = `For a court hearing, institutional respect and clean tailoring are paramount. We structured the ensemble around the ${
      outerwearGarment ? outerwearGarment.name : "formal jacket"
    } and ${bottomGarment ? bottomGarment.name : "tailored slacks"}, projecting clarity and seriousness.`;
  } else if (occasion === "interview") {
    reasoning = `For a high-stakes job interview, competence and cultural fit are communicated through sharp, unwrinkled lines. The ${
      topGarment ? topGarment.name : "tailored shirt"
    } combined with the ${outerwearGarment ? outerwearGarment.name : "blazer"} establishes poise.`;
  } else {
    reasoning = `Selected ${topGarment ? topGarment.name : "smart top"} paired with ${
      bottomGarment ? bottomGarment.name : "tailored trousers"
    }${outerwearGarment ? ` and anchored by the ${outerwearGarment.name}` : ""}. The ensemble balances intentional Canadian tailoring with practical weather resistance.`;
  }

  if (nudgeReasoning) {
    reasoning = `${nudgeReasoning} ${reasoning}`;
  }

  let interpretationSummary = "";
  if (occasion === "pitch") {
    interpretationSummary = "Technical partners, casual office. Aiming for considered, not corporate.";
  } else if (occasion === "funeral") {
    interpretationSummary = "Solemn gathering, respectful protocol. Aiming for quiet, understated decorum.";
  } else if (occasion === "court") {
    interpretationSummary = "Institutional setting. Aiming for crisp, disciplined propriety.";
  } else {
    interpretationSummary = `${audience}. Aiming for ${signal.replace(/_/g, " ")}.`;
  }

  return {
    calibration: {
      formality_score: targetFormality,
      formality_target: targetFormality,
      signal,
      notes: "Engineers value substance over flashy suits; dark tailored chinos + fine knit blazer sends the right credibility signal.",
      audience_read: `Audience context: "${audience}". Calibrated for ${occasion}.`,
      risk_assessment: "Avoided stiff banker suiting while preventing underdressed hoodie appearance.",
    },
    interpretation_summary: interpretationSummary,
    selected_garment_ids: {
      outerwear: outerwearGarment?.id || null,
      top: topGarment?.id || "",
      bottom: bottomGarment?.id || "",
      shoes: shoesGarment?.id || "",
      accessory: accessoryGarment?.id || null,
    },
    reasoning,
    override_applied: overrideApplied,
    caution_notes: [],
  };
}

/**
 * Call OpenAI API with candidate IDs and minimal metadata (Zero-Hallucination)
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

  const occasion = body.occasion || "pitch";
  const style = body.user_profile?.style || (body.user_profile?.preferred_styles && body.user_profile.preferred_styles[0]) || "classic";
  const overrideCheck = checkOccasionOverride(occasion, style);

  let nudgeGuideline = "";
  if (body.nudge === "too_formal") {
    nudgeGuideline =
      "DISLIKE NUDGE: The user felt the previous outfit was overly formal. Tone down formality by 1 point and select softer, more approachable pieces from the candidate list.";
  } else if (body.nudge === "too_casual") {
    nudgeGuideline =
      "DISLIKE NUDGE: The user felt the previous outfit was too casual. Elevate formality by 1 point and select sharper, more authoritative tailoring from the candidate list.";
  } else if (body.nudge === "not_me") {
    nudgeGuideline =
      "DISLIKE NUDGE: The user wants an alternative aesthetic direction. Swap the silhouette and pick alternative candidate garments.";
  }

  const candidatePoolPrompt = Object.entries(candidatesBySlot).map(([slot, items]) => ({
    slot,
    items: items.slice(0, 8).map((g) => ({
      id: g.id,
      name: g.name,
      brand: g.brand,
      formality_score: g.formality_level || Math.round(g.formality_score / 2),
      styles: g.styles,
      fabric: typeof g.fabric === "string" ? g.fabric : g.fabric.composition,
    })),
  }));

  const systemPrompt = `You are the AI Styling Engine for "Style Advisor" (Canadian Climate & High-Stakes Dressing).
ARCHITECTURAL LAW: "The AI is allowed to have taste, but not facts."
- You MUST select EXACTLY ONE garment ID per slot (outerwear, top, bottom, shoes, and optional accessory) ONLY from the provided candidate list.
- NEVER invent or hallucinate new garment IDs, prices, or links.
- Write editorial styling reasoning in a confident Newsreader serif tone.
- Schema compliance is mandatory.
${overrideCheck ? `OCCASION OVERRIDE NOTICE: ${overrideCheck}` : ""}
${nudgeGuideline ? `\n${nudgeGuideline}` : ""}`;

  const userPrompt = JSON.stringify({
    task: "Select and calibrate exactly one complete outfit from candidates",
    user_context: {
      gender_expression: body.user_profile?.gender_expression || body.user_profile?.gender_cut || "male",
      occasion: body.occasion || "pitch",
      audience_free_text: body.audience_text || "VC partners in Gastown",
      season: body.season_or_climate || body.season_of_wear || "fall_winter",
      style: style,
      nudge: body.nudge || null,
    },
    candidate_pool: candidatePoolPrompt,
    required_json_format: {
      calibration: {
        formality_score: 4,
        signal: "considered_not_corporate",
        notes: "Explanation of audience signal",
      },
      interpretation_summary: "Short one-sentence confirmation line before displaying outfit",
      selected_garment_ids: {
        outerwear: "ca_brand_id_or_null",
        top: "ca_brand_id",
        bottom: "ca_brand_id",
        shoes: "ca_brand_id",
        accessory: "ca_brand_id_or_null",
      },
      reasoning: "Editorial justification in Newsreader tone explaining why this calibration satisfies room expectations.",
      override_applied: overrideCheck || null,
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
 * Call Anthropic Claude API with candidate IDs (Zero-Hallucination)
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

  const occasion = body.occasion || "pitch";
  const style = body.user_profile?.style || (body.user_profile?.preferred_styles && body.user_profile.preferred_styles[0]) || "classic";
  const overrideCheck = checkOccasionOverride(occasion, style);

  const candidatePoolPrompt = Object.entries(candidatesBySlot).map(([slot, items]) => ({
    slot,
    items: items.slice(0, 8).map((g) => ({
      id: g.id,
      name: g.name,
      brand: g.brand,
      formality_score: g.formality_level || Math.round(g.formality_score / 2),
      styles: g.styles,
      fabric: typeof g.fabric === "string" ? g.fabric : g.fabric.composition,
    })),
  }));

  const systemPrompt = `You are the AI Styling Engine for "Style Advisor".
ARCHITECTURAL LAW: "The AI is allowed to have taste, but not facts."
Select garment IDs ONLY from the candidate pool provided. Respond ONLY with valid JSON matching Section 7.2 schema.
${overrideCheck ? `OCCASION OVERRIDE NOTICE: ${overrideCheck}` : ""}`;

  const userPrompt = `Context: ${JSON.stringify({
    user_context: {
      gender_expression: body.user_profile?.gender_expression || body.user_profile?.gender_cut,
      occasion: body.occasion,
      audience_free_text: body.audience_text,
      season: body.season_or_climate || body.season_of_wear,
      style: style,
      nudge: body.nudge,
    },
    candidate_pool: candidatePoolPrompt,
  })}
Respond with JSON object containing: calibration (formality_score, signal, notes), interpretation_summary, selected_garment_ids (outerwear, top, bottom, shoes, accessory), reasoning, override_applied.`;

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

    // Step 1: Deterministic Code Filtering (Zero-Hallucination Foundation)
    const filterInput: CandidateFilterInput = {
      ...body.user_profile,
      gender_cut: body.user_profile.gender_cut || (body.user_profile.gender_expression?.toLowerCase() as any) || "male",
      budget_tier: body.user_profile.budget_tier || (body.user_profile.budget as any) || "$$",
      occasion: body.occasion || "pitch",
      season_of_wear: body.season_of_wear || (body.season_or_climate as any) || "fall_winter",
      flow: body.flow || "occasion",
      audience_text: body.audience_text,
      formality_target: body.formality_target,
      owned_item_ids: body.owned_item_ids || body.user_profile.owned_item_ids,
    };

    const filterResult = filterCandidates(catalog, filterInput);

    // Step 2: LLM Generation (with graceful fallback resilience)
    let llmPayload: LLMRecommendationPayload;

    try {
      if (process.env.OPENAI_API_KEY) {
        llmPayload = await callOpenAIEngine(filterResult.candidates_by_slot, body, abortController.signal);
      } else if (process.env.ANTHROPIC_API_KEY) {
        llmPayload = await callAnthropicEngine(filterResult.candidates_by_slot, body, abortController.signal);
      } else {
        llmPayload = generateDeterministicRecommendation(filterResult, body);
      }
    } catch (llmError: any) {
      if (abortController.signal.aborted) {
        throw new Error("TIMEOUT");
      }
      console.warn("Engaging deterministic recommendation engine:", llmError?.message);
      llmPayload = generateDeterministicRecommendation(filterResult, body);
    }

    // Step 3: Zero-Hallucination Code Validation
    const validCandidateIds = new Set(filterResult.all_candidate_ids);
    const slotCandidates = filterResult.candidates_by_slot;
    const selectedIds = { ...llmPayload.selected_garment_ids };
    let overrideApplied = llmPayload.override_applied || checkOccasionOverride(body.occasion || "pitch", body.user_profile.style);

    // Validate Required Slots (top, bottom, shoes)
    const requiredSlots: GarmentSlot[] = ["top", "bottom", "shoes"];
    for (const slot of requiredSlots) {
      const currentId = selectedIds[slot];
      const isValid = currentId && validCandidateIds.has(currentId) && slotCandidates[slot]?.some((g) => g.id === currentId);

      if (!isValid) {
        const fallbackGarment = slotCandidates[slot]?.[0];
        if (fallbackGarment) {
          selectedIds[slot] = fallbackGarment.id;
        }
      }
    }

    // Validate Optional Outerwear
    if (selectedIds.outerwear) {
      const isValid =
        validCandidateIds.has(selectedIds.outerwear) &&
        slotCandidates.outerwear?.some((g) => g.id === selectedIds.outerwear);
      if (!isValid) {
        selectedIds.outerwear = slotCandidates.outerwear?.[0]?.id || null;
      }
    } else if (slotCandidates.outerwear && slotCandidates.outerwear.length > 0) {
      selectedIds.outerwear = slotCandidates.outerwear[0].id;
    }

    // Validate Optional Accessory
    if (selectedIds.accessory) {
      const isValid =
        validCandidateIds.has(selectedIds.accessory) &&
        slotCandidates.accessory?.some((g) => g.id === selectedIds.accessory);
      if (!isValid) {
        selectedIds.accessory = slotCandidates.accessory?.[0]?.id || null;
      }
    }

    // Hydrate Full Garment Objects from Catalog
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
      calibration: {
        formality_score: llmPayload.calibration?.formality_score || 4,
        signal: llmPayload.calibration?.signal || "considered_not_corporate",
        notes: llmPayload.calibration?.notes || "Calibrated for room expectations.",
      },
      interpretation_summary: llmPayload.interpretation_summary || "Considered, modern styling calibrated for Canadian climate.",
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

    // Store in Deterministic Cache
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
