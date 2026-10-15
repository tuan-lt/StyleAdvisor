/**
 * Style Advisor - Chrome Extension Popup Logic
 * Supporting both http://localhost:3000 and https://StyleAdvisor.online
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const endpointBadge = document.getElementById("endpointStatusBadge");
  const statusText = document.getElementById("statusText");
  const loadingBox = document.getElementById("loadingBox");
  const productForm = document.getElementById("productForm");

  // Preview elements
  const previewImg = document.getElementById("previewImg");
  const noImgFallback = document.getElementById("noImgFallback");
  const previewBrand = document.getElementById("previewBrand");
  const previewTitle = document.getElementById("previewTitle");
  const previewPrice = document.getElementById("previewPrice");
  const previewSlot = document.getElementById("previewSlot");

  // Version Banner elements
  const versionWarningBanner = document.getElementById("versionWarningBanner");
  const versionWarningMessage = document.getElementById("versionWarningMessage");
  const versionWarningLink = document.getElementById("versionWarningLink");

  // Form inputs
  const inputTitle = document.getElementById("inputTitle");
  const inputBrand = document.getElementById("inputBrand");
  const inputPrice = document.getElementById("inputPrice");
  const selectSlot = document.getElementById("selectSlot");
  const selectGender = document.getElementById("selectGender");
  const inputColor = document.getElementById("inputColor");
  const inputHex = document.getElementById("inputHex");
  const hexValueText = document.getElementById("hexValueText");
  const inputFabric = document.getElementById("inputFabric");
  const inputImage = document.getElementById("inputImage");
  const endpointUrlInput = document.getElementById("endpointUrl");
  const adminApiKeyInput = document.getElementById("adminApiKey");
  const btnToggleKeyVisibility = document.getElementById("btnToggleKeyVisibility");
  const adminLinkLocal = document.getElementById("adminLinkLocal");
  const adminLinkProd = document.getElementById("adminLinkProd");
  const btnEnvLocal = document.getElementById("btnEnvLocal");
  const btnEnvProd = document.getElementById("btnEnvProd");
  const btnIngest = document.getElementById("btnIngest");
  const btnIngestText = document.getElementById("btnIngestText");
  const toastMessage = document.getElementById("toastMessage");

  let currentTabUrl = "";

  const EXTENSION_VERSION = "1.0.5";
  const EXTENSION_TOOL_NAME = "style-advisor-chrome-extension";
  let isVersionLocked = false;

  const LOCAL_ENDPOINT = "http://localhost:3000/api/admin/catalog";
  const PROD_ENDPOINT = "https://StyleAdvisor.online/api/admin/catalog";
  const DEFAULT_DEV_KEY = "sa_dev_secret_key_2026";

  const updateAdminLinks = (apiKey) => {
    const key = apiKey || adminApiKeyInput?.value?.trim() || DEFAULT_DEV_KEY;
    if (adminLinkLocal) {
      adminLinkLocal.href = `http://localhost:3000/admin?key=${encodeURIComponent(key)}`;
    }
    if (adminLinkProd) {
      adminLinkProd.href = `https://StyleAdvisor.online/admin?key=${encodeURIComponent(key)}`;
    }
  };

  // Load saved endpoint and API key from storage
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["style_advisor_endpoint", "style_advisor_api_key"], (res) => {
      if (res && res.style_advisor_endpoint) {
        endpointUrlInput.value = res.style_advisor_endpoint;
        updateEnvButtons(res.style_advisor_endpoint);
      }
      if (res && res.style_advisor_api_key) {
        if (adminApiKeyInput) adminApiKeyInput.value = res.style_advisor_api_key;
        updateAdminLinks(res.style_advisor_api_key);
      } else {
        updateAdminLinks(DEFAULT_DEV_KEY);
      }
      checkApiHealth();
    });
  } else {
    updateAdminLinks(DEFAULT_DEV_KEY);
  }

  function updateEnvButtons(currentUrl) {
    if (currentUrl.includes("StyleAdvisor.online") || currentUrl.includes("styleadvisor.online")) {
      btnEnvProd?.classList.add("active");
      btnEnvLocal?.classList.remove("active");
      if (btnEnvProd) btnEnvProd.style.background = "#1F2A44", btnEnvProd.style.color = "#fff";
      if (btnEnvLocal) btnEnvLocal.style.background = "#f0f0f0", btnEnvLocal.style.color = "#1C1B19";
    } else {
      btnEnvLocal?.classList.add("active");
      btnEnvProd?.classList.remove("active");
      if (btnEnvLocal) btnEnvLocal.style.background = "#1F2A44", btnEnvLocal.style.color = "#fff";
      if (btnEnvProd) btnEnvProd.style.background = "#f0f0f0", btnEnvProd.style.color = "#1C1B19";
    }
  }

  // Toggle API Key visibility
  btnToggleKeyVisibility?.addEventListener("click", () => {
    if (adminApiKeyInput.type === "password") {
      adminApiKeyInput.type = "text";
      btnToggleKeyVisibility.textContent = "🙈";
    } else {
      adminApiKeyInput.type = "password";
      btnToggleKeyVisibility.textContent = "👁️";
    }
  });

  // API Key Change Handler
  adminApiKeyInput?.addEventListener("input", () => {
    const key = adminApiKeyInput.value.trim();
    updateAdminLinks(key);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ style_advisor_api_key: key });
    }
    checkApiHealth();
  });

  // Environment Switcher Handlers
  btnEnvLocal?.addEventListener("click", () => {
    endpointUrlInput.value = LOCAL_ENDPOINT;
    updateEnvButtons(LOCAL_ENDPOINT);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ style_advisor_endpoint: LOCAL_ENDPOINT });
    }
    checkApiHealth();
  });

  btnEnvProd?.addEventListener("click", () => {
    endpointUrlInput.value = PROD_ENDPOINT;
    updateEnvButtons(PROD_ENDPOINT);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ style_advisor_endpoint: PROD_ENDPOINT });
    }
    checkApiHealth();
  });

  endpointUrlInput?.addEventListener("input", () => {
    updateEnvButtons(endpointUrlInput.value);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ style_advisor_endpoint: endpointUrlInput.value });
    }
    checkApiHealth();
  });

  // Helper: Toast
  const showToast = (msg, isSuccess = true) => {
    toastMessage.textContent = msg;
    toastMessage.className = `toast ${isSuccess ? "success" : "error"}`;
    setTimeout(() => {
      toastMessage.className = "toast hidden";
    }, 3500);
  };

  // Helper: Update Preview Card
  const updatePreview = () => {
    previewTitle.textContent = inputTitle.value || "Untitled Product";
    previewBrand.textContent = inputBrand.value || "Brand";
    previewPrice.textContent = `$${inputPrice.value || 0} CAD`;
    previewSlot.textContent = (selectSlot.value || "top").toUpperCase();

    const imgUrl = inputImage.value?.trim();
    if (imgUrl) {
      previewImg.src = imgUrl;
      previewImg.classList.remove("hidden");
      noImgFallback.classList.add("hidden");
    } else {
      previewImg.classList.add("hidden");
      noImgFallback.classList.remove("hidden");
    }
  };

  // Version comparison helper: returns true if current is older than minRequired
  const isVersionOutdated = (current, minRequired) => {
    if (!current) return true;
    const parse = (v) => v.split(".").map((n) => parseInt(n, 10) || 0);
    const c = parse(current);
    const m = parse(minRequired);
    for (let i = 0; i < Math.max(c.length, m.length); i++) {
      const cv = c[i] || 0;
      const mv = m[i] || 0;
      if (cv < mv) return true;
      if (cv > mv) return false;
    }
    return false;
  };

  // Auto-lock helper for deprecated extension version
  const setVersionLock = (isLocked, minVersion = "1.0.5", downloadUrl = "/admin", customMessage = "") => {
    isVersionLocked = isLocked;
    if (isLocked) {
      if (versionWarningBanner) {
        versionWarningBanner.classList.remove("hidden");
      }
      if (versionWarningMessage) {
        versionWarningMessage.textContent =
          customMessage ||
          `You are using v${EXTENSION_VERSION}. Minimum required version is v${minVersion}. Ingestion is locked until updated.`;
      }
      if (versionWarningLink) {
        const currentEndpoint = endpointUrlInput.value.trim();
        const baseOrigin = currentEndpoint.includes("StyleAdvisor.online") || currentEndpoint.includes("styleadvisor.online")
          ? "https://StyleAdvisor.online"
          : "http://localhost:3000";
        const key = adminApiKeyInput?.value?.trim() || DEFAULT_DEV_KEY;
        versionWarningLink.href = `${baseOrigin}/admin?key=${encodeURIComponent(key)}`;
        versionWarningLink.textContent = `Update from Admin Hub (v${minVersion}) ↗`;
      }
      endpointBadge.className = "status-badge deprecated";
      statusText.textContent = "Deprecated";
      btnIngest.disabled = true;
      btnIngest.classList.add("locked-btn");
      btnIngestText.textContent = "⚠️ Update Required to Ingest";
    } else {
      if (versionWarningBanner) {
        versionWarningBanner.classList.add("hidden");
      }
      btnIngest.classList.remove("locked-btn");
      btnIngest.disabled = false;
      btnIngestText.textContent = "Ingest into Catalog";
    }
  };

  // 1. Check API Health & Version Compatibility
  const checkApiHealth = async () => {
    const url = endpointUrlInput.value.trim();
    const apiKey = adminApiKeyInput?.value?.trim() || "";
    endpointBadge.className = "status-badge checking";
    statusText.textContent = "Checking...";

    // 1a. Query dedicated version endpoint for proactive policy check
    try {
      const baseUrl = url.replace(/\/api\/admin\/.*$/, "");
      const versionUrl = `${baseUrl}/api/admin/version`;
      const versionHeaders = {
        "X-Client-Version": EXTENSION_VERSION,
        "X-Client-Tool": EXTENSION_TOOL_NAME,
      };
      if (apiKey) {
        versionHeaders["Authorization"] = `Bearer ${apiKey}`;
        versionHeaders["x-api-key"] = apiKey;
      }

      const vRes = await fetch(versionUrl, { method: "GET", headers: versionHeaders });
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.min_version && isVersionOutdated(EXTENSION_VERSION, vData.min_version)) {
          setVersionLock(true, vData.min_version, vData.download_url, vData.message);
          return false;
        }
      }
    } catch (e) {
      // Continue to OPTIONS probe if version endpoint is unreachable
    }

    // 1b. Probe catalog endpoint with OPTIONS
    try {
      const headers = {
        "X-Client-Version": EXTENSION_VERSION,
        "X-Client-Tool": EXTENSION_TOOL_NAME,
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["x-api-key"] = apiKey;
      }

      const res = await fetch(url, {
        method: "OPTIONS",
        headers,
      });

      // Check exposed header for minimum version
      const serverMinVersion = res.headers.get("x-min-extension-version");
      if (serverMinVersion && isVersionOutdated(EXTENSION_VERSION, serverMinVersion)) {
        setVersionLock(true, serverMinVersion);
        return false;
      }

      if (res.ok || res.status === 200 || res.status === 204) {
        setVersionLock(false);
        endpointBadge.className = "status-badge online";
        statusText.textContent = "Ready";
        return true;
      } else if (res.status === 401) {
        endpointBadge.className = "status-badge offline";
        statusText.textContent = "401 Invalid Key";
        return false;
      } else if (res.status === 426) {
        setVersionLock(true);
        return false;
      } else {
        endpointBadge.className = "status-badge offline";
        statusText.textContent = `HTTP ${res.status}`;
        return false;
      }
    } catch (err) {
      endpointBadge.className = "status-badge offline";
      statusText.textContent = "Offline";
      return false;
    }
  };

  // 2. Extract Data from Current Tab
  const extractFromActiveTab = async () => {
    loadingBox.classList.remove("hidden");
    productForm.classList.add("hidden");

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error("Cannot access active browser tab.");
      }
      currentTabUrl = tab.url || "";

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PRODUCT" }, (response) => {
        loadingBox.classList.add("hidden");
        productForm.classList.remove("hidden");

        if (chrome.runtime.lastError || !response || !response.success) {
          inputTitle.value = tab.title?.split("|")[0]?.split("-")[0]?.trim() || "";
          inputBrand.value = "Retailer";
          inputPrice.value = 0;
          inputImage.value = "";
          selectSlot.value = "top";
          inputColor.value = "Classic";
          updatePreview();
          return;
        }

        const data = response.data;
        inputTitle.value = data.title || "";
        inputBrand.value = data.brand || "Canadian Retailer";
        inputPrice.value = data.price || 0;
        inputImage.value = data.image || "";
        selectSlot.value = data.slot || "top";
        if (selectGender && data.gender_cut) {
          selectGender.value = data.gender_cut;
        }
        inputFabric.value = data.fabric || "";
        inputColor.value = data.color || "Classic";

        updatePreview();
      });
    } catch (err) {
      loadingBox.classList.add("hidden");
      productForm.classList.remove("hidden");
      showToast(err.message, false);
    }
  };

  // Event Listeners for Live Preview
  inputTitle.addEventListener("input", updatePreview);
  inputBrand.addEventListener("input", updatePreview);
  inputPrice.addEventListener("input", updatePreview);
  selectSlot.addEventListener("change", updatePreview);
  if (selectGender) selectGender.addEventListener("change", updatePreview);
  inputImage.addEventListener("input", updatePreview);
  inputHex.addEventListener("input", (e) => {
    hexValueText.textContent = e.target.value;
  });

  // 3. Handle Ingest Button Click
  btnIngest.addEventListener("click", async () => {
    if (isVersionLocked) {
      showToast("⚠️ Extension is deprecated. Please update from Admin Hub.", false);
      return;
    }

    const title = inputTitle.value.trim();
    const brand = inputBrand.value.trim();
    const price = parseFloat(inputPrice.value) || 0;
    const slot = selectSlot.value;
    const genderCut = selectGender ? selectGender.value : "unisex";
    const imageUrl = inputImage.value.trim();
    const fabric = inputFabric.value.trim();
    const color = inputColor.value.trim() || "Classic";
    const hexColor = inputHex.value;
    const targetEndpoint = endpointUrlInput.value.trim();
    const apiKey = adminApiKeyInput?.value?.trim() || "";

    if (!title) {
      showToast("Please enter a product title / name.", false);
      return;
    }

    btnIngest.disabled = true;
    btnIngestText.textContent = "Ingesting...";

    const payload = {
      name: title,
      brand: brand,
      price: price,
      price_cad: price,
      product_url: currentTabUrl || "https://retailer.ca/product",
      retailer_url: currentTabUrl || "https://retailer.ca/product",
      image_url: imageUrl,
      slot: slot,
      gender_cut: genderCut,
      color: color,
      hex_color: hexColor,
      fabric_composition: fabric || "Premium Canadian Fabric Blend",
      budget_tier: price > 200 ? "$$$" : price > 80 ? "$$" : "$",
      client_version: EXTENSION_VERSION,
      client_tool: EXTENSION_TOOL_NAME
    };

    try {
      const headers = {
        "Content-Type": "application/json",
        "X-Client-Version": EXTENSION_VERSION,
        "X-Client-Tool": EXTENSION_TOOL_NAME
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["x-api-key"] = apiKey;
      }

      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      // HTTP 426 Upgrade Required (Phase 1 & Phase 2 Integration)
      if (res.status === 426 || json.error === "VERSION_DEPRECATED") {
        setVersionLock(true, json.min_version || "1.0.5", json.download_url || "/admin", json.message);
        showToast(json.message || "Update Required: Your extension is deprecated.", false);
        return;
      }

      if (json.success) {
        showToast(`✓ Ingested "${title}" into Style Advisor!`, true);
        btnIngestText.textContent = "✓ Ingested Successfully!";
        setTimeout(() => {
          btnIngestText.textContent = "Ingest into Catalog";
          btnIngest.disabled = false;
        }, 2000);
      } else {
        showToast(json.message || "Failed to ingest item.", false);
        btnIngestText.textContent = "Ingest into Catalog";
        btnIngest.disabled = false;
      }
    } catch (err) {
      showToast(`Network Error: ${err.message}`, false);
      btnIngestText.textContent = "Ingest into Catalog";
      btnIngest.disabled = false;
    }
  });

  // Initial startup
  updateEnvButtons(endpointUrlInput.value);
  checkApiHealth();
  extractFromActiveTab();
});
