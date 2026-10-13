import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth, unauthorizedResponse } from "../../../../lib/admin-auth";
import {
  getAiConfig,
  saveAiConfig,
  AVAILABLE_AI_MODELS,
  isModelSelectionEnabled,
  KeyUsageStats,
} from "../../../../lib/ai-config";

// Standard CORS headers
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, Accept",
};

function corsJson(data: any, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers || {}),
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

function maskApiKey(key?: string): string {
  if (!key || key.trim().length === 0) return "";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 7)}...${trimmed.slice(-4)}`;
}

/**
 * Fetch live key usage stats directly from OpenRouter API
 */
async function fetchKeyStats(apiKey: string): Promise<KeyUsageStats | null> {
  if (!apiKey || apiKey.trim().length === 0) return null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (!d) return null;

    return {
      limit: typeof d.limit === "number" ? d.limit : null,
      limit_remaining: typeof d.limit_remaining === "number" ? d.limit_remaining : null,
      usage: typeof d.usage === "number" ? d.usage : 0,
      usage_daily: typeof d.usage_daily === "number" ? d.usage_daily : 0,
      usage_weekly: typeof d.usage_weekly === "number" ? d.usage_weekly : 0,
      usage_monthly: typeof d.usage_monthly === "number" ? d.usage_monthly : 0,
      free_daily_limit: d.free_model_daily_requests?.limit ?? null,
      free_daily_used: d.free_model_daily_requests?.used ?? 0,
      free_daily_remaining: d.free_model_daily_requests?.remaining ?? null,
      is_free_tier: Boolean(d.is_free_tier),
      expires_at: d.expires_at || null,
    };
  } catch (e) {
    console.warn("Could not query OpenRouter key stats:", e);
    return null;
  }
}

/**
 * GET /api/admin/ai-config
 * Retrieves current AI model configuration, available models, and live key stats.
 */
export async function GET(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const config = getAiConfig();
  const apiKey = config.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";
  const keyStats = await fetchKeyStats(apiKey);
  const modelSelectionAllowed = isModelSelectionEnabled();

  return corsJson({
    success: true,
    config: {
      selected_model: config.selected_model,
      provider: config.provider,
      openrouter_api_key_masked: maskApiKey(config.openrouter_api_key),
      has_openrouter_key: Boolean(apiKey && apiKey.trim().length > 0),
      updated_at: config.updated_at,
      model_selection_enabled: modelSelectionAllowed,
    },
    key_stats: keyStats,
    available_models: AVAILABLE_AI_MODELS,
  });
}

/**
 * POST /api/admin/ai-config
 * Save configuration or test live model connection.
 */
export async function POST(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await req.json();
    const action = body.action || "save";

    const currentConfig = getAiConfig();
    const modelSelectionAllowed = isModelSelectionEnabled();

    // Respect environment lock if model selection is disabled
    const targetModel = modelSelectionAllowed
      ? (body.selected_model || currentConfig.selected_model || "openrouter/free")
      : currentConfig.selected_model;

    const apiKey = (body.openrouter_api_key && body.openrouter_api_key.trim().length > 0)
      ? body.openrouter_api_key.trim()
      : currentConfig.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";

    if (action === "test") {
      if (!apiKey) {
        return corsJson(
          { success: false, error: "Please provide an OpenRouter API Key to test the connection." },
          { status: 400 }
        );
      }

      const startTime = Date.now();
      const testResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Style Advisor Admin Test",
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 30,
          messages: [
            { role: "system", content: "You are an assistant. Respond with 'OK'." },
            { role: "user", content: "ping" },
          ],
        }),
      });

      const latency = Date.now() - startTime;

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        return corsJson({
          success: false,
          error: `OpenRouter returned HTTP ${testResponse.status}: ${errorText}`,
          latency_ms: latency,
        });
      }

      const result = await testResponse.json();
      const reply = result.choices?.[0]?.message?.content?.trim() || "OK";

      return corsJson({
        success: true,
        latency_ms: latency,
        model_used: result.model || targetModel,
        reply,
        message: `Connected successfully to ${targetModel} in ${latency}ms!`,
      });
    }

    // Default action: save
    const updated = saveAiConfig({
      selected_model: targetModel,
      provider: "openrouter",
      ...(body.openrouter_api_key && body.openrouter_api_key.trim().length > 0
        ? { openrouter_api_key: body.openrouter_api_key.trim() }
        : {}),
    });

    const keyStats = await fetchKeyStats(updated.openrouter_api_key || process.env.OPENROUTER_API_KEY || "");

    return corsJson({
      success: true,
      message: `AI Model configuration saved: ${targetModel}`,
      config: {
        selected_model: updated.selected_model,
        provider: updated.provider,
        openrouter_api_key_masked: maskApiKey(updated.openrouter_api_key),
        has_openrouter_key: Boolean(apiKey && apiKey.trim().length > 0),
        updated_at: updated.updated_at,
        model_selection_enabled: modelSelectionAllowed,
      },
      key_stats: keyStats,
    });
  } catch (err: any) {
    return corsJson(
      { success: false, error: err.message || "Failed to process AI configuration." },
      { status: 500 }
    );
  }
}
