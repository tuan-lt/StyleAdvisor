"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Garment,
  GarmentSlot,
  GenderCut,
  BudgetTier,
  Occasion,
  PaletteSeason,
  BodyType,
  SeasonOfWear,
} from "../../types/catalog";

interface UrlHealth {
  status?: number;
  ok?: boolean;
  message?: string;
  latencyMs?: number;
  isChecking?: boolean;
}

const ALL_SLOTS: GarmentSlot[] = ["outerwear", "top", "bottom", "shoes", "accessory"];
const ALL_GENDER_CUTS: GenderCut[] = ["men", "women", "unisex"];
const ALL_BUDGET_TIERS: BudgetTier[] = ["budget", "mid", "premium", "luxury"];
const ALL_OCCASIONS: Occasion[] = [
  "pitch",
  "work",
  "smart-casual",
  "business-casual",
  "formal",
  "casual",
  "date-night",
  "travel",
  "lounge",
  "outdoor",
];
const ALL_SEASONS: SeasonOfWear[] = ["fall", "winter", "spring", "summer", "all-season"];
const PRIMARY_PALETTES: PaletteSeason[] = ["autumn", "winter", "spring", "summer", "deep_autumn", "true_winter", "soft_autumn"];
const COMMON_BODY_TYPES: BodyType[] = ["athletic", "slim", "average", "hourglass", "rectangle", "tall", "curvy"];

