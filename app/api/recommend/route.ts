import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { filterCandidates, matchGender } from "../../../lib/catalog-filter";
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
  CapsuleAiData,
  CapsuleAiLook,
} from "../../../types/catalog";

import {
  getAllGarmentsFromDb,
} from "../../../lib/db";
import { rankCandidates, getDefaultFormalityForOccasion, selectBalancedCapsule15 } from "../../../lib/garment-scorer";
import { getAiConfig, getAiConfigAsync, AiConfig } from "../../../lib/ai-config";

/**
 * Get catalog directly from Postgres database with local catalog.json fallback
 */
async function getLatestCatalog(): Promise<Garment[]> {
  try {
    const dbGarments = await getAllGarmentsFromDb();
    if (dbGarments && dbGarments.length > 0) {
      return dbGarments;
    }
  } catch (err: any) {
    console.warn("Postgres fetch failed, falling back to local data/catalog.json:", err?.message);
  }

  try {
    const localCatalog = require("../../../data/catalog.json");
    return (localCatalog || []) as Garment[];
  } catch (e) {
    console.error("Failed to load local data/catalog.json fallback:", e);
    return [];
  }
}

// In-Memory Deterministic Response Cache (keyed on input MD5 hash)
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Set max serverless function execution time for Vercel
export const maxDuration = 45;

