import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth, unauthorizedResponse } from "../../../../lib/admin-auth";
import { getAiConfig, saveAiConfig, AVAILABLE_AI_MODELS } from "../../../../lib/ai-config";

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
 * GET /api/admin/ai-config
 * Retrieves current AI model configuration and available models.
 */
export async function GET(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const config = getAiConfig();

  return corsJson({
    success: true,
    config: {
      selected_model: config.selected_model,
      provider: config.provider,
      openrouter_api_key_masked: maskApiKey(config.openrouter_api_key),
      has_openrouter_key: Boolean(config.openrouter_api_key && config.openrouter_api_key.trim().length > 0),
      updated_at: config.updated_at,
    },
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
    const targetModel = body.selected_model || currentConfig.selected_model || "openrouter/free";
    const apiKey = (body.openrouter_api_key && body.openrouter_api_key.trim().length > 0)
      ? body.openrouter_api_key.trim()
      : currentConfig.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";

    if (action === "test") {
      if (!apiKey) {
        return corsJson(
          { success: false, error: "Vui lòng nhập OpenRouter API Key để kiểm tra kết nối." },
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
          max_tokens: 50,
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
          error: `OpenRouter trả về mã lỗi ${testResponse.status}: ${errorText}`,
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
        message: `Kết nối thành công tới ${targetModel} (${latency}ms)!`,
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

    return corsJson({
      success: true,
      message: `Đã lưu cấu hình AI Model: ${targetModel}`,
      config: {
        selected_model: updated.selected_model,
        provider: updated.provider,
        openrouter_api_key_masked: maskApiKey(updated.openrouter_api_key),
        has_openrouter_key: Boolean(updated.openrouter_api_key && updated.openrouter_api_key.trim().length > 0),
        updated_at: updated.updated_at,
      },
    });
  } catch (err: any) {
    return corsJson(
      { success: false, error: err.message || "Failed to process AI configuration." },
      { status: 500 }
    );
  }
}