export default function AdminCatalogPage() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [urlHealthMap, setUrlHealthMap] = useState<Record<string, UrlHealth>>({});
  const [isBatchChecking, setIsBatchChecking] = useState<boolean>(false);

  // Extension Ingestion Hub State
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [extensionHealth, setExtensionHealth] = useState<{
    status?: number;
    ok?: boolean;
    message?: string;
    latencyMs?: number;
    isChecking?: boolean;
  }>({ isChecking: false });
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);
  const [newlyIngestedIds, setNewlyIngestedIds] = useState<string[]>([]);
  const [manualJsonInput, setManualJsonInput] = useState<string>("");
  const [isIngestingJson, setIsIngestingJson] = useState<boolean>(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Smart Auto-Fill State
  const [extractUrlInput, setExtractUrlInput] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Form Field State
  const [formData, setFormData] = useState<Partial<Garment>>({
    currency: "CAD",
    gender_cut: "unisex",
    budget_tier: "mid",
    formality_score: 7,
    slot: "top",
    occasions: ["casual"],
    palette_seasons: ["autumn"],
    body_types: ["average"],
    season_of_wear: ["all-season"],
    color: "",
    hex_color: "#2C2C2C",
    fabric: { composition: "", care: "Machine wash cold.", sustainable: false },
    return_policy: { window_days: 30, free_returns: true, policy_note: "Free returns within 30 days." },
    in_stock: true,
  });

  // Test URL in Modal State
  const [testUrlHealth, setTestUrlHealth] = useState<UrlHealth | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check Extension Ingest Endpoint CORS Health
  const checkExtensionEndpointHealth = async () => {
    setExtensionHealth({ isChecking: true });
    const start = Date.now();
    try {
      const res = await fetch("/api/admin/catalog", { method: "OPTIONS" });
      const latencyMs = Date.now() - start;
      const allowOrigin = res.headers.get("access-control-allow-origin") || "*";
      const allowMethods = res.headers.get("access-control-allow-methods") || "GET, POST, OPTIONS";

      if (res.ok || res.status === 200 || res.status === 204) {
        setExtensionHealth({
          status: 200,
          ok: true,
          message: `Ready (CORS ${allowOrigin} • Methods: ${allowMethods})`,
          latencyMs,
          isChecking: false,
        });
      } else {
        setExtensionHealth({
          status: res.status,
          ok: false,
          message: `HTTP ${res.status} Response`,
          latencyMs,
          isChecking: false,
        });
      }
    } catch (err: any) {
      setExtensionHealth({
        status: 500,
        ok: false,
        message: err.message || "Endpoint offline",
        latencyMs: Date.now() - start,
        isChecking: false,
      });
    }
  };

  // Fetch Catalog
  const fetchCatalog = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/admin/catalog");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setGarments((prevGarments) => {
          if (prevGarments.length > 0 && json.data.length > prevGarments.length) {
            const prevIds = new Set(prevGarments.map((g: Garment) => g.id));
            const newItems = json.data.filter((g: Garment) => !prevIds.has(g.id));
            if (newItems.length > 0) {
              const newIds = newItems.map((g: Garment) => g.id);
              setNewlyIngestedIds((prev) => [...prev, ...newIds]);
              showToast(`✨ Ingested ${newItems.length} new item(s) from Extension: "${newItems[0].name}" (${newItems[0].brand})`, "success");
            }
          }
          return json.data;
        });
      } else if (!silent) {
        showToast(json.message || "Failed to load catalog.", "error");
      }
    } catch {
      if (!silent) showToast("Error connecting to catalog API.", "error");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    checkExtensionEndpointHealth();
  }, []);

  // Background Auto-Sync stream for Chrome Extension ingestion
  useEffect(() => {
    if (!isAutoSyncEnabled) return;
    const interval = setInterval(() => {
      fetchCatalog(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoSyncEnabled]);

  // Ping single URL
  const pingGarmentUrl = async (id: string, url: string) => {
    setUrlHealthMap((prev) => ({
      ...prev,
      [id]: { isChecking: true },
    }));

    try {
      const res = await fetch("/api/admin/verify-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setUrlHealthMap((prev) => ({
        ...prev,
        [id]: {
          status: data.status,
          ok: data.ok,
          message: data.message,
          latencyMs: data.latencyMs,
          isChecking: false,
        },
      }));
    } catch {
      setUrlHealthMap((prev) => ({
        ...prev,
        [id]: {
          status: 0,
          ok: false,
          message: "Network request failed",
          isChecking: false,
        },
      }));
    }
  };

  // Batch Ping All URLs
  const handleBatchVerify = async () => {
    setIsBatchChecking(true);
    showToast("Starting live link verification across all catalog items...", "success");

    const BATCH_SIZE = 4;
    for (let i = 0; i < garments.length; i += BATCH_SIZE) {
      const chunk = garments.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map((g) => {
          if (g.product_url) {
            return pingGarmentUrl(g.id, g.product_url);
          }
          return Promise.resolve();
        })
      );
    }

    setIsBatchChecking(false);
    showToast("Link verification complete!", "success");
  };

  // Test URL in Modal
  const handleTestModalUrl = async (urlToTest?: string) => {
    const url = (urlToTest || formData.product_url)?.trim();
    if (!url) {
      setTestUrlHealth({ ok: false, message: "Please enter a product URL first." });
      return;
    }

    setTestUrlHealth({ isChecking: true });
    try {
      const res = await fetch("/api/admin/verify-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setTestUrlHealth({
        status: data.status,
        ok: data.ok,
        message: data.message,
        latencyMs: data.latencyMs,
        isChecking: false,
      });
    } catch {
      setTestUrlHealth({
        status: 0,
        ok: false,
        message: "Failed to ping URL.",
        isChecking: false,
      });
    }
  };

  // Smart Auto-Fill Extraction Handler
  const handleExtractProduct = async (url: string) => {
    const targetUrl = url.trim();
    if (!targetUrl || !targetUrl.startsWith("http")) {
      showToast("Please enter a valid HTTP(S) retailer product link.", "error");
      return;
    }

    setIsExtracting(true);
    try {
      const res = await fetch("/api/admin/extract-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        const extracted: Partial<Garment> = json.data;
        setFormData((prev) => ({
          ...prev,
          ...extracted,
        }));

        handleTestModalUrl(targetUrl);

        showToast(
          `✨ Extracted details for "${extracted.name}" from ${extracted.brand || "retailer"}!`,
          "success"
        );
      } else {
        showToast(json.message || "Failed to auto-extract product info.", "error");
      }
    } catch {
      showToast("Network error while extracting product details.", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  // Manual Test Ingestion from Extension Modal
  const handleManualExtensionIngest = async () => {
    if (!manualJsonInput.trim()) {
      showToast("Please paste a JSON garment payload to test.", "error");
      return;
    }

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(manualJsonInput);
    } catch (err: any) {
      showToast(`Invalid JSON syntax: ${err.message}`, "error");
      return;
    }

    setIsIngestingJson(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "chrome-extension://test-ingest",
        },
        body: JSON.stringify(parsedPayload),
      });
      const json = await res.json();

      if (json.success && json.garment) {
        showToast(`✓ Ingested "${json.garment.name}" via Extension API!`, "success");
        setNewlyIngestedIds((prev) => [...prev, json.garment.id]);
        setManualJsonInput("");
        fetchCatalog();
      } else {
        showToast(json.message || "Failed to ingest item.", "error");
      }
    } catch (err: any) {
      showToast(`Network error: ${err.message}`, "error");
    } finally {
      setIsIngestingJson(false);
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingGarment(null);
    setTestUrlHealth(null);
    setExtractUrlInput("");
    setFormData({
      currency: "CAD",
      gender_cut: "men",
      budget_tier: "mid",
      formality_score: 7,
      slot: "top",
      occasions: ["pitch", "work"],
      palette_seasons: ["autumn"],
      body_types: ["average", "slim"],
      season_of_wear: ["fall", "spring"],
      color: "Classic Navy",
      hex_color: "#1B2A4A",
      fabric: { composition: "100% Cotton", care: "Machine wash cold. Hang dry.", sustainable: false },
      return_policy: { window_days: 30, free_returns: true, policy_note: "Free 30-day in-store or online returns." },
      in_stock: true,
      price: 120,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (garment: Garment) => {
    setEditingGarment(garment);
    setTestUrlHealth(null);
    setExtractUrlInput(garment.product_url || "");
    setFormData({ ...garment });
    setIsModalOpen(true);
  };

  // Delete Garment
  const handleDeleteGarment = async (garment: Garment) => {
    if (!confirm(`Are you sure you want to remove "${garment.name}" (${garment.id}) from the catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/catalog?id=${encodeURIComponent(garment.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Garment removed.", "success");
        setGarments((prev) => prev.filter((g) => g.id !== garment.id));
      } else {
        showToast(json.message || "Failed to delete garment.", "error");
      }
    } catch {
      showToast("Error deleting garment.", "error");
    }
  };

  // Save Garment (POST)
  const handleSaveGarment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success && json.garment) {
        showToast(json.message || "Garment saved successfully!", "success");
        setIsModalOpen(false);
        fetchCatalog();
      } else {
        showToast(json.message || "Failed to save garment.", "error");
      }
    } catch {
      showToast("Network error while saving garment.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Unique Brands
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    garments.forEach((g) => {
      if (g.brand) set.add(g.brand);
    });
    return Array.from(set).sort();
  }, [garments]);

  // Filtered Garments
  const filteredGarments = useMemo(() => {
    return garments.filter((g) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(q);
        const matchesId = g.id.toLowerCase().includes(q);
        const matchesBrand = g.brand.toLowerCase().includes(q);
        const matchesColor = g.color?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesBrand && !matchesColor) return false;
      }

      if (selectedSlot !== "all" && g.slot !== selectedSlot) return false;
      if (selectedBrand !== "all" && g.brand !== selectedBrand) return false;

      if (selectedHealthFilter !== "all") {
        const health = urlHealthMap[g.id];
        if (selectedHealthFilter === "live" && (!health || !health.ok)) return false;
        if (selectedHealthFilter === "broken" && (!health || health.ok)) return false;
        if (selectedHealthFilter === "untested" && health && health.status !== undefined) return false;
      }

      return true;
    });
  }, [garments, searchQuery, selectedSlot, selectedBrand, selectedHealthFilter, urlHealthMap]);

  // Metrics
  const metrics = useMemo(() => {
    const verifiedCount = Object.values(urlHealthMap).filter((h) => h.ok).length;
    const brokenCount = Object.values(urlHealthMap).filter((h) => h.status && !h.ok).length;
    const avgFormality = garments.length > 0
      ? (garments.reduce((acc, g) => acc + (g.formality_score || 0), 0) / garments.length).toFixed(1)
      : "0";

    return {
      total: garments.length,
      brands: uniqueBrands.length,
      verifiedCount,
      brokenCount,
      avgFormality,
    };
  }, [garments, uniqueBrands, urlHealthMap]);

  return (
    <div className="min-h-screen bg-surface text-ink pb-20 selection:bg-thread/20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-fitting shadow-fitting-raised text-xs font-medium flex items-center gap-2.5 transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-verified text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors mr-2"
            >
              <span>←</span> Fitting Room
            </Link>
            <span className="text-border font-light">|</span>
            <div>
              <h1 className="text-base font-serif font-semibold text-ink leading-tight flex items-center gap-2">
                Catalog Management
                {isAutoSyncEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-verified/10 text-verified text-[10px] font-sans font-semibold tracking-wide border border-verified/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-verified animate-ping" />
                    Live Ingest Stream
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-ink-muted hidden sm:block">
                Zero-Hallucination Inventory • Chrome Extension Ingest Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Verify All Links Button */}
            <button
              type="button"
              onClick={handleBatchVerify}
              disabled={isBatchChecking || garments.length === 0}
              className="px-3 py-1.5 rounded-fitting border border-border bg-surface-raised hover:border-thread text-ink text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Verify live link status for all catalog items"
            >
              <span className={isBatchChecking ? "animate-spin" : ""}>🔄</span>
              <span className="hidden sm:inline">{isBatchChecking ? "Pinging..." : "Verify Links"}</span>
            </button>

            {/* Import from Extension Button */}
            <button
              type="button"
              onClick={() => {
                checkExtensionEndpointHealth();
                setIsExtensionModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-fitting border border-thread/40 bg-surface-raised hover:bg-thread/5 text-thread text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>🧩</span>
              <span>Import from Extension</span>
            </button>

            {/* Add New Garment Button */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-3.5 py-1.5 rounded-fitting bg-accent hover:bg-accent/90 text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>+</span>
              <span className="hidden sm:inline">Add Garment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 bg-surface-raised border border-border rounded-fitting shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-thread">Total Garments</div>
            <div className="text-2xl font-serif font-semibold text-ink mt-1">{metrics.total}</div>
            <div className="text-[11px] text-ink-muted mt-0.5">Across 5 wardrobe slots</div>
          </div>

          <div className="p-4 bg-surface-raised border border-border rounded-fitting shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-thread">Partner Brands</div>
            <div className="text-2xl font-serif font-semibold text-ink mt-1">{metrics.brands}</div>
            <div className="text-[11px] text-ink-muted mt-0.5">Canadian Retailers</div>
          </div>

          <div className="p-4 bg-surface-raised border border-border rounded-fitting shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-thread">Live URL Health</div>
            <div className="text-2xl font-serif font-semibold text-verified mt-1">
              {metrics.verifiedCount} <span className="text-xs text-ink-muted font-normal">/ {metrics.total}</span>
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {metrics.brokenCount > 0 ? `${metrics.brokenCount} broken link(s)` : "All verified healthy"}
            </div>
          </div>

          <div className="p-4 bg-surface-raised border border-border rounded-fitting shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-thread">Avg Formality</div>
            <div className="text-2xl font-serif font-semibold text-ink mt-1">{metrics.avgFormality} / 10</div>
            <div className="text-[11px] text-ink-muted mt-0.5">Calibrated balance</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 bg-surface-raised border border-border rounded-fitting shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments by name, brand, color, ID..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-surface border border-border rounded-fitting text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-ink-muted">🔍</span>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Slot */}
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
            >
              <option value="all">All Slots</option>
              {ALL_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Brand */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Health */}
            <select
              value={selectedHealthFilter}
              onChange={(e) => setSelectedHealthFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
            >
              <option value="all">All Link Statuses</option>
              <option value="live">Verified Live (200 / 403)</option>
              <option value="broken">Broken / 404</option>
              <option value="untested">Untested</option>
            </select>

            {(searchQuery || selectedSlot !== "all" || selectedBrand !== "all" || selectedHealthFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSlot("all");
                  setSelectedBrand("all");
                  setSelectedHealthFilter("all");
                }}
                className="text-xs text-thread font-medium hover:underline px-1"
              >
                Reset
              </button>
            )}

            {/* Manual Quick Refresh */}
            <button
              type="button"
              onClick={() => fetchCatalog()}
              className="p-1.5 text-xs rounded-fitting border border-border bg-surface hover:border-thread text-ink-muted hover:text-ink transition-colors"
              title="Refresh Catalog Data"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Garments Table */}
        <div className="bg-surface-raised border border-border rounded-fitting-lg overflow-hidden shadow-fitting-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface/60 text-ink-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-3">Slot / Cut</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3">Price (CAD)</th>
                  <th className="py-3 px-3">Occasions</th>
                  <th className="py-3 px-3">URL Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-muted font-serif italic text-sm">
                      Loading catalog entries...
                    </td>
                  </tr>
                ) : filteredGarments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-muted font-serif italic text-sm">
                      No garments match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredGarments.map((garment) => {
                    const health = urlHealthMap[garment.id];
                    const isNewIngest = newlyIngestedIds.includes(garment.id);

                    return (
                      <tr
                        key={garment.id}
                        className={`hover:bg-surface/30 transition-colors ${
                          isNewIngest ? "bg-accent/5 border-l-4 border-l-accent" : ""
                        }`}
                      >
                        {/* Item Thumbnail & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-14 rounded-fitting overflow-hidden bg-surface border border-border shrink-0 flex items-center justify-center">
                              {garment.image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={garment.image_url}
                                  alt={garment.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-[10px] text-ink-muted font-medium uppercase text-center px-1">
                                  No Img
                                </div>
                              )}
                              <div
                                className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-surface shadow-xs"
                                style={{ backgroundColor: garment.hex_color || "#2C2C2C" }}
                                title={`Color: ${garment.color || "Classic"}`}
                              />
                            </div>
                            <div className="min-w-0 max-w-[240px]">
                              <div className="font-semibold text-ink truncate flex items-center gap-1.5">
                                <span title={garment.name}>{garment.name}</span>
                                {isNewIngest && (
                                  <span className="px-1.5 py-0.2 rounded bg-accent text-white text-[9px] font-bold tracking-wider shrink-0 uppercase">
                                    New Ingest
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-ink-muted font-mono truncate mt-0.5">
                                {garment.id}
                              </div>
                              {garment.verified_date && (
                                <div className="text-[10px] text-thread font-sans mt-0.5">
                                  Ingested: {garment.verified_date}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Slot & Cut */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 bg-surface border border-border rounded text-[10px] font-bold uppercase tracking-wider text-thread">
                              {garment.slot}
                            </span>
                            <div className="text-[11px] text-ink-muted capitalize">
                              {garment.gender_cut} • Formality {garment.formality_score}/10
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="py-3.5 px-3">
                          <span className="font-medium text-ink">{garment.brand}</span>
                          <div className="text-[10px] text-ink-muted uppercase">{garment.budget_tier}</div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-ink">${garment.price}</span>
                          <span className="text-[10px] text-ink-muted ml-1">CAD</span>
                        </td>

                        {/* Occasions */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {garment.occasions?.slice(0, 3).map((occ) => (
                              <span
                                key={occ}
                                className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] text-ink-muted"
                              >
                                {occ}
                              </span>
                            ))}
                            {(garment.occasions?.length || 0) > 3 && (
                              <span className="text-[10px] text-ink-muted">
                                +{garment.occasions.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* URL Status */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            {health?.isChecking ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-accent/10 text-accent font-medium animate-pulse">
                                <span>⏳</span> Checking...
                              </span>
                            ) : health?.status ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  health.ok
                                    ? "bg-verified/15 text-verified border border-verified/30"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}
                                title={health.message}
                              >
                                <span>{health.ok ? "✓" : "✗"}</span>
                                <span>HTTP {health.status}</span>
                                {health.latencyMs && <span className="font-normal opacity-80">({health.latencyMs}ms)</span>}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-surface border border-border rounded text-[10px] text-ink-muted">
                                Untested
                              </span>
                            )}

                            <div className="flex items-center gap-1.5 pt-0.5">
                              <a
                                href={garment.product_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-accent underline hover:opacity-80"
                              >
                                Open ↗
                              </a>
                              <button
                                type="button"
                                onClick={() => pingGarmentUrl(garment.id, garment.product_url)}
                                className="text-[11px] text-ink-muted hover:text-ink underline"
                              >
                                Ping
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(garment)}
                              className="px-2.5 py-1 rounded bg-surface border border-border hover:border-accent text-ink hover:text-accent font-medium text-[11px] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGarment(garment)}
                              className="px-2.5 py-1 rounded bg-surface border border-border hover:border-red-400 text-ink-muted hover:text-red-600 font-medium text-[11px] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-border bg-surface/40 flex items-center justify-between text-[11px] text-ink-muted">
            <span>Showing {filteredGarments.length} of {garments.length} garments</span>
            <span>Zero-Hallucination Verified Canadian Catalog</span>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-surface-raised border border-border rounded-fitting-lg w-full max-w-3xl shadow-fitting-raised my-8 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-border bg-surface/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-semibold text-ink">
                  {editingGarment ? `Edit Garment: ${editingGarment.name}` : "Add New Garment to Catalog"}
                </h2>
                <p className="text-xs text-ink-muted">
                  Persists into <code className="font-mono text-thread">data/catalog.json</code> with strict validation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ink-muted hover:text-ink text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveGarment} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* SMART EXTRACTION CARD (TOP OF MODAL) */}
              <div className="bg-accent/5 border border-accent/30 rounded-fitting-lg p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✨</span>
                    <span className="font-serif font-semibold text-ink text-sm">
                      Smart Auto-Fill from Product URL
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      Time-Saver
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted hidden sm:inline">
                    Aritzia, Kotn, RW&CO, Lululemon, Vessi...
                  </span>
                </div>
                <p className="text-ink-muted text-xs">
                  Paste any Canadian retailer product URL to instantly extract name, price, images, fabric composition, and auto-classify styling tags.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={extractUrlInput}
                    onChange={(e) => setExtractUrlInput(e.target.value)}
                    placeholder="https://www.aritzia.com/en/product/... or https://kotn.com/products/..."
                    className="flex-1 p-2 bg-surface border border-border rounded-fitting text-ink text-xs focus:outline-none focus:border-accent font-mono"
                  />
                  <button
                    type="button"
                    disabled={isExtracting || !extractUrlInput.trim()}
                    onClick={() => handleExtractProduct(extractUrlInput)}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-fitting text-xs font-semibold tracking-wide flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0"
                  >
                    {isExtracting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Auto-Fill Form</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 1: Essential Info */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-thread">1. Core Garment Info</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-ink mb-1">Garment Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Babaton Agency Wool Blazer"
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Partner Brand *</label>
                    <input
                      type="text"
                      required
                      value={formData.brand || ""}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Aritzia, RW&CO, Lululemon, Kotn, Vessi"
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Wardrobe Slot *</label>
                    <select
                      value={formData.slot || "top"}
                      onChange={(e) => setFormData({ ...formData, slot: e.target.value as GarmentSlot })}
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    >
                      {ALL_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Price (CAD) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={formData.price || 0}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-ink mb-1">
                      Deterministic Identifier (ID) <span className="text-ink-muted font-normal">(Leave empty to auto-slugify)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.id || ""}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="e.g. aritzia-agency-blazer-wool"
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink font-mono text-[11px] focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* SECTION 2: URL & Live Health Verifier */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-thread">
                  2. Retailer Product Link & Live Verifier
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">Retailer Verified URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={formData.product_url || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, product_url: e.target.value });
                        setTestUrlHealth(null);
                      }}
                      placeholder="https://www.aritzia.com/en/product/..."
                      className="flex-1 p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleTestModalUrl()}
                      disabled={testUrlHealth?.isChecking}
                      className="px-3 py-2 bg-surface border border-border hover:border-thread text-ink rounded-fitting font-medium transition-all shrink-0 flex items-center gap-1.5"
                    >
                      {testUrlHealth?.isChecking ? "Pinging..." : "Test URL"}
                    </button>
                  </div>

                  {/* Test URL Health Result Display */}
                  {testUrlHealth && (
                    <div
                      className={`mt-2 p-2.5 rounded-fitting border flex items-center justify-between text-xs ${
                        testUrlHealth.ok
                          ? "bg-verified/10 border-verified/30 text-verified"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{testUrlHealth.ok ? "✓" : "⚠️"}</span>
                        <span className="font-semibold">{testUrlHealth.message}</span>
                      </div>
                      {testUrlHealth.status && (
                        <span className="font-mono text-[11px]">HTTP {testUrlHealth.status}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-ink mb-1">Product Image URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.image_url || ""}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Image Preview</label>
                    <div className="w-16 h-20 rounded-fitting border border-border bg-surface overflow-hidden">
                      {formData.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-ink-muted">
                          No image
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* SECTION 3: Style & Calibration */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-thread">3. Style Calibration & Aesthetics</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium text-ink mb-1">Gender / Cut *</label>
                    <select
                      value={formData.gender_cut || "unisex"}
                      onChange={(e) => setFormData({ ...formData, gender_cut: e.target.value as GenderCut })}
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      {ALL_GENDER_CUTS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Budget Tier *</label>
                    <select
                      value={formData.budget_tier || "mid"}
                      onChange={(e) => setFormData({ ...formData, budget_tier: e.target.value as BudgetTier })}
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      {ALL_BUDGET_TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Formality Score (1-10) *</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      required
                      value={formData.formality_score || 7}
                      onChange={(e) => setFormData({ ...formData, formality_score: Number(e.target.value) })}
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Primary Color & Swatch</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.hex_color || "#2C2C2C"}
                        onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                        className="w-8 h-8 rounded border border-border cursor-pointer p-0.5 bg-surface shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.color || ""}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="e.g. Camel, Navy"
                        className="flex-1 p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* SECTION 4: Tagging & Filters */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-thread">4. Compatibility Tagging</div>

                {/* Occasions Multi-Select */}
                <div>
                  <label className="block font-medium text-ink mb-1.5">Occasions *</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_OCCASIONS.map((occ) => {
                      const isSelected = formData.occasions?.includes(occ);
                      return (
                        <button
                          type="button"
                          key={occ}
                          onClick={() => {
                            const list = formData.occasions || [];
                            setFormData({
                              ...formData,
                              occasions: isSelected ? list.filter((item) => item !== occ) : [...list, occ],
                            });
                          }}
                          className={`px-2.5 py-1 rounded-fitting text-xs border transition-all ${
                            isSelected
                              ? "bg-accent text-white border-accent font-medium"
                              : "bg-surface border-border text-ink-muted hover:text-ink"
                          }`}
                        >
                          {occ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Season of Wear */}
                <div>
                  <label className="block font-medium text-ink mb-1.5">Season of Wear *</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SEASONS.map((season) => {
                      const isSelected = formData.season_of_wear?.includes(season);
                      return (
                        <button
                          type="button"
                          key={season}
                          onClick={() => {
                            const list = formData.season_of_wear || [];
                            setFormData({
                              ...formData,
                              season_of_wear: isSelected ? list.filter((item) => item !== season) : [...list, season],
                            });
                          }}
                          className={`px-2.5 py-1 rounded-fitting text-xs border transition-all capitalize ${
                            isSelected
                              ? "bg-thread text-white border-thread font-medium"
                              : "bg-surface border-border text-ink-muted hover:text-ink"
                          }`}
                        >
                          {season}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Palette Seasons */}
                <div>
                  <label className="block font-medium text-ink mb-1.5">Compatible Palette Seasons</label>
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_PALETTES.map((palette) => {
                      const isSelected = formData.palette_seasons?.includes(palette);
                      return (
                        <button
                          type="button"
                          key={palette}
                          onClick={() => {
                            const list = formData.palette_seasons || [];
                            setFormData({
                              ...formData,
                              palette_seasons: isSelected
                                ? list.filter((item) => item !== palette)
                                : [...list, palette],
                            });
                          }}
                          className={`px-2.5 py-1 rounded-fitting text-xs border transition-all ${
                            isSelected
                              ? "bg-surface-raised text-accent border-accent font-semibold"
                              : "bg-surface border-border text-ink-muted hover:text-ink"
                          }`}
                        >
                          {palette.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* SECTION 5: Fabric, Return Policy & Description */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-thread">
                  5. Fabric, Return Terms & Description
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-ink mb-1">Fabric Composition</label>
                    <input
                      type="text"
                      value={formData.fabric?.composition || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fabric: { ...formData.fabric, composition: e.target.value, care: formData.fabric?.care || "" },
                        })
                      }
                      placeholder="e.g. 100% Egyptian Cotton"
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Care Instructions</label>
                    <input
                      type="text"
                      value={formData.fabric?.care || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fabric: { ...formData.fabric, care: e.target.value, composition: formData.fabric?.composition || "" },
                        })
                      }
                      placeholder="e.g. Dry clean only. Steam refresh recommended."
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Return Window (Days)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.return_policy?.window_days || 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          return_policy: {
                            ...formData.return_policy,
                            window_days: Number(e.target.value),
                            free_returns: formData.return_policy?.free_returns || false,
                            policy_note: formData.return_policy?.policy_note || "",
                          },
                        })
                      }
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Return Policy Note</label>
                    <input
                      type="text"
                      value={formData.return_policy?.policy_note || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          return_policy: {
                            ...formData.return_policy,
                            policy_note: e.target.value,
                            window_days: formData.return_policy?.window_days || 30,
                            free_returns: formData.return_policy?.free_returns || false,
                          },
                        })
                      }
                      placeholder="e.g. Free returns in-store or online within 30 days."
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-ink mb-1">Curated Product Description</label>
                    <textarea
                      rows={2}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="High-level silhouette description for stylists..."
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-ink mb-1">Stylist Notes</label>
                    <textarea
                      rows={2}
                      value={formData.styling_notes || ""}
                      onChange={(e) => setFormData({ ...formData, styling_notes: e.target.value })}
                      placeholder="Editorial pairing tips (e.g. Pairs seamlessly with tailored trousers)..."
                      className="w-full p-2 bg-surface border border-border rounded-fitting text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-surface-raised py-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-fitting border border-border text-ink-muted hover:text-ink font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-fitting bg-accent hover:bg-accent/90 text-white font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving to Catalog..." : editingGarment ? "Save Changes" : "Create Garment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chrome Extension Ingestion Hub Modal */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-surface-raised border border-border rounded-fitting-lg w-full max-w-3xl shadow-fitting-raised my-8 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-border bg-surface/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-fitting bg-thread/10 border border-thread/20 flex items-center justify-center text-lg">
                  🧩
                </div>
                <div>
                  <h2 className="text-base font-serif font-semibold text-ink leading-tight flex items-center gap-2">
                    Chrome Extension Ingestion Hub
                    <span className="px-2 py-0.5 rounded-full bg-verified/15 text-verified text-[10px] font-sans font-bold border border-verified/30">
                      CORS & Preflight Active
                    </span>
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Live ingestion endpoint & integration testing for team web scrapers and extensions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(false)}
                className="text-ink-muted hover:text-ink text-lg leading-none p-1.5 rounded hover:bg-surface transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Endpoint Status Card */}
              <div className="p-4 bg-surface border border-border rounded-fitting-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-thread">
                    1. Ingestion Endpoint & CORS Health
                  </div>
                  <button
                    type="button"
                    onClick={checkExtensionEndpointHealth}
                    disabled={extensionHealth.isChecking}
                    className="self-start sm:self-auto text-[11px] text-accent hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                  >
                    <span className={extensionHealth.isChecking ? "animate-spin" : ""}>🔄</span>
                    {extensionHealth.isChecking ? "Pinging..." : "Recheck Health"}
                  </button>
                </div>

                {/* Target URL Box */}
                <div className="flex items-center gap-2 bg-surface-raised p-2 rounded-fitting border border-border font-mono text-[11px]">
                  <span className="text-thread font-bold uppercase text-[9px] bg-thread/10 px-1.5 py-0.5 rounded">
                    POST
                  </span>
                  <span className="flex-1 text-ink select-all truncate">
                    {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
                    /api/admin/catalog
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${
                        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
                      }/api/admin/catalog`;
                      navigator.clipboard.writeText(url);
                      setCopiedEndpoint(true);
                      showToast("Copied endpoint URL to clipboard!", "success");
                      setTimeout(() => setCopiedEndpoint(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-surface border border-border hover:border-accent text-ink hover:text-accent font-sans text-[11px] font-semibold transition-colors shrink-0"
                  >
                    {copiedEndpoint ? "✓ Copied" : "Copy URL"}
                  </button>
                </div>

                {/* Live Status Badge */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-fitting text-xs font-semibold ${
                      extensionHealth.ok
                        ? "bg-verified/15 text-verified border border-verified/30"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${extensionHealth.ok ? "bg-verified animate-ping" : "bg-red-500"}`} />
                    <span>{extensionHealth.ok ? "Endpoint Ready & Accepting Extension POSTs" : "Endpoint Offline"}</span>
                    {extensionHealth.latencyMs !== undefined && (
                      <span className="font-normal opacity-80 text-[10px]">({extensionHealth.latencyMs}ms)</span>
                    )}
                  </div>

                  <span className="text-[11px] text-ink-muted">
                    Origins: <code className="font-mono text-thread">*</code> • Methods: <code className="font-mono text-thread">OPTIONS, POST, GET</code>
                  </span>
                </div>
              </div>

              {/* Instructions for Team */}
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-fitting-lg space-y-2.5">
                <div className="font-semibold text-ink text-xs flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Quick Setup Guide for Teammates (Zoe & Peter)</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-ink-muted leading-relaxed pl-1">
                  <li>
                    <strong className="text-ink">Target URL:</strong> Configure your Chrome Extension to send HTTP <code className="text-ink font-mono font-semibold">POST</code> requests to <code className="text-accent font-mono font-semibold">http://localhost:3000/api/admin/catalog</code> (Local) or <code className="text-accent font-mono font-semibold">https://StyleAdvisor.online/api/admin/catalog</code> (Production).
                  </li>
                  <li>
                    <strong className="text-ink">Preflight (CORS):</strong> The backend responds to browser preflight (<code className="text-ink font-mono">OPTIONS</code>) with status <code className="text-ink font-mono">200</code> and wildcards, so you don&apos;t need custom headers or proxying.
                  </li>
                  <li>
                    <strong className="text-ink">Payload Schema:</strong> Send either standard fields (<code className="text-ink font-mono">name, brand, price, product_url, image_url, slot</code>) or extension shortcuts (<code className="text-ink font-mono">title, vendor, url, image</code>). Any missing optional tags are safely defaulted.
                  </li>
                  <li>
                    <strong className="text-ink">Instant Visual Feedback:</strong> Ingested garments automatically receive a <code className="text-accent font-semibold font-mono">ca_[brand]_[random]</code> deterministic ID, today&apos;s <code className="text-ink font-mono">verified_date</code>, and pop up with a highlighted row and banner.
                  </li>
                </ul>
              </div>

              {/* Live Auto-Sync Stream Setting */}
              <div className="p-4 bg-surface border border-border rounded-fitting-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink flex items-center gap-2">
                    <span>Live Auto-Sync Stream</span>
                    {isAutoSyncEnabled ? (
                      <span className="px-2 py-0.5 rounded-full bg-verified/15 text-verified text-[10px] font-bold">Active (4s poll)</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border text-ink-muted text-[10px]">Paused</span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Automatically pull freshly ingested garments into the catalog table in the background.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
                  className={`px-3 py-1.5 rounded-fitting font-medium text-xs border transition-all ${
                    isAutoSyncEnabled
                      ? "bg-verified text-white border-verified shadow-xs"
                      : "bg-surface border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {isAutoSyncEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Interactive Ingestion Tester */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-thread">
                    2. Test Ingestion Payload
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-ink-muted">Samples:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setManualJsonInput(
                          JSON.stringify(
                            {
                              title: "The Effortless Pant™ Crepe",
                              vendor: "Aritzia",
                              price: 148,
                              url: "https://www.aritzia.com/en/product/the-effortless-pant/72574.html",
                              image:
                                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
                              slot: "bottom",
                              fabric_composition: "100% Japanese Crepe Polyester",
                              color: "Birch White",
                              hex_color: "#F2EFE9",
                            },
                            null,
                            2
                          )
                        )
                      }
                      className="px-2 py-0.5 rounded bg-surface border border-border hover:border-accent text-ink text-[10px] transition-colors"
                    >
                      Aritzia Pant
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setManualJsonInput(
                          JSON.stringify(
                            {
                              title: "Double-Knit High-Rise Pant",
                              vendor: "Lululemon",
                              price: 158,
                              url: "https://shop.lululemon.com/en-ca/p/double-knit-high-rise-pant/kpaqmttv5x",
                              image: "",
                              slot: "bottom",
                              fabric_composition: "60% Cotton, 35% Polyester, 5% Elastane",
                              color: "Black",
                              hex_color: "#111111",
                            },
                            null,
                            2
                          )
                        )
                      }
                      className="px-2 py-0.5 rounded bg-surface border border-border hover:border-accent text-ink text-[10px] transition-colors"
                    >
                      Lululemon Knit
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={manualJsonInput}
                  onChange={(e) => setManualJsonInput(e.target.value)}
                  placeholder={`{\n  "title": "Double-Knit High-Rise Pant",\n  "vendor": "Lululemon",\n  "price": 158,\n  "url": "https://shop.lululemon.com/...",\n  "image": ""\n}`}
                  className="w-full p-3 bg-surface border border-border rounded-fitting text-ink font-mono text-[11px] focus:outline-none focus:border-accent leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-ink-muted">
                    Simulates a cross-origin JSON POST from Chrome Extension.
                  </span>
                  <button
                    type="button"
                    onClick={handleManualExtensionIngest}
                    disabled={isIngestingJson || !manualJsonInput.trim()}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-fitting text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isIngestingJson ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Ingest...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Send Test Ingestion</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-between text-xs">
              <span className="text-ink-muted text-[11px]">
                Endpoint: <code className="font-mono text-thread">/api/admin/catalog</code> (POST & OPTIONS)
              </span>
              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(false)}
                className="px-4 py-1.5 rounded-fitting bg-surface border border-border hover:border-ink-muted text-ink font-medium transition-colors"
              >
                Close Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
