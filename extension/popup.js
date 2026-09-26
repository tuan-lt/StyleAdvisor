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

  // Form inputs
  const inputTitle = document.getElementById("inputTitle");
  const inputBrand = document.getElementById("inputBrand");
  const inputPrice = document.getElementById("inputPrice");
  const selectSlot = document.getElementById("selectSlot");
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

  // 1. Check API Health
  const checkApiHealth = async () => {
    const url = endpointUrlInput.value.trim();
    const apiKey = adminApiKeyInput?.value?.trim() || "";
    endpointBadge.className = "status-badge checking";
    statusText.textContent = "Checking...";

    try {
      const headers = {};
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["x-api-key"] = apiKey;
      }

      const res = await fetch(url, {
        method: "OPTIONS",
        headers
      });

      if (res.ok || res.status === 200 || res.status === 204) {
        endpointBadge.className = "status-badge online";
        statusText.textContent = "Ready";
        return true;
      } else if (res.status === 401) {
        endpointBadge.className = "status-badge offline";
        statusText.textContent = "401 Invalid Key";
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
  inputImage.addEventListener("input", updatePreview);
  inputHex.addEventListener("input", (e) => {
    hexValueText.textContent = e.target.value;
  });

  // 3. Handle Ingest Button Click
  btnIngest.addEventListener("click", async () => {
    const title = inputTitle.value.trim();
    const brand = inputBrand.value.trim();
    const price = Number(inputPrice.value) || 0;
    const slot = selectSlot.value;
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
      color: color,
      hex_color: hexColor,
      fabric_composition: fabric || "Premium Canadian Fabric Blend",
      gender_cut: "unisex",
      budget_tier: price > 200 ? "$$$" : price > 80 ? "$$" : "$"
    };

    try {
      const headers = {
        "Content-Type": "application/json"
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
