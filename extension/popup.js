/**
 * Style Advisor - Chrome Extension Popup Logic
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
  const btnIngest = document.getElementById("btnIngest");
  const btnIngestText = document.getElementById("btnIngestText");
  const toastMessage = document.getElementById("toastMessage");

  let currentTabUrl = "";

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
    try {
      const res = await fetch(url, { method: "OPTIONS" });
      if (res.ok || res.status === 200 || res.status === 204) {
        endpointBadge.className = "status-badge online";
        statusText.textContent = "Online";
        return true;
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
          // Fallback if content script not loaded or generic page
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
      product_url: currentTabUrl || "https://retailer.ca/product",
      image_url: imageUrl,
      slot: slot,
      color: color,
      hex_color: hexColor,
      fabric_composition: fabric || "Premium Fabric Blend",
      gender_cut: "unisex",
      budget_tier: price > 200 ? "luxury" : price > 80 ? "mid" : "budget"
    };

    try {
      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
  checkApiHealth();
  extractFromActiveTab();
});