// Hard Timeout Limits per PRD Section 7.3 & 8.2
const OVERALL_TIMEOUT_MS = 35000;
const LLM_TIMEOUT_MS = 30000; // LLM timeout before automated fallback to heuristic engine (30s)

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
  excluded_garment_ids?: string[];
  iteration?: number;
  locale?: "en" | "fr";
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
    excluded_garment_ids: (body.excluded_garment_ids || []).slice().sort(),
    iteration: body.iteration ?? 0,
    occasion: body.occasion || "pitch",
    season: body.season_or_climate || body.season_of_wear || body.user_profile?.season_or_climate || body.user_profile?.season_of_wear || "fall_winter",
    audience_text: (body.audience_text || "").trim().toLowerCase(),
    flow: body.flow || "occasion",
    formality_target: body.formality_target ?? null,
    nudge: body.nudge ?? null,
    locale: body.locale || "en",
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
  const targetPalette = body.user_profile?.seasonal_colour || body.user_profile?.palette_season;

  let targetFormality = body.formality_target || getDefaultFormalityForOccasion(occasion);
  let signal = occasion === "date" ? "relaxed_charm" : "considered_not_corporate";
  let nudgeReasoning = "";

  if (body.nudge === "too_formal") {
    signal = "approachable_understated";
    nudgeReasoning =
      "Re-calibrated down in formality per your feedback: softened structure with more relaxed, approachable layers.";
  } else if (body.nudge === "too_casual") {
    signal = "structured_authority";
    nudgeReasoning =
      "Elevated formality and structure per your feedback: dialed in sharper tailoring and authoritative textures.";
  } else if (body.nudge === "not_me") {
    signal = "tonal_alternative";
    nudgeReasoning =
      "Pivoted aesthetic silhouette per your feedback: curated a fresh alternative tonal harmony exploring the Canadian catalog.";
  }

  const overrideApplied = checkOccasionOverride(occasion, style);
  const excludedSet = new Set(body.excluded_garment_ids || []);
  const iteration = body.iteration || 0;

  const scoringOpts = {
    targetFormality,
    targetPalette,
    targetStyle: style,
    targetOccasion: occasion,
    targetBodyType: body.user_profile?.body_type,
    targetSize: body.user_profile?.size,
    audienceText: body.audience_text,
    excludedIds: excludedSet,
  };

  // Dynamic candidate scoring and rotation per slot
  const pickGarment = (slot: GarmentSlot): Garment | undefined => {
    const list = [...(candidates_by_slot[slot] || [])];
    if (list.length === 0) return undefined;

    const ranked = rankCandidates(list, scoringOpts);
    const unexcluded = ranked.filter((item) => !excludedSet.has(item.garment.id));
    const pool = unexcluded.length > 0 ? unexcluded : ranked;

    // Rotate through candidate pool with iteration
    const selectedIndex = iteration % pool.length;
    return pool[selectedIndex]?.garment;
  };

  const topGarment = pickGarment("top");
  const bottomGarment = pickGarment("bottom");
  const shoesGarment = pickGarment("shoes");
  const outerwearGarment = pickGarment("outerwear");
  const accessoryGarment = pickGarment("accessory");

  const isFr = body.locale === "fr";

  // Specific high-taste styling reasoning matching PRD persona Sam
  let reasoning = "";
  if (isFr) {
    if (occasion === "pitch") {
      reasoning = `Pour une présentation d'affaires, la crédibilité et le confort priment sur le costume strict. Nous avons associé ${
        outerwearGarment ? outerwearGarment.name : "le veston souple"
      } avec ${bottomGarment ? bottomGarment.name : "un pantalon ajusté"} et ${
        topGarment ? topGarment.name : "un haut épuré"
      } pour dégager une assurance naturelle sans paraître trop rigide.`;
    } else if (occasion === "interview") {
      reasoning = `Pour une entrevue d'embauche, la compétence et la présentation soignée sont mises en valeur par des lignes nettes. L'association de ${
        topGarment ? topGarment.name : "la chemise nette"
      } et de ${outerwearGarment ? outerwearGarment.name : "la veste ajustée"} inspire confiance et professionnalisme.`;
    } else if (occasion === "funeral") {
      reasoning = `Pour une cérémonie de recueillement, la discrétion et le respect prévalent. Nous avons sélectionné ${
        outerwearGarment ? outerwearGarment.name : "un manteau sombre"
      } avec ${bottomGarment ? bottomGarment.name : "un pantalon habillé foncé"} pour exprimer une solennité bienveillante.`;
    } else if (occasion === "court") {
      reasoning = `Pour un cadre officiel, le respect des codes et une coupe irréprochable sont indispensables. L'ensemble s'articule autour de ${
        outerwearGarment ? outerwearGarment.name : "la veste formelle"
      } et ${bottomGarment ? bottomGarment.name : "du pantalon classique"}.`;
    } else if (occasion === "date") {
      reasoning = `Pour une soirée ou un souper en ville, l'équilibre entre charme naturel et aisance est parfait. L'association de ${
        topGarment ? topGarment.name : "ce haut soigné"
      } avec ${bottomGarment ? bottomGarment.name : "un bas confortable"}${
        outerwearGarment ? ` et ${outerwearGarment.name}` : ""
      } crée une silhouette élégante sans en faire trop.`;
    } else {
      reasoning = `Sélection de ${topGarment ? topGarment.name : "haut élégant"} associé à ${
        bottomGarment ? bottomGarment.name : "pantalon soigné"
      }${outerwearGarment ? ` complété par ${outerwearGarment.name}` : ""}. L'ensemble allie élégance canadienne et aisance pratique au quotidien.`;
    }
  } else {
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
    } else if (occasion === "date") {
      reasoning = `For date night or dinner out, effortless charm and comfortable confidence take center stage. We paired ${
        topGarment ? topGarment.name : "the versatile top"
      } with ${bottomGarment ? bottomGarment.name : "clean tailored bottoms"}${
        outerwearGarment ? ` and anchored with ${outerwearGarment.name}` : ""
      } for an approachable, naturally stylish evening silhouette.`;
    } else {
      reasoning = `Selected ${topGarment ? topGarment.name : "smart top"} paired with ${
        bottomGarment ? bottomGarment.name : "tailored trousers"
      }${outerwearGarment ? ` and anchored by the ${outerwearGarment.name}` : ""}. The ensemble balances intentional Canadian tailoring with practical weather resistance.`;
    }
  }

  if (nudgeReasoning) {
    reasoning = `${nudgeReasoning} ${reasoning}`;
  }

  let interpretationSummary = "";
  if (isFr) {
    if (occasion === "pitch") {
      interpretationSummary = "Cadre d'affaires moderne et dynamique. Allure soignée et crédible, sans rigidité.";
    } else if (occasion === "interview") {
      interpretationSummary = "Entrevue professionnelle. Allure confiante, soignée et structurée.";
    } else if (occasion === "funeral") {
      interpretationSummary = "Cérémonie de recueillement. Sobriété, respect et dignité.";
    } else if (occasion === "court") {
      interpretationSummary = "Cadre officiel institutionnel. Tenue impeccable et mesurée.";
    } else if (occasion === "date") {
      interpretationSummary = "Soirée ou restaurant. Allure charmante, détendue et soignée sans en faire trop.";
    } else {
      interpretationSummary = `Cadre ${occasion}. Tenue harmonieuse et adaptée.`;
    }
  } else {
    if (occasion === "pitch") {
      interpretationSummary = "Technical partners, casual office. Aiming for considered, not corporate.";
    } else if (occasion === "funeral") {
      interpretationSummary = "Solemn gathering, respectful protocol. Aiming for quiet, understated decorum.";
    } else if (occasion === "court") {
      interpretationSummary = "Institutional setting. Aiming for crisp, disciplined propriety.";
    } else if (occasion === "date") {
      interpretationSummary = "Dinner out or date night. Aiming for effortless charm and relaxed style.";
    } else {
      interpretationSummary = `${audience}. Aiming for ${signal.replace(/_/g, " ")}.`;
    }
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
 * Pre-scores and ranks all candidates per slot, extracting the Top 8 most suitable
 * items to include in the AI prompt candidate pool.
 */
function prepareCandidatePoolPrompt(
  candidatesBySlot: Record<GarmentSlot, Garment[]>,
  body: RecommendRequestBody
) {
  const targetFormality = body.formality_target || getDefaultFormalityForOccasion(body.occasion);
  const targetPalette = body.user_profile?.seasonal_colour || body.user_profile?.palette_season;
  const targetStyle = body.user_profile?.style || (body.user_profile?.preferred_styles && body.user_profile.preferred_styles[0]);
  const targetOccasion = body.occasion;
  const targetBodyType = body.user_profile?.body_type;
  const targetSize = body.user_profile?.size;
  const audienceText = body.audience_text;
  const excludedIds = new Set(body.excluded_garment_ids || []);

  return Object.entries(candidatesBySlot).map(([slot, items]) => {
    const ranked = rankCandidates(items, {
      targetFormality,
      targetPalette,
      targetStyle,
      targetOccasion,
      targetBodyType,
      targetSize,
      audienceText,
      excludedIds,
    });

    const top8 = ranked.slice(0, 8).map((r) => r.garment);

    return {
      slot,
      items: top8.map((g) => ({
        id: g.id,
        name: g.name,
        brand: g.brand,
        formality_score: g.formality_level || Math.round((g.formality_score || 6) / 2),
        styles: g.styles,
        fabric: typeof g.fabric === "string" ? g.fabric : g.fabric?.composition || "Canadian Blend",
        size_range: g.size_range || undefined,
        styling_notes: g.styling_notes || undefined,
      })),
    };
  });
}

/**
 * Safely extracts text content from LLM choice, handling string, array, and reasoning/thinking formats
 */
function extractLlmContent(choice: any): string | null {
  if (!choice) return null;
  const message = choice.message;
  let content = message?.content;

  if (Array.isArray(content)) {
    content = content
      .map((item: any) => (typeof item === "string" ? item : item.text || item.content || ""))
      .join("\n")
      .trim();
  } else if (typeof content === "string") {
    content = content.trim();
  }

  // Fallback to reasoning block for thinking models (e.g. DeepSeek R1, Nemotron)
  if (!content && message?.reasoning && typeof message.reasoning === "string") {
    content = message.reasoning.trim();
  }

  // Fallback to legacy completion text field
  if (!content && choice.text && typeof choice.text === "string") {
    content = choice.text.trim();
  }

  return content || null;
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

  const candidatePoolPrompt = prepareCandidatePoolPrompt(candidatesBySlot, body);

  const isFr = body.locale === "fr";

  const systemPrompt = `You are the AI Styling Engine for "Style Advisor" (Canadian Climate & High-Stakes Dressing).
ARCHITECTURAL LAW: "The AI is allowed to have taste, but not facts."
- You MUST select EXACTLY ONE garment ID per slot (outerwear, top, bottom, shoes, and optional accessory) ONLY from the provided candidate list.
- NEVER invent or hallucinate new garment IDs, prices, or links.
- Write editorial styling reasoning in a confident Newsreader serif tone.${isFr ? "\n- CRITICAL: Write all reasoning and interpretation_summary in conversational, polite, and natural French (Canadian French)." : ""}
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
      formality_target: body.formality_target || null,
      excluded_garment_ids: body.excluded_garment_ids || [],
      instruction: body.excluded_garment_ids && body.excluded_garment_ids.length > 0
        ? "Do NOT select any garment IDs present in excluded_garment_ids. Pick fresh, alternative pieces from the candidate pool."
        : "Select the most cohesive and elevated outfit from the candidate pool.",
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

  const aiConfig = getAiConfig();
  const modelToUse = aiConfig.selected_model && aiConfig.selected_model !== "custom" ? aiConfig.selected_model : "gpt-4o";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelToUse,
      response_format: { type: "json_object" },
      temperature: 0.7,
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
  const content = extractLlmContent(result.choices?.[0]);
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

  const candidatePoolPrompt = prepareCandidatePoolPrompt(candidatesBySlot, body);

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
      excluded_garment_ids: body.excluded_garment_ids || [],
    },
    candidate_pool: candidatePoolPrompt,
  })}
Respond with JSON object containing: calibration (formality_score, signal, notes), interpretation_summary, selected_garment_ids (outerwear, top, bottom, shoes, accessory), reasoning, override_applied.`;

  const aiConfig = getAiConfig();
  const modelToUse = aiConfig.selected_model && aiConfig.selected_model !== "custom" ? aiConfig.selected_model : "claude-3-5-sonnet-20241022";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelToUse,
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

/**
 * Call OpenRouter API (Gemini 2.0 Flash / Free Tier)
 */
async function callOpenRouterEngine(
  candidatesBySlot: Record<GarmentSlot, Garment[]>,
  body: RecommendRequestBody,
  signal: AbortSignal
): Promise<LLMRecommendationPayload> {
  const aiConfig = getAiConfig();
  const apiKey = aiConfig.openrouter_api_key || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }
  const model = aiConfig.selected_model || process.env.OPENROUTER_MODEL || "openrouter/free";

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

  const candidatePoolPrompt = prepareCandidatePoolPrompt(candidatesBySlot, body);
  const isFr = body.locale === "fr";

  const systemPrompt = `You are the AI Styling Engine for "Style Advisor" (Canadian Climate & High-Stakes Dressing).
ARCHITECTURAL LAW: "The AI is allowed to have taste, but not facts."
- You MUST select EXACTLY ONE garment ID per slot (outerwear, top, bottom, shoes, and optional accessory) ONLY from the provided candidate list.
- NEVER invent or hallucinate new garment IDs, prices, or links.
- Write editorial styling reasoning in a confident Newsreader serif tone.${isFr ? "\n- CRITICAL: Write all reasoning and interpretation_summary in conversational, polite, and natural French (Canadian French)." : ""}
- Return ONLY valid JSON containing: calibration (formality_score, signal, notes), interpretation_summary, selected_garment_ids (outerwear, top, bottom, shoes, accessory), reasoning, override_applied.
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
      formality_target: body.formality_target || null,
      excluded_garment_ids: body.excluded_garment_ids || [],
      instruction: body.excluded_garment_ids && body.excluded_garment_ids.length > 0
        ? "Do NOT select any garment IDs present in excluded_garment_ids. Pick fresh, alternative pieces from the candidate pool."
        : "Select the most cohesive and elevated outfit from the candidate pool.",
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

  // Build fallback model list for OpenRouter: requested model first, then guaranteed reliable alternatives
  const primaryModel = model || "google/gemini-2.5-flash";
  const modelList = Array.from(
    new Set([primaryModel, "google/gemini-2.5-flash", "openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct"])
  );

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Style Advisor",
    },
    body: JSON.stringify({
      models: modelList,
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  let content = extractLlmContent(result.choices?.[0]);

  // If content is empty despite HTTP 200, retry once with guaranteed structured model
  if (!content) {
    console.warn("OpenRouter returned empty content. Retrying with google/gemini-2.5-flash fallback...");
    const retryRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Style Advisor Fallback",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        max_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal,
    });
    if (retryRes.ok) {
      const retryResult = await retryRes.json();
      content = extractLlmContent(retryResult.choices?.[0]);
    }
  }

  if (!content) throw new Error("EMPTY_LLM_RESPONSE");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("INVALID_JSON_FROM_OPENROUTER");

  return JSON.parse(jsonMatch[0]) as LLMRecommendationPayload;
}

/**
 * Dynamic heuristic baseline for 15-piece everyday capsule insight
 */
function getHeuristicCapsuleInsight(
  capsule15: Garment[],
  body: RecommendRequestBody
): CapsuleAiData {
  const isFr = body.locale === "fr";
  const profile = body.user_profile;
  const tags = (profile?.lifestyle || profile?.lifestyle_tags || []).map((t) => t.toLowerCase());

  let look1Title = isFr ? "Tenue 01 : Bureau hybride & Rencontre client" : "Worked Outfit 01: Hybrid Office & Client Standup";
  let look1Sub = isFr ? "Coupe soignée avec un confort pensé pour toute la journée" : "Tailored structure with breathable all-day mobility";
  let look1Tip = isFr
    ? "Boutonnez le veston pour vos rendez-vous formels ; mariez-le avec un pantalon habillé neutre pour une élégance canadienne sans effort."
    : "Button the blazer when entering formal rooms; pair with neutral tailored trousers for effortless Canadian polish.";

  if (tags.includes("new_grad")) {
    look1Title = isFr ? "Tenue 01 : Début de carrière & Première impression" : "Worked Outfit 01: Career Starter & Confident Poise";
    look1Sub = isFr ? "Lignes nettes et modernes projetant assurance et professionnalisme" : "Sharp contemporary lines projecting ambition and polished ease";
    look1Tip = isFr
      ? "Misez sur un haut net et des souliers cirés pour un impact immédiat dès le premier regard."
      : "Rely on a crisp collared layer and clean shoes to make a reliable first impression.";
  }

  let look2Title = isFr ? "Tenue 02 : Studio créatif & Rencontre d'équipe" : "Worked Outfit 02: Downtown Studio & Creative Standup";
  let look2Sub = isFr ? "Lignes épurées et matières douces certifiées pour un style détendu" : "Minimalist drape paired with comfortable certified cotton layers";
  let look2Tip = isFr
    ? "Des superpositions douces permettent de passer aisément du bureau du matin aux espaces de cotravail de l'après-midi."
    : "Clean tonal layering allows easy movement between morning meetings and afternoon coworking spaces.";

  if (tags.includes("family")) {
    look2Title = isFr ? "Tenue 02 : Routine familiale & Sorties de fin de semaine" : "Worked Outfit 02: Family Routine & Weekend Errand Run";
    look2Sub = isFr ? "Confort durable et matières faciles d'entretien pour bouger librement" : "Durable fabrics and comfortable stretch designed for active weekend errands";
    look2Tip = isFr
      ? "Associez vos sneakers confortables et votre veste souple pour enchaîner les activités sans compromis de style."
      : "Pair comfortable sneakers and a relaxed outer layer to transition smoothly between family errands and casual lunches.";
  }

  let look3Title = isFr ? "Tenue 03 : Fin de semaine & Déplacements" : "Worked Outfit 03: Weekend Commute & Offsite";
  let look3Sub = isFr ? "Protection météo et allure décontractée et soignée" : "Weatherproof protection with sleek minimalist casual lines";
  let look3Tip = isFr
    ? "Associez les couches techniques pour affronter la météo changeante tout en restant élégant."
    : "Layer the weather-resistant shell over the knit top to easily handle sudden Canadian temperature drops.";

  if (tags.includes("outdoors") || tags.includes("transit")) {
    look3Title = isFr ? "Tenue 03 : En transit & Météo active" : "Worked Outfit 03: Transit Commute & Weather-Ready Movement";
    look3Sub = isFr ? "Tissus techniques coupe-vent et chaussures parées pour les déplacements" : "Technical water-repellent protection paired with all-day commuter ease";
    look3Tip = isFr
      ? "Une veste respirante associée à des chaussures résistantes à l'eau vous gardent au sec entre la station et votre destination."
      : "A breathable technical jacket combined with water-resistant footwear keeps you protected between transit stops and evening destinations.";
  }

  const intro = isFr
    ? "« Conçue pour la vraie vie et la météo canadienne. Nous avons réuni 15 pièces polyvalentes aux teintes complémentaires pour que chaque haut s'accorde naturellement avec chaque bas. Fini le casse-tête du matin : un style soigné et sans effort au quotidien. »"
    : "“Designed for real life and changing Canadian weather. We handpicked 15 versatile pieces in complementary tones so that every single top pairs naturally with every bottom. No more morning guesswork—just effortless style every day.”";

  return {
    intro_editorial: intro,
    versatility_metric: isFr
      ? "Plus de 30 combinaisons possibles • Superpositions parées pour le climat canadien"
      : "30+ outfit permutations • Canadian climate-ready layering matrix",
    looks: [
      { id: "combo-1", title: look1Title, subtitle: look1Sub, formality: 4, styling_tip: look1Tip },
      { id: "combo-2", title: look2Title, subtitle: look2Sub, formality: 3, styling_tip: look2Tip },
      { id: "combo-3", title: look3Title, subtitle: look3Sub, formality: 2, styling_tip: look3Tip },
    ],
    ai_model: "Deterministic Heuristic",
  };
}

/**
 * Generate AI-Powered Editorial Curation for the 15-Piece Everyday Capsule
 */
async function generateCapsuleAiInsight(
  capsule15: Garment[],
  body: RecommendRequestBody,
  aiConfig: AiConfig,
  signal: AbortSignal
): Promise<CapsuleAiData> {
  const isFr = body.locale === "fr";
  const defaultInsight = getHeuristicCapsuleInsight(capsule15, body);
  const provider = aiConfig.provider || "openrouter";
  if (provider === "none") return defaultInsight;

  let apiKey = "";
  if (provider === "openrouter") apiKey = aiConfig.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";
  else if (provider === "openai") apiKey = aiConfig.openai_api_key || process.env.OPENAI_API_KEY || "";
  else if (provider === "anthropic") apiKey = aiConfig.anthropic_api_key || process.env.ANTHROPIC_API_KEY || "";

  if (!apiKey) return defaultInsight;

  const model = aiConfig.selected_model || "openrouter/free";
  const profile = body.user_profile;
  const lifestyle = profile?.lifestyle || profile?.lifestyle_tags || [];
  const style = profile?.style || "classic";
  const season = body.season_or_climate || body.season_of_wear || "fall_winter";

  try {
    const garmentsSummary = capsule15.map((g) => ({
      id: g.id,
      name: g.name,
      brand: g.brand,
      slot: g.slot,
      price: g.price_cad || g.price,
    }));

    const systemPrompt = `You are the Lead Stylist for "Style Advisor" specializing in versatile 15-piece Canadian Capsule Wardrobes.
Your tone is confident, editorial, warm, and highly practical.
You are given a curated 15-piece wardrobe.
Create:
1. "intro_editorial": An inspiring 2-sentence styling statement explaining how this 15-piece collection fits the user's lifestyle (${lifestyle.join(", ") || "daily routine"}) and Canadian weather (${season}).
2. "looks": Array of 3 distinct ready-to-wear outfits tailored to their lifestyle:
   - Look 01 (Primary daily routine)
   - Look 02 (Secondary routine / transit / creative)
   - Look 03 (Weekend / social / offsite)
   For each look provide:
     - "id": "combo-1", "combo-2", "combo-3"
     - "title": Concise, evocative title (e.g. "${isFr ? "Tenue 01 : ..." : "Worked Outfit 01: ..."}")
     - "subtitle": 1 short sentence on silhouette and comfort
     - "formality": integer 1-5
     - "styling_tip": 1 specific layering or styling advice sentence for Canadian weather
     - "garment_ids": array of 4 garment IDs chosen ONLY from the 15 pieces (1 top, 1 bottom, 1 shoes, 1 outerwear)
3. "versatility_metric": A short highlight (e.g. "30+ outfit permutations • Weather-ready Canadian layering").
${isFr ? "CRITICAL: Write all text in refined, modern French (Canadian French)." : "Write in refined, modern English."}
Return ONLY valid JSON matching this schema.`;

    const userPrompt = JSON.stringify({
      user: {
        gender: profile?.gender_expression || profile?.gender_cut,
        style,
        lifestyle,
        palette: profile?.seasonal_colour || profile?.palette_season,
        season,
      },
      capsule_garments: garmentsSummary,
    });

    let endpoint = "https://openrouter.ai/api/v1/chat/completions";
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Style Advisor Capsule",
    };

    if (provider === "openai") {
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    }

    const primaryCapsuleModel = model || "google/gemini-2.5-flash";
    const capsuleModels = provider === "openrouter"
      ? Array.from(new Set([primaryCapsuleModel, "google/gemini-2.5-flash", "openai/gpt-4o-mini"]))
      : undefined;

    const reqBody: any = {
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };
    if (capsuleModels) {
      reqBody.models = capsuleModels;
    } else {
      reqBody.model = model;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(reqBody),
      signal,
    });

    if (!res.ok) throw new Error(`LLM Error HTTP ${res.status}`);
    const json = await res.json();
    let content = extractLlmContent(json.choices?.[0]);
    if (!content) throw new Error("Empty response");

    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");

    const parsed = JSON.parse(match[0]);
    if (parsed.looks && Array.isArray(parsed.looks) && parsed.looks.length >= 3) {
      return {
        intro_editorial: parsed.intro_editorial || defaultInsight.intro_editorial,
        styling_philosophy: parsed.styling_philosophy,
        versatility_metric: parsed.versatility_metric || defaultInsight.versatility_metric,
        looks: parsed.looks.slice(0, 3).map((l: any, idx: number) => ({
          id: `combo-${idx + 1}`,
          title: l.title || defaultInsight.looks[idx]?.title,
          subtitle: l.subtitle || defaultInsight.looks[idx]?.subtitle,
          formality: typeof l.formality === "number" ? l.formality : defaultInsight.looks[idx]?.formality || 3,
          styling_tip: l.styling_tip || defaultInsight.looks[idx]?.styling_tip,
          garment_ids: Array.isArray(l.garment_ids) && l.garment_ids.length > 0 ? l.garment_ids : undefined,
        })),
        ai_model: model,
      };
    }
  } catch (err: any) {
    console.warn("AI Capsule Generation fallback to heuristics:", err?.message);
  }

  return defaultInsight;
}

export async function POST(req: NextRequest): Promise<NextResponse<RecommendApiResponse>> {
  const overallAbortController = new AbortController();
  const overallTimeoutId = setTimeout(() => overallAbortController.abort(), OVERALL_TIMEOUT_MS);

  try {
    const body = (await req.json()) as RecommendRequestBody;

    if (!body || !body.user_profile) {
      clearTimeout(overallTimeoutId);
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST", message: "Missing user_profile in request body." },
        { status: 400 }
      );
    }

    // Step 0: Check Deterministic Cache (MD5 Hash Key)
    const cacheKey = generateCacheKey(body);
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      clearTimeout(overallTimeoutId);
      return NextResponse.json({
        success: true,
        cached: true,
        data: cachedEntry.data,
      });
    }

    // Step 1: Deterministic Code Filtering (Zero-Hallucination Foundation)
    const catalog = await getLatestCatalog();
    const filterInput: CandidateFilterInput = {
      ...body.user_profile,
      gender_cut: body.user_profile.gender_cut || (body.user_profile.gender_expression?.toLowerCase() as any) || "male",
      budget_tier: body.user_profile.budget_tier || (body.user_profile.budget as any) || "$$",
      occasion: body.occasion || "pitch",
      season_of_wear: body.season_of_wear || (body.season_or_climate as any) || "fall_winter",
      flow: body.flow || "occasion",
      audience_text: body.audience_text,
      formality_target: body.formality_target,
      body_type: body.user_profile.body_type,
      size: body.user_profile.size,
      owned_item_ids: body.owned_item_ids || body.user_profile.owned_item_ids,
    };

    const filterResult = filterCandidates(catalog, filterInput);

    // Step 2: LLM Generation vs Algorithm-Only Mode (NoAI flag)
    const isNoAiRequested = Boolean(
      body.audience_text &&
      /\bno[-_\s]?ai\b/i.test(body.audience_text.trim())
    );

    let llmPayload: LLMRecommendationPayload;

    if (body.flow === "everyday") {
      // Everyday Capsule uses deterministic baseline for the single outfit payload; AI is focused on capsule curation in Step 4
      llmPayload = generateDeterministicRecommendation(filterResult, body);
      llmPayload.interpretation_summary = body.locale === "fr"
        ? "Garde-robe capsule du quotidien : 15 pièces modulaires équilibrées pour le climat canadien."
        : "Everyday Capsule Wardrobe: 15 modular foundation pieces calibrated for Canadian life.";
    } else if (isNoAiRequested) {
      console.info("⚡ User requested 'NoAI' mode: executing deterministic heuristic algorithm directly without calling any LLM models.");
      llmPayload = generateDeterministicRecommendation(filterResult, body);
      llmPayload.interpretation_summary = "Algorithm Mode: Curated directly via deterministic style, color & climate heuristics.";
    } else {
      const llmAbortController = new AbortController();
      const llmTimeoutId = setTimeout(() => llmAbortController.abort(), LLM_TIMEOUT_MS);
      try {
        const aiConfig = await getAiConfigAsync();
        const provider = aiConfig.provider || "openrouter";

        if (provider === "none") {
          console.info("⚡ AI Provider configured as 'None': utilizing deterministic heuristic stylist.");
          llmPayload = generateDeterministicRecommendation(filterResult, body);
        } else if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
          llmPayload = await callAnthropicEngine(filterResult.candidates_by_slot, body, llmAbortController.signal);
        } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
          llmPayload = await callOpenAIEngine(filterResult.candidates_by_slot, body, llmAbortController.signal);
        } else if (provider === "openrouter" && (aiConfig.openrouter_api_key || process.env.OPENROUTER_API_KEY)) {
          llmPayload = await callOpenRouterEngine(filterResult.candidates_by_slot, body, llmAbortController.signal);
        } else {
          console.warn(`Provider '${provider}' has no configured API key in .env, falling back to heuristics.`);
          llmPayload = generateDeterministicRecommendation(filterResult, body);
        }
      } catch (llmError: any) {
        console.warn("LLM unavailable or timed out, engaging deterministic stylist engine:", llmError?.message);
        llmPayload = generateDeterministicRecommendation(filterResult, body);
      } finally {
        clearTimeout(llmTimeoutId);
      }
    }

    // Step 3: Zero-Hallucination Code Validation & Scored Fallbacks
    const validCandidateIds = new Set(filterResult.all_candidate_ids);
    const slotCandidates = filterResult.candidates_by_slot;
    const selectedIds = { ...llmPayload.selected_garment_ids };
    let overrideApplied = llmPayload.override_applied || checkOccasionOverride(body.occasion || "pitch", body.user_profile.style);

    const scoringOpts = {
      targetFormality: body.formality_target || getDefaultFormalityForOccasion(body.occasion),
      targetPalette: body.user_profile?.seasonal_colour || body.user_profile?.palette_season,
      targetStyle: body.user_profile?.style || (body.user_profile?.preferred_styles && body.user_profile.preferred_styles[0]),
      targetOccasion: body.occasion,
      targetBodyType: body.user_profile?.body_type,
      targetSize: body.user_profile?.size,
      audienceText: body.audience_text,
    };

    // Validate Required Slots (top, bottom, shoes)
    const requiredSlots: GarmentSlot[] = ["top", "bottom", "shoes"];
    for (const slot of requiredSlots) {
      const currentId = selectedIds[slot];
      const isValid = currentId && validCandidateIds.has(currentId) && slotCandidates[slot]?.some((g) => g.id === currentId);

      if (!isValid) {
        const pool = slotCandidates[slot] && slotCandidates[slot].length > 0 ? slotCandidates[slot] : catalog.filter((g) => g.slot === slot);
        const fallbackGarment = rankCandidates(pool, scoringOpts)[0]?.garment;
        if (fallbackGarment) {
          selectedIds[slot] = fallbackGarment.id;
        }
      }
    }

    // Validate Layer / Outerwear
    if (selectedIds.outerwear) {
      const isValid =
        validCandidateIds.has(selectedIds.outerwear) &&
        slotCandidates.outerwear?.some((g) => g.id === selectedIds.outerwear);
      if (!isValid) {
        const pool = slotCandidates.outerwear && slotCandidates.outerwear.length > 0 ? slotCandidates.outerwear : catalog.filter((g) => g.slot === "outerwear");
        selectedIds.outerwear = rankCandidates(pool, scoringOpts)[0]?.garment?.id || null;
      }
    } else if (slotCandidates.outerwear && slotCandidates.outerwear.length > 0) {
      selectedIds.outerwear = rankCandidates(slotCandidates.outerwear, scoringOpts)[0]?.garment?.id || slotCandidates.outerwear[0].id;
    } else {
      const fallbackOuterwear = rankCandidates(catalog.filter((g) => g.slot === "outerwear"), scoringOpts)[0]?.garment;
      if (fallbackOuterwear) {
        selectedIds.outerwear = fallbackOuterwear.id;
      }
    }

    // Validate Optional Accessory
    if (selectedIds.accessory) {
      const isValid =
        validCandidateIds.has(selectedIds.accessory) &&
        slotCandidates.accessory?.some((g) => g.id === selectedIds.accessory);
      if (!isValid) {
        const pool = slotCandidates.accessory && slotCandidates.accessory.length > 0 ? slotCandidates.accessory : catalog.filter((g) => g.slot === "accessory");
        selectedIds.accessory = rankCandidates(pool, scoringOpts)[0]?.garment?.id || null;
      }
    } else if (slotCandidates.accessory && slotCandidates.accessory.length > 0) {
      selectedIds.accessory = rankCandidates(slotCandidates.accessory, scoringOpts)[0]?.garment?.id || null;
    }

    // Hydrate Full Garment Objects from Catalog
    const catalogMap = new Map(catalog.map((g) => [g.id, g]));
    const topGarment = catalogMap.get(selectedIds.top) || slotCandidates.top?.[0] || catalog.find((g) => g.slot === "top");
    const bottomGarment = catalogMap.get(selectedIds.bottom) || slotCandidates.bottom?.[0] || catalog.find((g) => g.slot === "bottom");
    const shoesGarment = catalogMap.get(selectedIds.shoes) || slotCandidates.shoes?.[0] || catalog.find((g) => g.slot === "shoes");
    const outerwearGarment = selectedIds.outerwear ? (catalogMap.get(selectedIds.outerwear) || slotCandidates.outerwear?.[0]) : undefined;
    const accessoryGarment = selectedIds.accessory ? (catalogMap.get(selectedIds.accessory) || slotCandidates.accessory?.[0]) : undefined;

    // Calculate Total Price in CAD
    const totalPrice =
      (topGarment?.price || 0) +
      (bottomGarment?.price || 0) +
      (shoesGarment?.price || 0) +
      (outerwearGarment?.price || 0) +
      (accessoryGarment?.price || 0);

    // Step 4: If Everyday Capsule flow, generate AI Capsule Editorial & Worked Looks
    let capsuleInsight: CapsuleAiData | undefined;
    if (body.flow === "everyday") {
      const gender = body.user_profile?.gender_expression || body.user_profile?.gender_cut || "unisex";
      const matchedCatalog = catalog.filter((g) => matchGender(g.gender_cut, gender as any));
      const activeCatalog = matchedCatalog.length >= 10 ? matchedCatalog : catalog;
      const capsule15 = selectBalancedCapsule15(activeCatalog, {
        targetPalette: body.user_profile?.seasonal_colour || body.user_profile?.palette_season,
        targetStyle: body.user_profile?.style || (body.user_profile?.preferred_styles && body.user_profile?.preferred_styles[0]),
        iteration: body.iteration || 0,
      });

      const aiConfig = await getAiConfigAsync();
      const capsuleAbortController = new AbortController();
      const capsuleTimeoutId = setTimeout(() => capsuleAbortController.abort(), LLM_TIMEOUT_MS);
      try {
        capsuleInsight = await generateCapsuleAiInsight(capsule15, body, aiConfig, capsuleAbortController.signal);
      } catch (e: any) {
        capsuleInsight = getHeuristicCapsuleInsight(capsule15, body);
      } finally {
        clearTimeout(capsuleTimeoutId);
      }
    }

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
      capsule: capsuleInsight,
    };

    // Store in Deterministic Cache
    cache.set(cacheKey, { timestamp: Date.now(), data: responseData });

    clearTimeout(overallTimeoutId);
    return NextResponse.json({
      success: true,
      cached: false,
      data: responseData,
    });
  } catch (err: any) {
    clearTimeout(overallTimeoutId);
    if (overallAbortController.signal.aborted || err.message === "TIMEOUT") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT_RETRY",
          message: "Recommendation generation exceeded 35 seconds. Please retry.",
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
