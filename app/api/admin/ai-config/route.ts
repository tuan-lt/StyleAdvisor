import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth, unauthorizedResponse } from "../../../../lib/admin-auth";
import {
  getAiConfig,
  saveAiConfig,
  PROVIDER_MODELS,
  isModelSelectionEnabled,
  maskApiKey,
  AiProvider,
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

/**
 * Fetch live key usage stats directly from OpenRouter API
 */
async function fetchOpenRouterStats(apiKey: string): Promise<KeyUsageStats> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { status: "not_configured", error: "OPENROUTER_API_KEY is not configured in .env" };
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      let errDetail = `OpenRouter returned HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.error?.message) {
          errDetail = errJson.error.message;
        }
      } catch (_) {}
      return {
        status: "error",
        error: `API Key Error: ${errDetail}`,
      };
    }

    const json = await res.json();
    const d = json?.data;
    if (!d) {
      return { status: "error", error: "API Key Error: Invalid response format from OpenRouter." };
    }

    return {
      status: "active",
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
  } catch (e: any) {
    return {
      status: "error",
      error: `API Key Connection Error: ${e?.message || "Failed to query OpenRouter"}`,
    };
  }
}

/**
 * Validate OpenAI key
 */
async function validateOpenAiKey(apiKey: string): Promise<KeyUsageStats> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { status: "not_configured", error: "OPENAI_API_KEY is not configured in .env" };
  }
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      let errMsg = `OpenAI returned HTTP ${res.status}`;
      try {
        const json = await res.json();
        if (json?.error?.message) {
          errMsg = json.error.message;
        }
      } catch (_) {}
      return {
        status: "error",
        error: `API Key Error: ${errMsg}`,
      };
    }

    return {
      status: "active",
      message: "OpenAI API Key is valid and authorized for production requests.",
    };
  } catch (e: any) {
    return {
      status: "error",
      error: `API Key Connection Error: ${e?.message || "Failed to reach OpenAI"}`,
    };
  }
}

/**
 * Validate Anthropic key
 */
async function validateAnthropicKey(apiKey: string): Promise<KeyUsageStats> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { status: "not_configured", error: "ANTHROPIC_API_KEY is not configured in .env" };
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey.trim(),
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      let errMsg = `Anthropic returned HTTP ${res.status}`;
      try {
        const json = await res.json();
        if (json?.error?.message) {
          errMsg = json.error.message;
        }
      } catch (_) {}
      return {
        status: "error",
        error: `API Key Error: ${errMsg}`,
      };
    }

    return {
      status: "active",
      message: "Anthropic API Key is valid and authorized for production requests.",
    };
  } catch (e: any) {
    return {
      status: "error",
      error: `API Key Connection Error: ${e?.message || "Failed to reach Anthropic"}`,
    };
  }
}

/**
 * GET /api/admin/ai-config
 */
export async function GET(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const config = getAiConfig();
  const modelSelectionAllowed = isModelSelectionEnabled();

  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim() || "";
  const openaiKey = process.env.OPENAI_API_KEY?.trim() || "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim() || "";

  // Fetch status in parallel
  const [openrouterStats, openaiStats, anthropicStats] = await Promise.all([
    openrouterKey ? fetchOpenRouterStats(openrouterKey) : Promise.resolve<KeyUsageStats>({ status: "not_configured", error: "OPENROUTER_API_KEY is not configured in .env" }),
    openaiKey ? validateOpenAiKey(openaiKey) : Promise.resolve<KeyUsageStats>({ status: "not_configured", error: "OPENAI_API_KEY is not configured in .env" }),
    anthropicKey ? validateAnthropicKey(anthropicKey) : Promise.resolve<KeyUsageStats>({ status: "not_configured", error: "ANTHROPIC_API_KEY is not configured in .env" }),
  ]);

  const providers = {
    anthropic: {
      id: "anthropic" as AiProvider,
      name: "ANTHROPIC",
      enabled: Boolean(anthropicKey),
      masked_key: maskApiKey(anthropicKey),
      models: PROVIDER_MODELS.anthropic,
      key_stats: anthropicStats,
    },
    openai: {
      id: "openai" as AiProvider,
      name: "OPENAI",
      enabled: Boolean(openaiKey),
      masked_key: maskApiKey(openaiKey),
      models: PROVIDER_MODELS.openai,
      key_stats: openaiStats,
    },
    openrouter: {
      id: "openrouter" as AiProvider,
      name: "OPENROUTE", // As requested by user
      enabled: Boolean(openrouterKey),
      masked_key: maskApiKey(openrouterKey),
      models: PROVIDER_MODELS.openrouter,
      key_stats: openrouterStats,
    },
    none: {
      id: "none" as AiProvider,
      name: "None",
      enabled: true,
      masked_key: "None (Local Execution)",
      models: PROVIDER_MODELS.none,
      key_stats: {
        status: "active" as const,
        message: "Deterministic Heuristic Engine: Zero external API calls required. Operates offline at zero cost.",
      },
    },
  };

  return corsJson({
    success: true,
    config: {
      provider: config.provider,
      selected_model: config.selected_model,
      updated_at: config.updated_at,
      model_selection_enabled: modelSelectionAllowed,
    },
    providers,
  });
}

/**
 * POST /api/admin/ai-config
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

    const targetProvider: AiProvider = (body.provider as AiProvider) || currentConfig.provider || "openrouter";
    const targetModel = modelSelectionAllowed
      ? (body.selected_model || currentConfig.selected_model || PROVIDER_MODELS[targetProvider]?.[0]?.id || "none")
      : currentConfig.selected_model;

    if (action === "test") {
      const startTime = Date.now();

      if (targetProvider === "none") {
        return corsJson({
          success: true,
          latency_ms: 1,
          model_used: "deterministic_rules",
          message: "Local Deterministic Heuristic Engine is ready and fully operational.",
        });
      }

      if (targetProvider === "openrouter") {
        const apiKey = process.env.OPENROUTER_API_KEY?.trim();
        if (!apiKey) {
          return corsJson({ success: false, error: "OPENROUTER_API_KEY is not set in .env" }, { status: 400 });
        }
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Style Advisor Admin Test",
          },
          body: JSON.stringify({
            model: targetModel,
            max_tokens: 20,
            messages: [{ role: "user", content: "ping" }],
          }),
        });
        const latency = Date.now() - startTime;
        if (!res.ok) {
          const errText = await res.text();
          return corsJson({
            success: false,
            error: `OpenRouter returned HTTP ${res.status}: ${errText}`,
            latency_ms: latency,
          });
        }
        return corsJson({
          success: true,
          latency_ms: latency,
          model_used: targetModel,
          message: `Connected successfully to OpenRouter (${targetModel}) in ${latency}ms!`,
        });
      }

      if (targetProvider === "openai") {
        const apiKey = process.env.OPENAI_API_KEY?.trim();
        if (!apiKey) {
          return corsJson({ success: false, error: "OPENAI_API_KEY is not set in .env" }, { status: 400 });
        }
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: targetModel === "custom" ? "gpt-4o" : targetModel,
            max_tokens: 20,
            messages: [{ role: "user", content: "ping" }],
          }),
        });
        const latency = Date.now() - startTime;
        if (!res.ok) {
          const errText = await res.text();
          return corsJson({
            success: false,
            error: `OpenAI returned HTTP ${res.status}: ${errText}`,
            latency_ms: latency,
          });
        }
        return corsJson({
          success: true,
          latency_ms: latency,
          model_used: targetModel,
          message: `Connected successfully to OpenAI (${targetModel}) in ${latency}ms!`,
        });
      }

      if (targetProvider === "anthropic") {
        const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
        if (!apiKey) {
          return corsJson({ success: false, error: "ANTHROPIC_API_KEY is not set in .env" }, { status: 400 });
        }
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: targetModel === "custom" ? "claude-3-5-sonnet-20241022" : targetModel,
            max_tokens: 20,
            messages: [{ role: "user", content: "ping" }],
          }),
        });
        const latency = Date.now() - startTime;
        if (!res.ok) {
          const errText = await res.text();
          return corsJson({
            success: false,
            error: `Anthropic returned HTTP ${res.status}: ${errText}`,
            latency_ms: latency,
          });
        }
        return corsJson({
          success: true,
          latency_ms: latency,
          model_used: targetModel,
          message: `Connected successfully to Anthropic (${targetModel}) in ${latency}ms!`,
        });
      }
    }

    // Default action: save
    const updated = saveAiConfig({
      provider: targetProvider,
      selected_model: targetModel,
    });

    return corsJson({
      success: true,
      message: `AI configuration saved: ${targetProvider} (${targetModel})`,
      config: {
        provider: updated.provider,
        selected_model: updated.selected_model,
        updated_at: updated.updated_at,
        model_selection_enabled: modelSelectionAllowed,
      },
    });
  } catch (err: any) {
    return corsJson(
      { success: false, error: err.message || "Failed to process AI configuration." },
      { status: 500 }
    );
  }
}
