import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  Garment,
  GarmentSlot,
  GenderCut,
  BudgetTier,
  Occasion,
  PaletteSeason,
  BodyType,
  SeasonOfWear,
} from "../../../../types/catalog";
import { validateAdminAuth, unauthorizedResponse } from "../../../../lib/admin-auth";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

// CORS Headers for Chrome Extension & local dev access
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, Accept",
};

/**
 * Helper to return JSON with standard CORS headers
 */
function corsJson(data: any, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers || {}),
    },
  });
}

/**
 * OPTIONS /api/admin/catalog
 * Browser preflight CORS check
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

/**
 * Helper to read catalog from disk
 */
async function readCatalog(): Promise<Garment[]> {
  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf-8");
    return JSON.parse(raw) as Garment[];
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

/**
 * Helper to write catalog to disk
 */
async function writeCatalog(garments: Garment[]): Promise<void> {
  await fs.writeFile(CATALOG_PATH, JSON.stringify(garments, null, 2), "utf-8");
}

/**
 * Helper to normalize and auto-detect wardrobe slot if missing or invalid
 */
function normalizeSlot(slot?: string, name?: string, url?: string): GarmentSlot {
  if (slot) {
    const s = slot.toLowerCase().trim();
    if (["outerwear", "top", "bottom", "shoes", "accessory"].includes(s)) {
      return s as GarmentSlot;
    }
  }

  const text = `${name || ""} ${url || ""}`.toLowerCase();
  if (/\b(sneaker|shoe|shoes|boot|boots|loafer|loafers|heel|heels|oxford shoe|runner|runners|footwear|sandal|sandals|slip-on|cityscape)\b/.test(text)) {
    return "shoes";
  }
  if (/\b(blazer|overcoat|coat|jacket|parka|trench|cardigan|fleece|vest|windbreaker|puffer|bomber|outerwear|suit jacket)\b/.test(text)) {
    return "outerwear";
  }
  if (/\b(pant|pants|trouser|trousers|denim|jean|jeans|skirt|short|shorts|chino|chinos|legging|leggings|jogger|joggers|slacks|bottom)\b/.test(text)) {
    return "bottom";
  }
  if (/\b(scarf|scarves|bag|bags|belt|belts|hat|hats|tie|ties|beanie|sunglasses|accessory|watch|wallet|cap|glove|gloves|sock|socks)\b/.test(text)) {
    return "accessory";
  }
  return "top";
}

/**
 * Helper to normalize budget tier from CAD price
 */
function normalizeBudgetTier(price: number, tier?: string): BudgetTier {
  if (tier && ["budget", "mid", "premium", "luxury"].includes(tier.toLowerCase())) {
    return tier.toLowerCase() as BudgetTier;
  }
  if (price < 75) return "budget";
  if (price <= 180) return "mid";
  if (price <= 350) return "premium";
  return "luxury";
}

/**
 * GET /api/admin/catalog
 * Returns full list of garments with CORS headers
 */
export async function GET(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse("Unauthorized: Valid ADMIN_INGEST_API_KEY is required to access the catalog.");
  }

  try {
    const garments = await readCatalog();
    return corsJson({
      success: true,
      count: garments.length,
      data: garments,
    });
  } catch (err: any) {
    return corsJson(
      { success: false, error: "READ_ERROR", message: err.message || "Failed to load catalog." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/catalog
 * Creates a new garment or updates an existing one (Direct Ingest from Chrome Extension & Admin UI)
 */
export async function POST(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse("Unauthorized: Valid ADMIN_INGEST_API_KEY is required to save or ingest garments.");
  }

  try {
    const body = (await req.json()) as any;

    // Validate minimum required fields
    const name = (body.name || body.title || "").trim();
    const brand = (body.brand || body.vendor || "Canadian Brand").trim();
    const rawPrice = body.price !== undefined ? parseFloat(String(body.price).replace(/[^0-9.]/g, "")) : undefined;

    if (!name) {
      return corsJson(
        {
          success: false,
          error: "VALIDATION_FAILED",
          message: "Product 'name' is required.",
        },
        { status: 400 }
      );
    }

    const price = rawPrice !== undefined && !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 120;
    const slot = normalizeSlot(body.slot, name, body.product_url || body.url);
    const productUrl = (body.product_url || body.url || body.link || "").trim();
    const imageUrl = (body.image_url || body.image || body.img || "").trim();

    // Auto-generate deterministic or extension ID if missing
    let id = (body.id || body.garment_id || "").trim();
    if (!id) {
      const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 15);
      const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
      const timestamp = Date.now().toString().slice(-4);
      id = `ca_${brandSlug}_${nameSlug}_${timestamp}`;
    }

    // Gender cut detection & fallback
    let gender_cut: GenderCut = "unisex";
    const genderText = `${name} ${productUrl} ${body.gender_cut || body.gender || ""}`.toLowerCase();
    if (/\b(women|womens|women's|female|lady|ladies|dress|blouse|skirt|high-rise|high rise|bra|align)\b/.test(genderText)) {
      gender_cut = "women";
    } else if (/\b(men|mens|men's|male|gentleman|abc pant|commission)\b/.test(genderText)) {
      gender_cut = "men";
    }

    const budget_tier = normalizeBudgetTier(price, body.budget_tier);
    const formality_score = Number(body.formality_score) || (slot === "outerwear" ? 8 : slot === "bottom" ? 7 : 6);

    const verifiedDate = body.verified_date?.trim() || new Date().toISOString().split("T")[0];

    const validatedGarment: Garment = {
      id,
      name,
      brand,
      slot,
      price,
      currency: "CAD",
      product_url: productUrl,
      image_url: imageUrl,
      gender_cut,
      budget_tier,
      occasions: Array.isArray(body.occasions) && body.occasions.length > 0
        ? (body.occasions as Occasion[])
        : ["work", "smart-casual", "casual"],
      palette_seasons: Array.isArray(body.palette_seasons) && body.palette_seasons.length > 0
        ? (body.palette_seasons as PaletteSeason[])
        : ["autumn", "winter"],
      body_types: Array.isArray(body.body_types) && body.body_types.length > 0
        ? (body.body_types as BodyType[])
        : ["average", "athletic"],
      season_of_wear: Array.isArray(body.season_of_wear) && body.season_of_wear.length > 0
        ? (body.season_of_wear as SeasonOfWear[])
        : ["all-season", "fall"],
      formality_score,
      color: body.color?.trim() || "Classic",
      hex_color: body.hex_color?.trim() || "#2C2C2C",
      fabric: {
        composition: body.fabric?.composition?.trim() || body.fabric_composition?.trim() || "100% Quality Fabric",
        weave: body.fabric?.weave?.trim(),
        care: body.fabric?.care?.trim() || body.fabric_care?.trim() || "Machine wash cold. Hang dry.",
        sustainable: Boolean(body.fabric?.sustainable ?? body.sustainable),
      },
      return_policy: {
        window_days: Number(body.return_policy?.window_days) || 30,
        free_returns: body.return_policy?.free_returns !== undefined ? Boolean(body.return_policy.free_returns) : true,
        policy_note: body.return_policy?.policy_note?.trim() || `Free returns and exchanges within 30 days at ${brand}.`,
      },
      description: body.description?.trim() || `Crafted by ${brand} for refined wardrobe versatility in Canadian climates.`,
      styling_notes: body.styling_notes?.trim() || "Pairs seamlessly with tailored foundation pieces.",
      in_stock: body.in_stock !== undefined ? Boolean(body.in_stock) : true,
      verified_date: verifiedDate,
    };

    const garments = await readCatalog();
    const existingIndex = garments.findIndex((g) => g.id === validatedGarment.id || (productUrl && g.product_url === productUrl));

    let isUpdate = false;
    if (existingIndex >= 0) {
      // Keep existing ID if matching by product_url
      validatedGarment.id = garments[existingIndex].id;
      garments[existingIndex] = validatedGarment;
      isUpdate = true;
    } else {
      // Prepend newly ingested garment to the top of the catalog
      garments.unshift(validatedGarment);
    }

    await writeCatalog(garments);

    return corsJson({
      success: true,
      isUpdate,
      message: isUpdate
        ? `Garment "${validatedGarment.name}" updated successfully.`
        : `Garment "${validatedGarment.name}" successfully ingested into catalog.`,
      garment: validatedGarment,
      count: garments.length,
    });
  } catch (err: any) {
    console.error("POST /api/admin/catalog error:", err);
    return corsJson(
      { success: false, error: "SAVE_ERROR", message: err.message || "Failed to save garment to catalog." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/catalog
 * Removes a garment by ID with CORS headers
 */
export async function DELETE(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse("Unauthorized: Valid ADMIN_INGEST_API_KEY is required to delete garments.");
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id") || searchParams.get("garment_id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id || body.garment_id;
      } catch {
        // Body might be empty
      }
    }

    if (!id) {
      return corsJson(
        { success: false, error: "MISSING_ID", message: "Garment ID is required for deletion." },
        { status: 400 }
      );
    }

    const garments = await readCatalog();
    const initialCount = garments.length;
    const filtered = garments.filter((g) => g.id !== id);

    if (filtered.length === initialCount) {
      return corsJson(
        { success: false, error: "NOT_FOUND", message: `Garment with ID "${id}" was not found.` },
        { status: 404 }
      );
    }

    await writeCatalog(filtered);

    return corsJson({
      success: true,
      message: `Garment "${id}" removed from catalog.`,
      deleted_id: id,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/catalog error:", err);
    return corsJson(
      { success: false, error: "DELETE_ERROR", message: err.message || "Failed to delete garment." },
      { status: 500 }
    );
  }
}

