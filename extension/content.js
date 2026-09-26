/**
 * Style Advisor - In-Page Content Extractor & Draggable Floating Ingestion Widget
 * Version: 1.0.4
 */

(function () {
  // If already initialized in this page, just trigger toggle
  if (window.__STYLE_ADVISOR_INJECTED__) {
    if (typeof window.__STYLE_ADVISOR_TOGGLE__ === "function") {
      window.__STYLE_ADVISOR_TOGGLE__();
    }
    return;
  }
  window.__STYLE_ADVISOR_INJECTED__ = true;

  // -------------------------------------------------------------
  // HELPER: UNIVERSAL CLEAN PRICE PARSER
  // Handles: "93,12", "90,93", "$93.12", "93,12 $ CAD", "1,299.00", "1.299,50"
  // -------------------------------------------------------------
  function parseCleanPrice(raw) {
    if (typeof raw === "number") return raw;
    if (!raw) return 0;
    let s = String(raw).trim();

    // Remove any currency words/letters but keep digits, dots, commas
    s = s.replace(/[^0-9.,]/g, "");

    // Check if comma is used as decimal mark (e.g. "93,12" or "1.299,50" or "90,93")
    if (/,\d{2}$/.test(s)) {
      // Remove any dot thousands separators, then replace decimal comma with dot
      s = s.replace(/\./g, "").replace(/,(\d{2})$/, ".$1");
    } else if (/\.\d{2}$/.test(s)) {
      // Standard decimal dot e.g. "1,299.50" -> remove comma thousands
      s = s.replace(/,/g, "");
    } else {
      // No 2-digit decimal suffix -> strip commas
      s = s.replace(/,/g, "");
    }

    const match = s.match(/(\d+(?:\.\d+)?)/);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0 && val < 50000) return val;
    }
    return 0;
  }

  // -------------------------------------------------------------
  // 1. DATA EXTRACTION ENGINE
  // -------------------------------------------------------------
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
              if (offer.price) result.price = parseCleanPrice(offer.price);
              else if (offer.lowPrice) result.price = parseCleanPrice(offer.lowPrice);
              else if (offer.highPrice) result.price = parseCleanPrice(offer.highPrice);
              if (offer.priceCurrency) result.currency = offer.priceCurrency;
            }
            if (item.material) result.fabric = item.material;
            if (item.color) result.color = item.color;
          }
        }
      } catch (e) {}
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
              const p = parseCleanPrice(rawPrice);
              if (p > 0) result.price = p;
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
      const ogTitle = getMeta(["og:title", "twitter:title"]);
      result.title = ogTitle ? ogTitle.split("|")[0].split("-")[0].trim() : document.title.split("|")[0].split("-")[0].trim();
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

    if (!result.price || result.price === 0) {
      const metaPrice = getMeta(["product:price:amount", "og:price:amount", "price"]);
      if (metaPrice) {
        result.price = parseCleanPrice(metaPrice);
      }
    }

    // 3. Retailer Domain Detection & Custom Selectors
    const hostname = window.location.hostname.toLowerCase();

    // RW&CO
    if (hostname.includes("rw-co") || hostname.includes("rwco")) {
      result.brand = "RW&CO";
      const titleEl = document.querySelector("h1.product-name, h1.product__title, h1[class*='product-title'], h1");
      if (titleEl && !result.title) result.title = titleEl.textContent.trim();

      const priceEl = document.querySelector(".price-item--sale, .price-item--regular, .sales .value, span[class*='price-item'], .product__price, span.price");
      if (priceEl && (!result.price || result.price === 0)) {
        result.price = parseCleanPrice(priceEl.textContent);
      }

      // Fabric details
      const detailsEl = document.querySelector('.product-details, [class*="materials"], [class*="care-content"], [data-testid="details"]');
      if (detailsEl) {
        const match = detailsEl.textContent.match(/(?:wool blend|stretch wool|100%\s*[A-Za-z]+|polyester|rayon|spandex|cotton)/i);
        if (match) result.fabric = match[0].trim();
      }
    }

    // Reigning Champ
    else if (hostname.includes("reigningchamp")) {
      result.brand = "Reigning Champ";
      const titleEl = document.querySelector('h1.product__title, h1[class*="product-title"], h1.h2, h1');
      if (titleEl && !result.title) result.title = titleEl.textContent.trim();

      const priceEl = document.querySelector('.price-item--regular, .price-item--sale, span[class*="price-item"], .product__price, span.price');
      if (priceEl && (!result.price || result.price === 0)) {
        result.price = parseCleanPrice(priceEl.textContent);
      }

      if (!result.fabric && result.description) {
        const fabricMatch = result.description.match(/(?:100%\s*[A-Za-z]+|brushed cotton|cotton flannel|midweight terry|heavyweight fleece|pima cotton|twill|fleece|wool)/i);
        if (fabricMatch) result.fabric = fabricMatch[0].trim();
      }

      const selectedColorEl = document.querySelector('input[name="Color"]:checked, input[name="Colour"]:checked, span[class*="selected-value"]');
      if (selectedColorEl) {
        result.color = selectedColorEl.value || selectedColorEl.textContent.trim();
      }
    }

    // Lululemon
    else if (hostname.includes("lululemon")) {
      result.brand = "Lululemon";
      const titleEl = document.querySelector('h1[data-testid="product-name"], .pdp-product-name, h1.product-title, h1[class*="product-name"], h1');
      if (titleEl) result.title = titleEl.textContent.trim();

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
          const val = parseCleanPrice(el.textContent);
          if (val > 0) {
            result.price = val;
            break;
          }
        }
      }

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
      if (priceEl && (!result.price || result.price === 0)) {
        result.price = parseCleanPrice(priceEl.textContent);
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
      if (priceEl && (!result.price || result.price === 0)) {
        result.price = parseCleanPrice(priceEl.textContent);
      }
    }

    // Joe Fresh
    else if (hostname.includes("joefresh")) {
      result.brand = "Joe Fresh";
      const titleEl = document.querySelector('h1[class*="ProductDetails_heading"], h1.ProductDetails_heading, h1[data-testid="product-title"], h1');
      if (titleEl) result.title = titleEl.textContent.trim();

      const salePriceEl = document.querySelector('span[class*="ProductPrice_salePrice"], .ProductPrice_salePrice, span[class*="salePrice"]');
      const regularPriceEl = document.querySelector('span[class*="ProductPrice_regularPrice"], .ProductPrice_regularPrice, span[class*="ProductPrice"], div[class*="ProductPrice"]');
      const priceEl = salePriceEl || regularPriceEl;
      if (priceEl && (!result.price || result.price === 0)) {
        result.price = parseCleanPrice(priceEl.textContent);
      }

      const colorEl = document.querySelector('p[class*="ProductDetails_label"] span, [data-testid*="label-"] span');
      if (colorEl && colorEl.textContent.trim()) {
        result.color = colorEl.textContent.trim();
      }

      const detailsEl = document.querySelector('ul[data-testid="details"], div[class*="AccordionContainer_accordionContent"]');
      if (detailsEl) {
        const text = detailsEl.textContent;
        const match = text.match(/(?:\d+%\s*[A-Za-z]+)+/i);
        if (match) result.fabric = match[0].trim();
      }
    }

    // Universal DOM Price Scanner (Fallback)
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
          const val = parseCleanPrice(el.textContent);
          if (val > 0) {
            result.price = val;
            break;
          }
        }
        if (result.price > 0) break;
      }
    }

    // Known Canadian Brands Mapping
    const KNOWN_BRANDS = [
      { key: "rw-co", name: "RW&CO" },
      { key: "rwco", name: "RW&CO" },
      { key: "reigningchamp", name: "Reigning Champ" },
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
      { key: "simons", name: "Simons" },
      { key: "vessi", name: "Vessi" },
      { key: "nakedandfamous", name: "Naked & Famous Denim" },
      { key: "lole", name: "Lolë" },
      { key: "commongoods", name: "Common Goods" },
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

    if (!result.brand) {
      const parts = hostname.replace("www.", "").split(".");
      if (parts.length > 0) {
        result.brand = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    }

    // Smart Wardrobe Slot Auto-Classification
    const textCorpus = `${result.title} ${result.description} ${window.location.href}`.toLowerCase();
    if (/(?:pant|pants|jean|jeans|trouser|trousers|short|shorts|skirt|legging|leggings|jogger|joggers|tights|denim|chinos|sweatpant)/i.test(textCorpus)) {
      result.slot = "bottom";
    } else if (/(?:jacket|coat|blazer|parka|trench|puffer|anorak|overcoat|outerwear|windbreaker|vest|bomber|cardigan|fleece|wunder puff)/i.test(textCorpus)) {
      result.slot = "outerwear";
    } else if (/(?:sneaker|boot|loafer|shoe|sandal|heel|runner|mule|oxford|derby|footwear)/i.test(textCorpus)) {
      result.slot = "shoes";
    } else if (/(?:belt|hat|cap|scarf|bag|tote|wallet|tie|sock|glasses|sunglass|accessory|beanie|backpack)/i.test(textCorpus)) {
      result.slot = "accessory";
    } else {
      result.slot = "top";
    }

    return result;
  }

  // -------------------------------------------------------------
  // 2. DRAGGABLE FLOATING IN-PAGE WIDGET (Shadow DOM)
  // -------------------------------------------------------------
  let widgetHost = null;
  let shadowRoot = null;
  let isWidgetVisible = false;

  function createOrToggleWidget() {
    if (widgetHost && shadowRoot) {
      isWidgetVisible = !isWidgetVisible;
      const modal = shadowRoot.getElementById("sa-widget-container");
      const pill = shadowRoot.getElementById("sa-minimized-pill");
      if (modal && pill) {
        if (isWidgetVisible) {
          modal.style.display = "flex";
          pill.style.display = "none";
          refreshExtractedData();
        } else {
          modal.style.display = "none";
          pill.style.display = "none";
        }
      }
      return;
    }

    // Create Host element directly on documentElement to bypass any body CSS transforms/overflows
    widgetHost = document.createElement("div");
    widgetHost.id = "style-advisor-root";
    widgetHost.style.cssText = "all: initial !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 0 !important; height: 0 !important; z-index: 2147483647 !important; pointer-events: auto !important;";
    
    // Attach to document.documentElement (<html>) or body fallback
    const targetParent = document.documentElement || document.body;
    targetParent.appendChild(widgetHost);

    shadowRoot = widgetHost.attachShadow({ mode: "open" });

    // Inject Widget Styles & Markup
    shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 13px;
          color: #1C1B19;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        #sa-widget-container {
          position: fixed !important;
          top: 30px;
          right: 30px;
          width: 380px;
          max-height: 88vh;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(28, 27, 25, 0.14);
          border-radius: 16px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 2147483647;
          transition: box-shadow 0.2s ease;
        }
        #sa-widget-container.dragging {
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32);
          user-select: none;
        }
        /* Header / Drag Bar */
        .sa-header {
          padding: 12px 16px;
          background: #1C1B19;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: grab;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sa-header:active {
          cursor: grabbing;
        }
        .sa-brand-group {
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: none;
        }
        .sa-logo-icon {
          font-size: 16px;
        }
        .sa-title-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sa-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.2px;
          color: #ffffff;
        }
        .sa-badge {
          background: rgba(255, 255, 255, 0.18);
          color: #E8B923;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 999px;
          letter-spacing: 0.2px;
        }
        .sa-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sa-btn-ctrl {
          background: rgba(255, 255, 255, 0.12);
          border: none;
          color: #ffffff;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .sa-btn-ctrl:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        /* Body */
        .sa-body {
          padding: 14px 16px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: calc(88vh - 50px);
        }
        /* Preview Card */
        .sa-preview-card {
          display: flex;
          gap: 12px;
          background: #F5F4F0;
          border: 1px solid rgba(28, 27, 25, 0.08);
          border-radius: 10px;
          padding: 10px;
          align-items: center;
        }
        .sa-preview-img-box {
          width: 60px;
          height: 75px;
          background: #ffffff;
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sa-preview-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sa-preview-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .sa-preview-brand {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #7B7871;
          letter-spacing: 0.5px;
        }
        .sa-preview-title {
          font-size: 12px;
          font-weight: 600;
          color: #1C1B19;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sa-preview-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .sa-preview-price {
          font-size: 13px;
          font-weight: 800;
          color: #1A5F3B;
        }
        .sa-preview-slot {
          font-size: 9px;
          font-weight: 700;
          background: #1C1B19;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        /* Form fields */
        .sa-field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sa-field-row {
          display: flex;
          gap: 8px;
        }
        .sa-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sa-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #7B7871;
          letter-spacing: 0.3px;
        }
        .sa-input, .sa-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid rgba(28, 27, 25, 0.16);
          border-radius: 6px;
          background: #ffffff;
          color: #1C1B19;
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s;
        }
        .sa-input:focus, .sa-select:focus {
          border-color: #1C1B19;
        }
        /* Color input group */
        .sa-color-wrap {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .sa-color-picker {
          -webkit-appearance: none;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          background: none;
          padding: 0;
        }
        .sa-color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .sa-color-picker::-webkit-color-swatch {
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 6px;
        }
        /* Environment Settings Box */
        .sa-config-box {
          background: #F5F4F0;
          border: 1px solid rgba(28, 27, 25, 0.08);
          border-radius: 8px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sa-env-buttons {
          display: flex;
          gap: 6px;
        }
        .sa-btn-env {
          flex: 1;
          padding: 4px 6px;
          border: 1px solid rgba(28, 27, 25, 0.15);
          border-radius: 4px;
          background: #ffffff;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          color: #1C1B19;
          transition: all 0.15s;
        }
        .sa-btn-env.active {
          background: #1C1B19;
          color: #ffffff;
          border-color: #1C1B19;
        }
        /* Buttons */
        .sa-actions {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }
        .sa-btn-primary {
          flex: 2;
          background: #1C1B19;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: background 0.15s, transform 0.1s;
        }
        .sa-btn-primary:hover {
          background: #333333;
        }
        .sa-btn-primary:active {
          transform: scale(0.98);
        }
        .sa-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .sa-btn-rescan {
          flex: 1;
          background: #ffffff;
          color: #1C1B19;
          border: 1px solid rgba(28, 27, 25, 0.2);
          border-radius: 8px;
          padding: 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .sa-btn-rescan:hover {
          background: #F5F4F0;
        }
        /* Toast */
        .sa-toast {
          position: absolute;
          bottom: 12px;
          left: 16px;
          right: 16px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          display: none;
          z-index: 10;
        }
        .sa-toast.success {
          display: block;
          background: #E8F5E9;
          color: #1B5E20;
          border: 1px solid #A5D6A7;
        }
        .sa-toast.error {
          display: block;
          background: #FFEBEE;
          color: #B71C1C;
          border: 1px solid #FFCDD2;
        }
        /* Minimized floating pill */
        #sa-minimized-pill {
          position: fixed !important;
          bottom: 24px;
          right: 24px;
          background: #1C1B19;
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 999px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          display: none;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          z-index: 2147483647;
          font-weight: 700;
          font-size: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          transition: transform 0.15s, background 0.15s;
        }
        #sa-minimized-pill:hover {
          transform: translateY(-2px);
          background: #333333;
        }
      </style>

      <!-- Minimized Floating Pill -->
      <div id="sa-minimized-pill">
        <span>✨ Style Advisor Ingestor</span>
        <span style="font-size: 10px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">v1.0.4</span>
      </div>

      <!-- Main Draggable Modal Container -->
      <div id="sa-widget-container">
        <!-- Header (Drag Handle) -->
        <div id="sa-drag-header" class="sa-header">
          <div class="sa-brand-group">
            <span class="sa-logo-icon">✨</span>
            <div class="sa-title-wrap">
              <span class="sa-title">Style Advisor</span>
              <span class="sa-badge">Ingestor v1.0.4</span>
            </div>
          </div>
          <div class="sa-controls">
            <button id="sa-btn-minimize" class="sa-btn-ctrl" title="Minimize">—</button>
            <button id="sa-btn-close" class="sa-btn-ctrl" title="Close">✕</button>
          </div>
        </div>

        <!-- Body -->
        <div class="sa-body">
          <!-- Preview Card -->
          <div class="sa-preview-card">
            <div class="sa-preview-img-box">
              <img id="sa-preview-img" src="" alt="Product">
            </div>
            <div class="sa-preview-details">
              <span id="sa-preview-brand" class="sa-preview-brand">Brand</span>
              <span id="sa-preview-title" class="sa-preview-title">Product Name</span>
              <div class="sa-preview-meta">
                <span id="sa-preview-price" class="sa-preview-price">$0 CAD</span>
                <span id="sa-preview-slot" class="sa-preview-slot">TOP</span>
              </div>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="sa-field-group">
            <label class="sa-label">Product Name / Title *</label>
            <input type="text" id="sa-input-title" class="sa-input" placeholder="e.g. Slim-Fit Wool-Blend Pant">
          </div>

          <div class="sa-field-row">
            <div class="sa-col">
              <label class="sa-label">Brand *</label>
              <input type="text" id="sa-input-brand" class="sa-input" placeholder="e.g. RW&CO">
            </div>
            <div class="sa-col">
              <label class="sa-label">Price (CAD $) *</label>
              <input type="number" step="0.01" id="sa-input-price" class="sa-input" placeholder="0.00">
            </div>
          </div>

          <div class="sa-field-row">
            <div class="sa-col">
              <label class="sa-label">Wardrobe Slot *</label>
              <select id="sa-select-slot" class="sa-select">
                <option value="top">Top (Shirt, Tee, Sweater)</option>
                <option value="bottom">Bottom (Pants, Jeans, Shorts)</option>
                <option value="outerwear">Outerwear (Jacket, Vest, Coat)</option>
                <option value="shoes">Shoes (Sneakers, Boots)</option>
                <option value="accessory">Accessory (Bag, Belt, Scarf)</option>
              </select>
            </div>
            <div class="sa-col">
              <label class="sa-label">Color & Swatch</label>
              <div class="sa-color-wrap">
                <input type="color" id="sa-input-hex" class="sa-color-picker" value="#1C1B19">
                <input type="text" id="sa-input-color" class="sa-input" placeholder="e.g. Prince of Wales Grey">
              </div>
            </div>
          </div>

          <div class="sa-field-group">
            <label class="sa-label">Fabric / Materials</label>
            <input type="text" id="sa-input-fabric" class="sa-input" placeholder="e.g. Wool Blend, Stretch Twill">
          </div>

          <div class="sa-field-group">
            <label class="sa-label">Product Image URL</label>
            <input type="text" id="sa-input-image" class="sa-input" placeholder="https://...">
          </div>

          <!-- Environment & Key Setting -->
          <div class="sa-config-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="sa-label" style="font-size: 9px;">Target Endpoint</span>
              <div class="sa-env-buttons">
                <button type="button" id="sa-env-local" class="sa-btn-env active">Local</button>
                <button type="button" id="sa-env-prod" class="sa-btn-env">Prod</button>
              </div>
            </div>
            <input type="password" id="sa-input-key" class="sa-input" style="font-size: 11px; padding: 4px 6px;" placeholder="Admin API Key">
          </div>

          <!-- Action Buttons -->
          <div class="sa-actions">
            <button type="button" id="sa-btn-rescan" class="sa-btn-rescan">🔄 Re-scan</button>
            <button type="button" id="sa-btn-ingest" class="sa-btn-primary">
              <span id="sa-ingest-text">🚀 Ingest into Catalog</span>
            </button>
          </div>
        </div>

        <!-- Toast Notification -->
        <div id="sa-toast" class="sa-toast"></div>
      </div>
    `;

    // Elements inside shadow root
    const container = shadowRoot.getElementById("sa-widget-container");
    const dragHeader = shadowRoot.getElementById("sa-drag-header");
    const btnMinimize = shadowRoot.getElementById("sa-btn-minimize");
    const btnClose = shadowRoot.getElementById("sa-btn-close");
    const pill = shadowRoot.getElementById("sa-minimized-pill");

    const previewImg = shadowRoot.getElementById("sa-preview-img");
    const previewBrand = shadowRoot.getElementById("sa-preview-brand");
    const previewTitle = shadowRoot.getElementById("sa-preview-title");
    const previewPrice = shadowRoot.getElementById("sa-preview-price");
    const previewSlot = shadowRoot.getElementById("sa-preview-slot");

    const inputTitle = shadowRoot.getElementById("sa-input-title");
    const inputBrand = shadowRoot.getElementById("sa-input-brand");
    const inputPrice = shadowRoot.getElementById("sa-input-price");
    const selectSlot = shadowRoot.getElementById("sa-select-slot");
    const inputHex = shadowRoot.getElementById("sa-input-hex");
    const inputColor = shadowRoot.getElementById("sa-input-color");
    const inputFabric = shadowRoot.getElementById("sa-input-fabric");
    const inputImage = shadowRoot.getElementById("sa-input-image");
    const inputKey = shadowRoot.getElementById("sa-input-key");

    const btnEnvLocal = shadowRoot.getElementById("sa-env-local");
    const btnEnvProd = shadowRoot.getElementById("sa-env-prod");
    const btnRescan = shadowRoot.getElementById("sa-btn-rescan");
    const btnIngest = shadowRoot.getElementById("sa-btn-ingest");
    const ingestText = shadowRoot.getElementById("sa-ingest-text");
    const toast = shadowRoot.getElementById("sa-toast");

    let activeEndpoint = "http://localhost:3000/api/admin/catalog";
    const DEFAULT_DEV_KEY = "sa_dev_secret_key_2026";

    // Load stored key
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["style_advisor_endpoint", "style_advisor_api_key"], (res) => {
        if (res?.style_advisor_endpoint) {
          activeEndpoint = res.style_advisor_endpoint;
          if (activeEndpoint.includes("StyleAdvisor.online") || activeEndpoint.includes("styleadvisor.online")) {
            btnEnvProd.classList.add("active");
            btnEnvLocal.classList.remove("active");
          } else {
            btnEnvLocal.classList.add("active");
            btnEnvProd.classList.remove("active");
          }
        }
        if (res?.style_advisor_api_key) {
          inputKey.value = res.style_advisor_api_key;
        } else {
          inputKey.value = DEFAULT_DEV_KEY;
        }
      });
    } else {
      inputKey.value = DEFAULT_DEV_KEY;
    }

    // Show Toast Helper
    function showToast(msg, isSuccess = true) {
      toast.textContent = msg;
      toast.className = `sa-toast ${isSuccess ? "success" : "error"}`;
      setTimeout(() => {
        toast.className = "sa-toast";
      }, 3500);
    }

    // Live Preview Update
    function updateLivePreview() {
      previewTitle.textContent = inputTitle.value.trim() || "Untitled Product";
      previewBrand.textContent = inputBrand.value.trim() || "Brand";
      previewPrice.textContent = `$${inputPrice.value || 0} CAD`;
      previewSlot.textContent = selectSlot.value.toUpperCase();

      const img = inputImage.value.trim();
      if (img) {
        previewImg.src = img;
        previewImg.style.display = "block";
      } else {
        previewImg.style.display = "none";
      }
    }

    // Fill form with extracted product data
    function refreshExtractedData() {
      const data = extractProductDataFromDOM();
      inputTitle.value = data.title || "";
      inputBrand.value = data.brand || "Canadian Retailer";
      inputPrice.value = data.price || 0;
      selectSlot.value = data.slot || "top";
      inputColor.value = data.color || "Classic";
      inputFabric.value = data.fabric || "";
      inputImage.value = data.image || "";
      updateLivePreview();
    }

    // Event listeners
    inputTitle.addEventListener("input", updateLivePreview);
    inputBrand.addEventListener("input", updateLivePreview);
    inputPrice.addEventListener("input", updateLivePreview);
    selectSlot.addEventListener("change", updateLivePreview);
    inputImage.addEventListener("input", updateLivePreview);

    inputKey.addEventListener("input", () => {
      const key = inputKey.value.trim();
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ style_advisor_api_key: key });
      }
    });

    btnEnvLocal.addEventListener("click", () => {
      activeEndpoint = "http://localhost:3000/api/admin/catalog";
      btnEnvLocal.classList.add("active");
      btnEnvProd.classList.remove("active");
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ style_advisor_endpoint: activeEndpoint });
      }
    });

    btnEnvProd.addEventListener("click", () => {
      activeEndpoint = "https://StyleAdvisor.online/api/admin/catalog";
      btnEnvProd.classList.add("active");
      btnEnvLocal.classList.remove("active");
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ style_advisor_endpoint: activeEndpoint });
      }
    });

    btnRescan.addEventListener("click", () => {
      refreshExtractedData();
      showToast("✓ Product re-scanned successfully!", true);
    });

    // Minimize & Close handlers
    btnClose.addEventListener("click", () => {
      container.style.display = "none";
      pill.style.display = "none";
      isWidgetVisible = false;
    });

    btnMinimize.addEventListener("click", () => {
      container.style.display = "none";
      pill.style.display = "flex";
    });

    pill.addEventListener("click", () => {
      pill.style.display = "none";
      container.style.display = "flex";
      isWidgetVisible = true;
    });

    // -------------------------------------------------------------
    // DRAG & DROP PHYSICS
    // -------------------------------------------------------------
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    dragHeader.addEventListener("mousedown", (e) => {
      if (e.target.closest(".sa-btn-ctrl")) return;
      isDragging = true;
      container.classList.add("dragging");

      const rect = container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;

      container.style.right = "auto";
      container.style.left = `${initialLeft}px`;
      container.style.top = `${initialTop}px`;

      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const maxLeft = window.innerWidth - container.offsetWidth - 10;
      const maxTop = window.innerHeight - container.offsetHeight - 10;

      newLeft = Math.max(10, Math.min(newLeft, maxLeft));
      newTop = Math.max(10, Math.min(newTop, maxTop));

      container.style.left = `${newLeft}px`;
      container.style.top = `${newTop}px`;
    });

    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        container.classList.remove("dragging");
      }
    });

    // -------------------------------------------------------------
    // INGEST ACTION
    // -------------------------------------------------------------
    btnIngest.addEventListener("click", async () => {
      const title = inputTitle.value.trim();
      const brand = inputBrand.value.trim();
      const price = Number(inputPrice.value) || 0;
      const slot = selectSlot.value;
      const imageUrl = inputImage.value.trim();
      const fabric = inputFabric.value.trim();
      const color = inputColor.value.trim() || "Classic";
      const hexColor = inputHex.value;
      const apiKey = inputKey.value.trim() || DEFAULT_DEV_KEY;
      const currentUrl = window.location.href.split("?")[0];

      if (!title) {
        showToast("Please enter a product title / name.", false);
        return;
      }

      btnIngest.disabled = true;
      ingestText.textContent = "Ingesting...";

      const payload = {
        name: title,
        brand: brand,
        price: price,
        price_cad: price,
        product_url: currentUrl,
        retailer_url: currentUrl,
        image_url: imageUrl,
        slot: slot,
        color: color,
        hex_color: hexColor,
        fabric_composition: fabric || "Premium Canadian Fabric Blend",
        gender_cut: "unisex",
        budget_tier: price > 200 ? "$$$" : price > 80 ? "$$" : "$"
      };

      try {
        const headers = { "Content-Type": "application/json" };
        if (apiKey) {
          headers["Authorization"] = `Bearer ${apiKey}`;
          headers["x-api-key"] = apiKey;
        }

        const res = await fetch(activeEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.success) {
          showToast(`✓ Ingested "${title}" into Style Advisor!`, true);
          ingestText.textContent = "✓ Ingested Successfully!";
          setTimeout(() => {
            ingestText.textContent = "🚀 Ingest into Catalog";
            btnIngest.disabled = false;
          }, 2000);
        } else {
          showToast(json.message || "Failed to ingest item.", false);
          ingestText.textContent = "🚀 Ingest into Catalog";
          btnIngest.disabled = false;
        }
      } catch (err) {
        showToast(`Network Error: ${err.message}`, false);
        ingestText.textContent = "🚀 Ingest into Catalog";
        btnIngest.disabled = false;
      }
    });

    // Initial load
    refreshExtractedData();
    isWidgetVisible = true;
  }

  // Register global toggle reference
  window.__STYLE_ADVISOR_TOGGLE__ = createOrToggleWidget;

  // Listen for message from background or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TOGGLE_WIDGET") {
      createOrToggleWidget();
      sendResponse({ success: true });
    } else if (request.action === "EXTRACT_PRODUCT") {
      try {
        const data = extractProductDataFromDOM();
        sendResponse({ success: true, data });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    }
    return true;
  });
})();
