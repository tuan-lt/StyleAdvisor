import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Garment } from "../../../../types/catalog";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

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
 * GET /api/admin/catalog
 * Returns full list of garments
 */
export async function GET() {
  try {
    const garments = await readCatalog();
    return NextResponse.json({
      success: true,
      count: garments.length,
      data: garments,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "READ_ERROR", message: err.message || "Failed to load catalog." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/catalog
 * Creates a new garment or updates an existing one
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Garment>;

    // Basic Schema Validation
    if (!body.name || !body.brand || !body.slot || body.price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_FAILED",
          message: "Name, Brand, Slot, and Price (CAD) are required fields.",
        },
        { status: 400 }
      );
    }

    if (!body.product_url || !body.image_url) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_FAILED",
          message: "Retailer Product URL and Image URL are required.",
        },
        { status: 400 }
      );
    }

    // Auto-generate ID if missing
    let id = body.id?.trim();
    if (!id) {
      const brandSlug = body.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const nameSlug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      id = `${brandSlug}-${nameSlug}-${Date.now().toString().slice(-4)}`;
    }

    const validatedGarment: Garment = {
      id,
      name: body.name.trim(),
      brand: body.brand.trim(),
      slot: body.slot,
      price: Number(body.price),
      currency: "CAD",
      product_url: body.product_url.trim(),
      image_url: body.image_url.trim(),
      gender_cut: body.gender_cut || "unisex",
      budget_tier: body.budget_tier || "mid",
      occasions: Array.isArray(body.occasions) && body.occasions.length > 0 ? body.occasions : ["casual"],
      palette_seasons: Array.isArray(body.palette_seasons) ? body.palette_seasons : ["autumn"],
      body_types: Array.isArray(body.body_types) ? body.body_types : ["average"],
      season_of_wear: Array.isArray(body.season_of_wear) && body.season_of_wear.length > 0 ? body.season_of_wear : ["all-season"],
      formality_score: Number(body.formality_score) || 7,
      color: body.color?.trim() || "Classic",
      hex_color: body.hex_color?.trim() || "#2C2C2C",
      fabric: {
        composition: body.fabric?.composition?.trim() || "100% Quality Fabric",
        weave: body.fabric?.weave?.trim(),
        care: body.fabric?.care?.trim() || "Machine wash cold or dry clean.",
        sustainable: Boolean(body.fabric?.sustainable),
      },
      return_policy: {
        window_days: Number(body.return_policy?.window_days) || 30,
        free_returns: Boolean(body.return_policy?.free_returns),
        policy_note: body.return_policy?.policy_note?.trim() || "Standard retailer return policy.",
      },
      description: body.description?.trim() || "",
      styling_notes: body.styling_notes?.trim() || "",
      in_stock: body.in_stock !== undefined ? Boolean(body.in_stock) : true,
    };

    const garments = await readCatalog();
    const existingIndex = garments.findIndex((g) => g.id === validatedGarment.id);

    let isUpdate = false;
    if (existingIndex >= 0) {
      garments[existingIndex] = validatedGarment;
      isUpdate = true;
    } else {
      garments.push(validatedGarment);
    }

    await writeCatalog(garments);

    return NextResponse.json({
      success: true,
      isUpdate,
      message: isUpdate
        ? `Garment "${validatedGarment.name}" updated successfully.`
        : `Garment "${validatedGarment.name}" added to catalog.`,
      garment: validatedGarment,
    });
  } catch (err: any) {
    console.error("POST /api/admin/catalog error:", err);
    return NextResponse.json(
      { success: false, error: "SAVE_ERROR", message: err.message || "Failed to save garment to catalog." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/catalog
 * Removes a garment by ID
 */
export async function DELETE(req: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: "MISSING_ID", message: "Garment ID is required for deletion." },
        { status: 400 }
      );
    }

    const garments = await readCatalog();
    const initialCount = garments.length;
    const filtered = garments.filter((g) => g.id !== id);

    if (filtered.length === initialCount) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: `Garment with ID "${id}" was not found.` },
        { status: 404 }
      );
    }

    await writeCatalog(filtered);

    return NextResponse.json({
      success: true,
      message: `Garment "${id}" removed from catalog.`,
      deleted_id: id,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/catalog error:", err);
    return NextResponse.json(
      { success: false, error: "DELETE_ERROR", message: err.message || "Failed to delete garment." },
      { status: 500 }
    );
  }
}
