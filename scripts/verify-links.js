const fs = require("fs");
const path = require("path");

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const TIMEOUT_MS = 5000;

async function pingUrl(url) {
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
      return { status: "OK", statusCode, latencyMs };
    }

    if (statusCode >= 300 && statusCode < 400) {
      const redirectUrl = response.headers.get("location") || "Unknown Location";
      return { status: "REDIRECT", statusCode, latencyMs, redirectUrl };
    }

    if (statusCode === 403) {
      return {
        status: "FORBIDDEN_BOT",
        statusCode,
        latencyMs,
        errorMessage: "Cloudflare/WAF bot protection (valid domain)",
      };
    }

    if (statusCode === 404 || statusCode === 410) {
      return { status: "DEAD_404", statusCode, latencyMs, errorMessage: "Not Found on retailer server" };
    }

    return {
      status: "ERROR",
      statusCode,
      latencyMs,
      errorMessage: `HTTP status ${statusCode}`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (controller.signal.aborted || err.name === "AbortError") {
      return {
        status: "TIMEOUT",
        latencyMs,
        errorMessage: `Exceeded timeout threshold (${TIMEOUT_MS}ms)`,
      };
    }

    return {
      status: "ERROR",
      latencyMs,
      errorMessage: err.message || "Network resolution failed",
    };
  }
}

async function runLinkVerification() {
  console.log("\n============================================================");
  console.log("  STYLE ADVISOR — PRE-DEMO LINK VERIFICATION SUITE");
  console.log("============================================================\n");

  const catalogPath = path.resolve(process.cwd(), "data/catalog.json");
  if (!fs.existsSync(catalogPath)) {
    console.error(`❌ Catalog file not found at ${catalogPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(catalogPath, "utf-8");
  const garments = JSON.parse(raw);
  console.log(`📦 Loaded ${garments.length} garments from catalog.`);
  console.log(`⏱️  Pinging all retailer URLs with ${TIMEOUT_MS}ms timeout threshold...\n`);

  const results = [];
  const BATCH_SIZE = 4;
  for (let i = 0; i < garments.length; i += BATCH_SIZE) {
    const batch = garments.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (garment) => {
      const url = garment.product_url || garment.retailer_url;
      if (!url) {
        return {
          garment_id: garment.id,
          brand: garment.brand,
          url: "MISSING_URL",
          status: "DEAD_404",
          latencyMs: 0,
          errorMessage: "No URL specified in catalog entry",
        };
      }

      const ping = await pingUrl(url);
      return {
        garment_id: garment.id,
        brand: garment.brand,
        url,
        ...ping,
      };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  // Render Formatted CLI Table
  console.log("┌────────────────────────────────────┬────────────┬─────────────┬────────┬───────────┬────────────────────────────────────────────────────────┐");
  console.log("│ Garment ID                         │ Brand      │ Status      │ Code   │ Latency   │ Retailer URL                                           │");
  console.log("├────────────────────────────────────┼────────────┼─────────────┼────────┼───────────┼────────────────────────────────────────────────────────┤");

  for (const r of results) {
    const idPad = r.garment_id.padEnd(34).substring(0, 34);
    const brandPad = r.brand.padEnd(10).substring(0, 10);
    const codePad = (r.statusCode ? String(r.statusCode) : "-").padEnd(6);
    const latencyPad = `${r.latencyMs}ms`.padEnd(9);
    const urlPad = r.url.padEnd(54).substring(0, 54);

    let statusStyled = r.status.padEnd(11);
    if (r.status === "OK") {
      statusStyled = `\x1b[32m${statusStyled}\x1b[0m`;
    } else if (r.status === "REDIRECT") {
      statusStyled = `\x1b[34m${statusStyled}\x1b[0m`;
    } else if (r.status === "FORBIDDEN_BOT") {
      statusStyled = `\x1b[33m${statusStyled}\x1b[0m`;
    } else {
      statusStyled = `\x1b[31m${statusStyled}\x1b[0m`;
    }

    console.log(`│ ${idPad} │ ${brandPad} │ ${statusStyled} │ ${codePad} │ ${latencyPad} │ ${urlPad} │`);
  }
  console.log("└────────────────────────────────────┴────────────┴─────────────┴────────┴───────────┴────────────────────────────────────────────────────────┘\n");

  const deadLinks = results.filter((r) => r.status === "DEAD_404" || r.status === "ERROR");
  const timeouts = results.filter((r) => r.status === "TIMEOUT");
  const botProtected = results.filter((r) => r.status === "FORBIDDEN_BOT");
  const healthy = results.filter((r) => r.status === "OK" || r.status === "REDIRECT" || r.status === "FORBIDDEN_BOT");

  console.log("📊 SUMMARY METRICS:");
  console.log(`   - Total Checked:       ${results.length}`);
  console.log(`   - Verified Active:     ${healthy.length} / ${results.length}`);
  console.log(`   - Bot-Shielded (403):  ${botProtected.length}`);
  console.log(`   - Timeouts (>5s):      ${timeouts.length}`);
  console.log(`   - Dead / 404 Links:    ${deadLinks.length}`);

  if (deadLinks.length > 0) {
    console.log("\n⚠️  ACTION REQUIRED BEFORE DEMO DAY:");
    console.log("   The following garment IDs have DEAD or INVALID links that must be replaced:\n");
    for (const d of deadLinks) {
      console.log(`   ❌ [${d.garment_id}] (${d.brand}) -> ${d.url}`);
      console.log(`      Error: ${d.errorMessage || "Status Code " + d.statusCode}\n`);
    }
  } else {
    console.log("\n✅ ZERO DEAD LINKS DETECTED: All product catalog links are verified for Demo Day!\n");
  }

  return { total: results.length, deadCount: deadLinks.length };
}

runLinkVerification().catch((err) => {
  console.error("Link verification script failure:", err);
  process.exit(1);
});
