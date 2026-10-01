import { GarmentSlot } from "../types/catalog";

// Precise slot detection regexes based strictly on clothing nomenclature
const BOTTOM_REGEX = /\b(pant|pants|trouser|trousers|jean|jeans|denim|chino|chinos|jogger|joggers|sweatpant|sweatpants|short|shorts|skirt|skirts|legging|leggings|slacks|tights|culotte|culottes)\b/i;

const SHOES_REGEX = /\b(shoe|shoes|sneaker|sneakers|boot|boots|loafer|loafers|heel|heels|oxford|oxfords|derby|derbies|sandal|sandals|runner|runners|mule|mules|slipper|slippers|espadrille|espadrilles|footwear|chelsea boot|combat boot)\b/i;

const OUTERWEAR_REGEX = /\b(jacket|jackets|coat|coats|blazer|blazers|parka|parkas|trench|trenchcoat|puffer|puffers|anorak|anoraks|overcoat|overcoats|windbreaker|windbreakers|vest|vests|bomber|bombers|cardigan|cardigans|overshirt|overshirts|outerwear|peacoat|raincoat|shacket)\b/i;

const ACCESSORY_REGEX = /\b(belt|belts|bag|bags|tote|totes|backpack|backpacks|wallet|wallets|scarf|scarves|hat|hats|cap|caps|beanie|beanies|tie|ties|bowtie|sunglasses|sunglass|eyewear|glove|gloves|mitten|mittens|sock|socks|watch|watches)\b/i;

const TOP_REGEX = /\b(shirt|shirts|tee|tees|t-shirt|t-shirts|polo|polos|sweater|sweaters|knit|knits|crewneck|turtleneck|hoodie|hoodies|sweatshirt|sweatshirts|blouse|blouses|tank|tanks|top|tops|henley|henleys|longsleeve|camisole|cami|tunic)\b/i;

/**
 * Detect slot from product title with highest priority, falling back to URL and description.
 */
export function detectSlotFromText(name: string, description: string = "", url: string = ""): GarmentSlot {
  const cleanName = (name || "").trim().toLowerCase();

  // 1. PRIMARY EVALUATION: Product Title (Highest semantic accuracy)
  if (BOTTOM_REGEX.test(cleanName)) return "bottom";
  if (SHOES_REGEX.test(cleanName)) return "shoes";
  if (OUTERWEAR_REGEX.test(cleanName)) return "outerwear";
  if (ACCESSORY_REGEX.test(cleanName)) return "accessory";
  if (TOP_REGEX.test(cleanName)) return "top";

  // 2. SECONDARY EVALUATION: URL Path segments (e.g. /clothing/mens-pants/)
  const cleanUrl = (url || "").toLowerCase();
  if (BOTTOM_REGEX.test(cleanUrl)) return "bottom";
  if (SHOES_REGEX.test(cleanUrl)) return "shoes";
  if (OUTERWEAR_REGEX.test(cleanUrl)) return "outerwear";
  if (ACCESSORY_REGEX.test(cleanUrl)) return "accessory";
  if (TOP_REGEX.test(cleanUrl)) return "top";

  // 3. TERTIARY EVALUATION: Description body (fallback only)
  const cleanDesc = (description || "").toLowerCase();
  if (BOTTOM_REGEX.test(cleanDesc)) return "bottom";
  if (SHOES_REGEX.test(cleanDesc)) return "shoes";
  if (OUTERWEAR_REGEX.test(cleanDesc)) return "outerwear";
  if (ACCESSORY_REGEX.test(cleanDesc)) return "accessory";
  if (TOP_REGEX.test(cleanDesc)) return "top";

  return "top"; // Safe default
}

/**
 * Slot Auto-Validation Guard for Ingestion / Scraper Pipeline
 * Validates proposed slot against garment name to prevent cross-slot corruptions.
 */
export function validateAndEnforceSlot(
  proposedSlot: string | undefined,
  name: string,
  description: string = "",
  url: string = ""
): {
  slot: GarmentSlot;
  wasCorrected: boolean;
  originalSlot?: string;
  reason?: string;
} {
  const cleanName = (name || "").trim().toLowerCase();
  const rawSlot = (proposedSlot || "").trim().toLowerCase();

  // Check title conflicts directly
  const titleHasBottom = BOTTOM_REGEX.test(cleanName);
  const titleHasShoes = SHOES_REGEX.test(cleanName);
  const titleHasOuterwear = OUTERWEAR_REGEX.test(cleanName);
  const titleHasAccessory = ACCESSORY_REGEX.test(cleanName);
  const titleHasTop = TOP_REGEX.test(cleanName);

  // RULE 1: Pants/Shorts/Jeans can NEVER be outerwear, shoes, tops, or accessories
  if (titleHasBottom && rawSlot !== "bottom") {
    return {
      slot: "bottom",
      wasCorrected: true,
      originalSlot: rawSlot,
      reason: `Corrected "${rawSlot}" -> "bottom": title "${name}" explicitly contains bottom keywords.`,
    };
  }

  // RULE 2: Blazers/Jackets/Coats can NEVER be top or bottom
  if (titleHasOuterwear && !titleHasBottom && rawSlot !== "outerwear") {
    return {
      slot: "outerwear",
      wasCorrected: true,
      originalSlot: rawSlot,
      reason: `Corrected "${rawSlot}" -> "outerwear": title "${name}" explicitly contains outerwear keywords.`,
    };
  }

  // RULE 3: Shoes/Sneakers/Boots can NEVER be bottom or top
  if (titleHasShoes && rawSlot !== "shoes") {
    return {
      slot: "shoes",
      wasCorrected: true,
      originalSlot: rawSlot,
      reason: `Corrected "${rawSlot}" -> "shoes": title "${name}" explicitly contains footwear keywords.`,
    };
  }

  // RULE 4: Belts/Bags/Hats can NEVER be tops, bottoms, or outerwear
  if (titleHasAccessory && rawSlot !== "accessory") {
    return {
      slot: "accessory",
      wasCorrected: true,
      originalSlot: rawSlot,
      reason: `Corrected "${rawSlot}" -> "accessory": title "${name}" explicitly contains accessory keywords.`,
    };
  }

  // RULE 5: Polos/T-shirts/Sweaters with no outerwear/bottom words cannot be bottom/shoes/outerwear
  if (titleHasTop && !titleHasOuterwear && !titleHasBottom && !titleHasShoes && !titleHasAccessory && rawSlot !== "top") {
    return {
      slot: "top",
      wasCorrected: true,
      originalSlot: rawSlot,
      reason: `Corrected "${rawSlot}" -> "top": title "${name}" explicitly contains top/knit keywords.`,
    };
  }

  // If valid existing slot matches schema and has no conflicts, preserve it
  if (["outerwear", "top", "bottom", "shoes", "accessory"].includes(rawSlot)) {
    return {
      slot: rawSlot as GarmentSlot,
      wasCorrected: false,
    };
  }

  // If invalid or missing, run full fallback detector
  const detected = detectSlotFromText(name, description, url);
  return {
    slot: detected,
    wasCorrected: true,
    originalSlot: rawSlot,
    reason: `Auto-detected slot "${detected}" from text metadata.`,
  };
}
