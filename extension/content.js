/**
 * Style Advisor - In-Page Content Extractor
 * Scrapes product metadata from JSON-LD, OpenGraph, Microdata, and Brand DOM structures.
 */

function extractProductDataFromDOM() {
  const result = {
    title: "",
    brand: "",
    price: 0,
    currency: "CAD",
    image: "",
    url: window.location.href.split("?")[0],
    slot: "top",
    fabric: "",
    color: "",
    description: ""
  };

  // 1. Try extracting from JSON-LD (Schema.org / Product)
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent || "{}");
      const items = Array.isArray(data) ? data : data["@graph"] ? data["@graph"] : [data];

      for (const item of items) {
        if (item["@type"] === "Product" || item["@type"]?.includes("Product")) {
          if (item.name && !result.title) result.title = item.name;
          if (item.brand) {
            result.brand = typeof item.brand === "object" ? item.brand.name : item.brand;
          }
          if (item.description && !result.description) {
            result.description = item.description;
          }
          if (item.image) {
            const img = Array.isArray(item.image) ? item.image[0] : item.image;
            result.image = typeof img === "object" ? img.url || img.contentUrl : img;
          }
          if (item.offers) {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer.price) result.price = parseFloat(String(offer.price).replace(/[^0-9.]/g, ""));
            else if (offer.lowPrice) result.price = parseFloat(String(offer.lowPrice).replace(/[^0-9.]/g, ""));
            else if (offer.highPrice) result.price = parseFloat(String(offer.highPrice).replace(/[^0-9.]/g, ""));
            if (offer.priceCurrency) result.currency = offer.priceCurrency;
          }
          if (item.material) result.fabric = item.material;
          if (item.color) result.color = item.color;
        }
      }
    } catch (e) {
      // Ignore JSON parse errors in invalid scripts
    }
  }

  // 1b. Try extracting from __NEXT_DATA__
  const nextDataScript = document.getElementById("__NEXT_DATA__");
  if (nextDataScript) {
    try {
      const nextData = JSON.parse(nextDataScript.textContent || "{}");
      const pageProps = nextData.props?.pageProps;
      const product = pageProps?.product || pageProps?.initialData?.product || pageProps?.pdpData?.product;
      if (product) {
        if (!result.title && product.name) result.title = product.name;
        if (!result.brand && product.brand) result.brand = typeof product.brand === "object" ? product.brand.name : product.brand;
        if (!result.price || result.price === 0) {
          const rawPrice = product.price || product.priceRange?.min || product.listPrice || product.salePrice || product.price?.salePrice || product.price?.regularPrice;
          if (rawPrice) {
            const p = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ""));
            if (p > 0 && p < 10000) result.price = p;
          }
        }
      }
    } catch (e) {}
  }

  // 2. OpenGraph & Meta Tag Fallbacks
  const getMeta = (propNames) => {
    for (const prop of propNames) {
      const el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
      if (el && el.getAttribute("content")) {
        return el.getAttribute("content").trim();
      }
    }
    return "";
  };

  if (!result.title) {
    result.title = getMeta(["og:title", "twitter:title"]) || document.title.split("|")[0].split("-")[0].trim();
  }

  if (!result.image) {
    result.image = getMeta(["og:image", "og:image:secure_url", "twitter:image"]);
  }

  if (!result.brand) {
    result.brand = getMeta(["og:site_name", "brand", "author"]);
  }

  if (!result.description) {
    result.description = getMeta(["og:description", "description", "twitter:description"]);
  }

  if (!result.price) {
    const metaPrice = getMeta(["product:price:amount", "og:price:amount", "price"]);
    if (metaPrice) result.price = parseFloat(metaPrice.replace(/[^0-9.]/g, ""));
  }

  // 3. Retailer Domain Detection & Custom DOM Selectors
  const hostname = window.location.hostname.toLowerCase();

  // Lululemon
  if (hostname.includes("lululemon")) {
    result.brand = "Lululemon";
    const titleEl = document.querySelector('h1[data-testid="product-name"], .pdp-product-name, h1.product-title, h1[class*="product-name"], h1');
    if (titleEl) result.title = titleEl.textContent.trim();

    // Lululemon price candidates
    const luluPriceSelectors = [
      'span[data-testid="price"]',
      'span[data-testid="product-price"]',
      'div[data-testid="product-price"]',
      'span[class*="price-1"]',
      'span[class*="price-2"]',
      '.price-1',
      '.price-2',
      'span[class*="purchase-attributes__price"]',
      'div[class*="price_"]',
      'span[class*="price_"]',
      'span[class*="ProductPrice"]',
      '.pdp-price',
      '.product-price',
      'span.price',
      'span.money',
      '[aria-label*="price" i]'
    ];

    for (const sel of luluPriceSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const match = el.textContent.match(/\$\s*(\d+(?:\.\d{2})?)/);
        if (match && match[1]) {
          const val = parseFloat(match[1]);
          if (val > 0 && val < 5000) {
            result.price = val;
            break;
          }
        }
      }
    }

    // Color Swatch
    const colorEl = document.querySelector('[data-testid="color-name"], [class*="color-name"], [class*="colorName"], [class*="colorTitle"], [data-testid="swatch-name"]');
    if (colorEl && colorEl.textContent.trim()) {
      result.color = colorEl.textContent.trim();
    }

    const imgEl = document.querySelector('img[data-testid="product-image"], .carousel-item img, .pdp-images img, img[class*="pdp-image"], img[class*="carousel"]');
    if (imgEl && (!result.image || result.image.startsWith("data:"))) {
      result.image = imgEl.src;
    }

    const fabricEl = document.querySelector('[data-testid="materials-care"], .why-we-made-this, .product-details, [class*="materials-care"], [class*="fabric"]');
    if (fabricEl) {
      const text = fabricEl.textContent;
      const match = text.match(/(?:Material|Body|Fabric|Composition|Fill|Lining)[^.]*(?:\d+%\s*[A-Za-z]+)+/i);
      if (match) result.fabric = match[0].trim();
    }
  }

  // Aritzia
  else if (hostname.includes("aritzia")) {
    result.brand = result.brand || "Aritzia";
    const titleEl = document.querySelector("h1.product-name, .pdp-title");
    if (titleEl) result.title = titleEl.textContent.trim();

    const priceEl = document.querySelector(".price-sales, .product-price, span[itemprop='price']");
    if (priceEl && !result.price) {
      const p = priceEl.textContent.replace(/[^0-9.]/g, "");
      if (p) result.price = parseFloat(p);
    }

    const imgEl = document.querySelector(".product-image img, .pdp-image img");
    if (imgEl && !result.image) result.image = imgEl.src;
  }

  // Kotn
  else if (hostname.includes("kotn")) {
    result.brand = result.brand || "Kotn";
    const titleEl = document.querySelector("h1.product__title, .product-single__title");
    if (titleEl) result.title = titleEl.textContent.trim();

    const priceEl = document.querySelector(".price-item--regular, .product__price");
    if (priceEl && !result.price) {
      const p = priceEl.textContent.replace(/[^0-9.]/g, "");
      if (p) result.price = parseFloat(p);
    }
  }

  // RW&CO
  else if (hostname.includes("rw-co")) {
    result.brand = result.brand || "RW&CO";
    const titleEl = document.querySelector("h1.product-name");
    if (titleEl) result.title = titleEl.textContent.trim();

    const priceEl = document.querySelector(".sales .value");
    if (priceEl && !result.price) {
      const p = priceEl.textContent.replace(/[^0-9.]/g, "");
      if (p) result.price = parseFloat(p);
    }
  }

  // Joe Fresh
  else if (hostname.includes("joefresh")) {
    result.brand = "Joe Fresh";
    const titleEl = document.querySelector('h1[class*="ProductDetails_heading"], h1.ProductDetails_heading, h1[data-testid="product-title"], h1');
    if (titleEl) result.title = titleEl.textContent.trim();

    // Look for sale price first, then regular price
    const salePriceEl = document.querySelector('span[class*="ProductPrice_salePrice"], .ProductPrice_salePrice, span[class*="salePrice"]');
    const regularPriceEl = document.querySelector('span[class*="ProductPrice_regularPrice"], .ProductPrice_regularPrice, span[class*="ProductPrice"], div[class*="ProductPrice"]');
    const priceEl = salePriceEl || regularPriceEl;
    if (priceEl) {
      const match = priceEl.textContent.match(/\$\s*(\d+(?:\.\d{2})?)/);
      if (match && match[1]) {
        result.price = parseFloat(match[1]);
      } else {
        const p = priceEl.textContent.replace(/[^0-9.]/g, "");
        if (p) result.price = parseFloat(p);
      }
    }

    // Color / Swatch
    const colorEl = document.querySelector('p[class*="ProductDetails_label"] span, [data-testid*="label-"] span');
    if (colorEl && colorEl.textContent.trim()) {
      result.color = colorEl.textContent.trim();
    }

    // Fabric details
    const detailsEl = document.querySelector('ul[data-testid="details"], div[class*="AccordionContainer_accordionContent"]');
    if (detailsEl) {
      const text = detailsEl.textContent;
      const match = text.match(/(?:\d+%\s*[A-Za-z]+)+/i);
      if (match) result.fabric = match[0].trim();
    }
  }

  // Universal DOM Price Scanner (Scans common e-commerce classes & data attributes)
  if (!result.price || result.price === 0) {
    const candidateSelectors = [
      '[class*="salePrice"]',
      '[class*="sale-price"]',
      '[class*="special-price"]',
      '[class*="current-price"]',
      '[class*="regularPrice"]',
      '[class*="regular-price"]',
      '[class*="product-price"]',
      '[class*="ProductPrice"]',
      '[class*="price-sales"]',
      '[data-testid*="price"]',
      '[data-testid*="Price"]',
      '[itemprop="price"]',
      '.price--sale',
      '.price--current',
      '.price-item--regular',
      '.price-item--sale',
      '.price',
      '.current-price',
      '.product__price'
    ];

    for (const sel of candidateSelectors) {
      const elements = document.querySelectorAll(sel);
      for (const el of elements) {
        if (!el || !el.textContent) continue;
        const text = el.textContent.trim();
        const match = text.match(/\$\s*(\d+(?:\.\d{2})?)/);
        if (match && match[1]) {
          const val = parseFloat(match[1]);
          if (val > 0 && val < 10000) {
            result.price = val;
            break;
          }
        }
      }
      if (result.price > 0) break;
    }
  }

  // Known Canadian Brands Mapping
  const KNOWN_BRANDS = [
    { key: "joefresh", name: "Joe Fresh" },
    { key: "lululemon", name: "Lululemon" },
    { key: "aritzia", name: "Aritzia" },
    { key: "canadagoose", name: "Canada Goose" },
    { key: "arcteryx", name: "Arc'teryx" },
    { key: "roots", name: "Roots" },
    { key: "kotn", name: "Kotn" },
    { key: "tentree", name: "Tentree" },
    { key: "mackage", name: "Mackage" },
    { key: "mooseknuckles", name: "Moose Knuckles" },
    { key: "herschel", name: "Herschel Supply Co." },
    { key: "provinceofcanada", name: "Province of Canada" },
    { key: "encircled", name: "Encircled" },
    { key: "frankandoak", name: "Frank And Oak" },
    { key: "clubmonaco", name: "Club Monaco" },
    { key: "reigningchamp", name: "Reigning Champ" },
    { key: "simons", name: "Simons" },
    { key: "vessi", name: "Vessi" },
    { key: "nakedandfamous", name: "Naked & Famous Denim" },
    { key: "lole", name: "Lolë" },
    { key: "commongoods", name: "Common Goods" },
    { key: "rw-co", name: "RW&CO" },
    { key: "rwco", name: "RW&CO" },
    { key: "sorel", name: "Sorel" },
    { key: "baffin", name: "Baffin" },
    { key: "kamik", name: "Kamik" },
  ];

  for (const kb of KNOWN_BRANDS) {
    if (hostname.includes(kb.key)) {
      result.brand = kb.name;
      break;
    }
  }

  // Generic Brand Fallback from hostname
  if (!result.brand) {
    const parts = hostname.replace("www.", "").split(".");
    if (parts.length > 0) {
      result.brand = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  }

  // 4. Smart Wardrobe Slot Auto-Classification
  const textCorpus = `${result.title} ${result.description}`.toLowerCase();
  if (/(?:pant|jean|trouser|short|skirt|legging|jogger|tights|denim|chinos)/i.test(textCorpus)) {
    result.slot = "bottom";
  } else if (/(?:jacket|coat|blazer|parka|trench|puffer|anorak|overcoat|outerwear|windbreaker)/i.test(textCorpus)) {
    result.slot = "outerwear";
  } else if (/(?:sneaker|boot|loafer|shoe|sandal|heel|runner|mule|oxford|derby|footwear)/i.test(textCorpus)) {
    result.slot = "shoes";
  } else if (/(?:belt|hat|cap|scarf|bag|tote|wallet|tie|sock|glasses|sunglass|accessory|beanie)/i.test(textCorpus)) {
    result.slot = "accessory";
  } else {
    result.slot = "top";
  }

  return result;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_PRODUCT") {
    try {
      const data = extractProductDataFromDOM();
      sendResponse({ success: true, data });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }
  return true;
});
