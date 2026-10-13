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
    badge: "Mặc định (Free)",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    description: "Tự động định tuyến các mô hình AI miễn phí qua OpenRouter. Không tốn chi phí credits.",
    provider: "openrouter",
    isDefault: true,
  },
  {
    id: "google/gemini-2.5-flash",
    name: "google/gemini-2.5-flash",
    fullName: "Google Gemini 2.5 Flash",
    badge: "Tốc độ cao & Thông minh",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: "Khuyên dùng cho Style Advisor. Tốc độ < 1s, thấu hiểu ngữ cảnh thời trang sâu sắc và chi phí siêu tiết kiệm.",
    provider: "openrouter",
    isDefault: false,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    fullName: "Anthropic Claude 3.5 Sonnet",
    badge: "Gu thẩm mỹ cao cấp",
    badgeColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    description: "Văn phong biên tập thời trang đỉnh cao, phân tích tinh tế từng chi tiết trang phục.",
    provider: "openrouter",
    isDefault: false,
  },
  {
    id: "openai/gpt-4o",
    name: "OpenAI GPT-4o",
    fullName: "OpenAI GPT-4o",
    badge: "Logic & Đa nhiệm",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    description: "Xử lý cấu trúc chuẩn xác tuyệt đối, cân bằng hoàn hảo giữa logic và sáng tạo.",
    provider: "openrouter",
    isDefault: false,
  },
];

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
