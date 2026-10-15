import { NextRequest, NextResponse } from "next/server";

const CURRENT_EXTENSION_VERSION = "1.0.5";
const MIN_SUPPORTED_EXTENSION_VERSION = "1.0.5";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Client-Version, X-Client-Tool, Accept",
  "Access-Control-Expose-Headers": "X-Server-Version, X-Min-Extension-Version",
  "X-Server-Version": CURRENT_EXTENSION_VERSION,
  "X-Min-Extension-Version": MIN_SUPPORTED_EXTENSION_VERSION,
};

/**
 * OPTIONS /api/admin/version
 * Preflight CORS handler exposing version governance headers
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/admin/version
 * Returns active API & Extension version governance policy
 */
export async function GET(req: NextRequest) {
  const clientVersion = req.headers.get("x-client-version") || "";
  const clientTool = req.headers.get("x-client-tool") || "";

  return NextResponse.json(
    {
      success: true,
      service: "Style Advisor Extension Governance API",
      latest_version: CURRENT_EXTENSION_VERSION,
      min_version: MIN_SUPPORTED_EXTENSION_VERSION,
      client_info: {
        detected_version: clientVersion || "unknown",
        tool: clientTool || "unknown",
        is_supported: clientVersion ? clientVersion >= MIN_SUPPORTED_EXTENSION_VERSION : true,
      },
      download_url: "/admin",
      release_notes: "Version 1.0.5 introduces precision decimal pricing, smart gender/cut detection, and version governance auto-locking.",
      server_time: new Date().toISOString(),
    },
    {
      status: 200,
      headers: CORS_HEADERS,
    }
  );
}
