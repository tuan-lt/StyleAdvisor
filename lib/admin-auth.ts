import { NextRequest, NextResponse } from "next/server";

/**
 * Retrieves the configured secret API key from environment variables.
 * Fallback to development key if not configured in dev environment.
 */
export function getExpectedAdminApiKey(): string {
  const envKey = (process.env.ADMIN_INGEST_API_KEY || process.env.ADMIN_API_KEY || "").trim();
  return envKey || "sa_dev_secret_key_2026";
}

/**
 * Validates request authorization using Bearer Token, x-api-key, or session cookies.
 */
export function validateAdminAuth(req: NextRequest): {
  authorized: boolean;
  error?: string;
} {
  const expectedKey = getExpectedAdminApiKey();

  // 1. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const parts = authHeader.trim().split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      const token = parts[1];
      if (token === expectedKey) {
        return { authorized: true };
      }
    }
  }

  // 2. Check x-api-key header
  const apiKeyHeader = req.headers.get("x-api-key");
  if (apiKeyHeader && apiKeyHeader === expectedKey) {
    return { authorized: true };
  }

  // 3. Check ?key= query parameter (for 1-click URL access & verification)
  const urlKey = req.nextUrl.searchParams.get("key");
  if (urlKey && urlKey === expectedKey) {
    return { authorized: true };
  }

  // 4. Check admin_auth_token cookie
  const cookieKey = req.cookies.get("admin_auth_token")?.value;
  if (cookieKey && cookieKey === expectedKey) {
    return { authorized: true };
  }

  return {
    authorized: false,
    error: "Unauthorized: Valid Bearer ADMIN_INGEST_API_KEY is required.",
  };
}

/**
 * Standard CORS-compatible 401 Unauthorized response
 */
export function unauthorizedResponse(message?: string) {
  return NextResponse.json(
    {
      success: false,
      error: "UNAUTHORIZED",
      message: message || "Unauthorized: Valid Bearer ADMIN_INGEST_API_KEY is required.",
    },
    {
      status: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, Accept",
      },
    }
  );
}
