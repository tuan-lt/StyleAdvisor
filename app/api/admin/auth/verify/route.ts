import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth, unauthorizedResponse } from "../../../../../lib/admin-auth";

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

export async function POST(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse("Invalid ADMIN_INGEST_API_KEY.");
  }

  // Also set an HttpOnly cookie if requested for browser convenience
  const res = NextResponse.json(
    {
      success: true,
      authenticated: true,
      message: "Authorization verified successfully.",
    },
    {
      status: 200,
      headers: CORS_HEADERS,
    }
  );

  return res;
}

export async function GET(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse("Invalid ADMIN_INGEST_API_KEY.");
  }

  return NextResponse.json(
    {
      success: true,
      authenticated: true,
      message: "Authorization verified successfully.",
    },
    {
      status: 200,
      headers: CORS_HEADERS,
    }
  );
}
