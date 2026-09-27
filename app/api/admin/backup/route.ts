import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth, unauthorizedResponse } from "../../../../lib/admin-auth";
import { getAllGarmentsFromDb, generateSqlDump, executeRawSql } from "../../../../lib/db";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/admin/backup
 * Downloads full PostgreSQL SQL backup dump
 */
export async function GET(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse("Unauthorized: Valid ADMIN_INGEST_API_KEY is required to download backups.");
  }

  try {
    const garments = await getAllGarmentsFromDb();
    const sqlDump = generateSqlDump(garments);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `style-advisor-postgres-backup-${dateStr}.sql`;

    return new NextResponse(sqlDump, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/backup error:", err);
    return NextResponse.json(
      { success: false, error: "BACKUP_ERROR", message: err.message || "Failed to generate database backup." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST /api/admin/backup
 * Restores database from an uploaded SQL backup script
 */
export async function POST(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse("Unauthorized: Valid ADMIN_INGEST_API_KEY is required to restore database.");
  }

  try {
    const sqlScript = await req.text();
    if (!sqlScript || !sqlScript.trim()) {
      return NextResponse.json(
        { success: false, error: "EMPTY_SQL", message: "SQL backup content cannot be empty." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await executeRawSql(sqlScript);
    const garments = await getAllGarmentsFromDb();

    return NextResponse.json(
      {
        success: true,
        message: `Database restored successfully. Total records: ${garments.length}`,
        count: garments.length,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("POST /api/admin/backup restore error:", err);
    return NextResponse.json(
      { success: false, error: "RESTORE_ERROR", message: err.message || "Failed to execute SQL backup." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
