import fs from "fs";
import path from "path";

export interface AiConfig {
  selected_model: string;
  provider: "openrouter" | "openai" | "anthropic";
  openrouter_api_key?: string;
  openai_api_key?: string;
  anthropic_api_key?: string;
  updated_at?: string;
}

export interface KeyUsageStats {
  limit: number | null;
  limit_remaining: number | null;
  usage: number;
  usage_daily: number;
  usage_weekly: number;
  usage_monthly: number;
  free_daily_limit: number | null;
  free_daily_used: number;
  free_daily_remaining: number | null;
  is_free_tier: boolean;
  expires_at: string | null;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "ai-config.json");

export const DEFAULT_AI_CONFIG: AiConfig = {
  selected_model: "openrouter/free",
  provider: "openrouter",
  openrouter_api_key: "",
  updated_at: new Date().toISOString(),
};

export const AVAILABLE_AI_MODELS = [
  {
    id: "openrouter/free",
    name: "Open(Free)",
    fullName: "Open(Free) — OpenRouter Free Tier",
    badge: "Default (Free)",
    badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    description: "Automatically routes to zero-cost models. No credits consumed.",
    provider: "openrouter",
    isDefault: true,
  },
  {
    id: "google/gemini-2.5-flash",
    name: "google/gemini-2.5-flash",
    fullName: "Google Gemini 2.5 Flash",
    badge: "Fast & Recommended",
    badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    description: "Sub-second response time, deep context comprehension, ultra cost-effective (~$0.001/call).",
    provider: "openrouter",
    isDefault: false,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    fullName: "Anthropic Claude 3.5 Sonnet",
    badge: "Editorial Taste",
    badgeColor: "bg-amber-500/10 text-amber-800 border-amber-500/20",
    description: "Sophisticated styling commentary and refined Newsreader editorial prose.",
    provider: "openrouter",
    isDefault: false,
  },
  {
    id: "openai/gpt-4o",
    name: "OpenAI GPT-4o",
    fullName: "OpenAI GPT-4o",
    badge: "Structured & Multimodal",
    badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    description: "Strict schema adherence and robust reasoning for complex wardrobe rules.",
    provider: "openrouter",
    isDefault: false,
  },
];

/**
 * Checks whether AI model selection is enabled via environment variables.
 * Default: true. Set ENABLE_AI_MODEL_SELECTION=false to lock.
 */
export function isModelSelectionEnabled(): boolean {
  const envVal = process.env.ENABLE_AI_MODEL_SELECTION;
  if (envVal !== undefined && envVal !== null) {
    return envVal.trim().toLowerCase() !== "false";
  }
  return true;
}

/**
 * Reads AI config from data/ai-config.json, with env and default fallbacks.
 */
export function getAiConfig(): AiConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      const parsed = JSON.parse(fileData) as Partial<AiConfig>;
      return {
        selected_model: parsed.selected_model || "openrouter/free",
        provider: parsed.provider || "openrouter",
        openrouter_api_key: parsed.openrouter_api_key || process.env.OPENROUTER_API_KEY || "",
        openai_api_key: parsed.openai_api_key || process.env.OPENAI_API_KEY || "",
        anthropic_api_key: parsed.anthropic_api_key || process.env.ANTHROPIC_API_KEY || "",
        updated_at: parsed.updated_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("Could not read ai-config.json, falling back to defaults:", err);
  }

  return {
    ...DEFAULT_AI_CONFIG,
    openrouter_api_key: process.env.OPENROUTER_API_KEY || "",
    openai_api_key: process.env.OPENAI_API_KEY || "",
    anthropic_api_key: process.env.ANTHROPIC_API_KEY || "",
  };
}

/**
 * Saves AI config to data/ai-config.json.
 */
export function saveAiConfig(newConfig: Partial<AiConfig>): AiConfig {
  const current = getAiConfig();
  const merged: AiConfig = {
    ...current,
    ...newConfig,
    updated_at: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write ai-config.json:", err);
    throw err;
  }

  return merged;
}
