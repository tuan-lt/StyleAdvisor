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
            if (offer.price) result.price = Number(offer.price);
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
    result.brand = result.brand || "Lululemon";
    const titleEl = document.querySelector('h1[data-testid="product-name"], .pdp-product-name, h1.product-title');
    if (titleEl) result.title = titleEl.textContent.trim();

    const priceEl = document.querySelector('span[data-testid="product-price"], .price-1, .price, .product-price');
    if (priceEl && !result.price) {
      const p = priceEl.textContent.replace(/[^0-9.]/g, "");
      if (p) result.price = parseFloat(p);
    }

    const imgEl = document.querySelector('img[data-testid="product-image"], .carousel-item img, .pdp-images img');
    if (imgEl && (!result.image || result.image.startsWith("data:"))) {
      result.image = imgEl.src;
    }

    const fabricEl = document.querySelector('[data-testid="materials-care"], .why-we-made-this, .product-details');
    if (fabricEl) {
      const text = fabricEl.textContent;
      const match = text.match(/(?:Material|Body|Fabric|Composition)[^.]*(?:\d+%\s*[A-Za-z]+)+/i);
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
