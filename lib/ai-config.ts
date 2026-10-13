import fs from "fs";
import path from "path";

export type AiProvider = "anthropic" | "openai" | "openrouter" | "none";

export interface AiConfig {
  selected_model: string;
  provider: AiProvider;
  openrouter_api_key?: string;
  openai_api_key?: string;
  anthropic_api_key?: string;
  updated_at?: string;
}

export interface KeyUsageStats {
  status: "active" | "error" | "not_configured";
  error?: string | null;
  message?: string | null;
  limit?: number | null;
  limit_remaining?: number | null;
  usage?: number;
  usage_daily?: number;
  usage_weekly?: number;
  usage_monthly?: number;
  free_daily_limit?: number | null;
  free_daily_used?: number;
  free_daily_remaining?: number | null;
  is_free_tier?: boolean;
  expires_at?: string | null;
}

export interface ProviderModel {
  id: string;
  name: string;
  fullName: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  provider: AiProvider;
  isDefault?: boolean;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "ai-config.json");

export const DEFAULT_AI_CONFIG: AiConfig = {
  selected_model: "openrouter/free",
  provider: "openrouter",
  openrouter_api_key: "",
  updated_at: new Date().toISOString(),
};

export const PROVIDER_MODELS: Record<AiProvider, ProviderModel[]> = {
  openrouter: [
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
  ],
  anthropic: [
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
      fullName: "Anthropic Claude 3.5 Sonnet (Latest)",
      badge: "Recommended",
      badgeColor: "bg-amber-500/10 text-amber-800 border-amber-500/20",
      description: "State-of-the-art visual styling discernment and eloquent sartorial prose.",
      provider: "anthropic",
      isDefault: true,
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      fullName: "Anthropic Claude 3.5 Haiku",
      badge: "Fast & Lightweight",
      badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      description: "Ultra-fast response latency with crisp styling execution.",
      provider: "anthropic",
      isDefault: false,
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      fullName: "Anthropic Claude 3 Opus",
      badge: "Deep Reasoning",
      badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      description: "Complex aesthetic synthesis for rigorous multi-scenario dress codes.",
      provider: "anthropic",
      isDefault: false,
    },
  ],
  openai: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      fullName: "OpenAI GPT-4o (Omni)",
      badge: "Recommended",
      badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      description: "Fast multimodal reasoning and reliable JSON schema enforcement.",
      provider: "openai",
      isDefault: true,
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      fullName: "OpenAI GPT-4o Mini",
      badge: "Fast & Economical",
      badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      description: "Extremely cost-effective and swift styling responses.",
      provider: "openai",
      isDefault: false,
    },
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      fullName: "OpenAI GPT-4 Turbo",
      badge: "Standard",
      badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      description: "High-capability reasoning for complex wardrobe rule evaluations.",
      provider: "openai",
      isDefault: false,
    },
  ],
  none: [
    {
      id: "none",
      name: "Deterministic Rules (No LLM)",
      fullName: "Deterministic Heuristic Engine (No LLM)",
      badge: "Offline / Rule-Based",
      badgeColor: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      description: "Pure deterministic scoring algorithms based on color theory, climate, and body type without LLM calls.",
      provider: "none",
      isDefault: true,
    },
  ],
};

// Backwards compatibility alias
export const AVAILABLE_AI_MODELS = PROVIDER_MODELS.openrouter;

/**
 * Mask an API key for safe presentation in UI
 */
export function maskApiKey(key?: string): string {
  if (!key || key.trim().length === 0) return "";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 8)}...${trimmed.slice(-4)}`;
}

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
      const provider = (parsed.provider as AiProvider) || "openrouter";
      return {
        selected_model: parsed.selected_model || (PROVIDER_MODELS[provider]?.[0]?.id ?? "openrouter/free"),
        provider,
        openrouter_api_key: process.env.OPENROUTER_API_KEY || "",
        openai_api_key: process.env.OPENAI_API_KEY || "",
        anthropic_api_key: process.env.ANTHROPIC_API_KEY || "",
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
    // Only persist selected_model and provider in ai-config.json (keys stay in .env)
    const toSave = {
      provider: merged.provider,
      selected_model: merged.selected_model,
      updated_at: merged.updated_at,
    };
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(toSave, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write ai-config.json:", err);
    throw err;
  }

  return merged;
}
