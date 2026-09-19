import { NextRequest, NextResponse } from "next/server";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const TIMEOUT_MS = 6000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { status: 400, ok: false, message: "Invalid URL provided." },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      let response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,en-CA;q=0.8",
        },
        redirect: "manual",
        signal: controller.signal,
      });

      // If HEAD is disallowed, fallback to GET
      if (response.status === 405 || response.status === 501) {
        response = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": BROWSER_USER_AGENT,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,en-CA;q=0.8",
          },
          redirect: "manual",
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const statusCode = response.status;

      if (statusCode >= 200 && statusCode < 300) {
        return NextResponse.json({
          status: statusCode,
          ok: true,
          message: `Live (HTTP ${statusCode}) • ${latencyMs}ms`,
          latencyMs,
        });
      }

      if (statusCode >= 300 && statusCode < 400) {
        const redirectUrl = response.headers.get("location") || "";
        return NextResponse.json({
          status: statusCode,
          ok: true,
          message: `Redirect (HTTP ${statusCode})${redirectUrl ? ` → ${redirectUrl}` : ""}`,
          latencyMs,
        });
      }

      if (statusCode === 403) {
        return NextResponse.json({
          status: 403,
          ok: true,
          message: `Cloudflare/WAF Protected (Domain Active • HTTP 403)`,
          latencyMs,
        });
      }

      if (statusCode === 404 || statusCode === 410) {
        return NextResponse.json({
          status: statusCode,
          ok: false,
          message: `Page Not Found (HTTP ${statusCode}) on retailer store`,
          latencyMs,
        });
      }

      return NextResponse.json({
        status: statusCode,
        ok: false,
        message: `HTTP ${statusCode} Response`,
        latencyMs,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (controller.signal.aborted || fetchErr.name === "AbortError") {
        return NextResponse.json({
          status: 504,
          ok: false,
          message: `Request timeout (${TIMEOUT_MS}ms exceeded)`,
          latencyMs,
        });
      }

      return NextResponse.json({
        status: 500,
        ok: false,
        message: fetchErr.message || "Network request failed",
        latencyMs,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { status: 500, ok: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
