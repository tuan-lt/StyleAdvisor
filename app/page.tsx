"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProfileStorage } from "../lib/useProfileStorage";
import { SharedProfile } from "../components/SharedProfile";
import { OccasionResult } from "../components/OccasionResult";
import { CapsuleResult } from "../components/CapsuleResult";
import { SharedCart } from "../components/SharedCart";
import { CheckoutModal } from "../components/CheckoutModal";
import { Garment, Occasion, RecommendApiResponse, NudgeType } from "../types/catalog";

type ViewState = "profile" | "result";

export default function Home() {
  const { profile, isLoaded, updateProfile, toggleOwnedItem } = useProfileStorage();
  const [occasion, setOccasion] = useState<Occasion>("pitch");
  const [audienceText, setAudienceText] = useState<string>("Pitching Seed Fund in Gastown to local tech VCs");
  const [flow, setFlow] = useState<"occasion" | "everyday">("occasion");
  const [viewState, setViewState] = useState<ViewState>("profile");

  const [recommendationData, setRecommendationData] = useState<RecommendApiResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNudging, setIsNudging] = useState<boolean>(false);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);

  // Cart state
  const [cartItems, setCartItems] = useState<Garment[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const fetchRecommendation = async (
    formalityOverride?: number,
    nudge?: NudgeType
  ) => {
    if (nudge) {
      setIsNudging(true);
    } else {
      setIsLoading(true);
    }
    try {
      const payload = {
        user_profile: profile,
        occasion,
        audience_text: audienceText,
        flow,
        formality_target: formalityOverride,
        nudge,
      };

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: RecommendApiResponse = await res.json();
      if (json.success && json.data) {
        setRecommendationData(json.data);
        setViewState("result");
      } else {
        alert(json.message || "Failed to generate recommendation. Please retry.");
      }
    } catch (e: any) {
      console.error("Failed to fetch recommendation:", e);
      alert("Network error or timeout. Engaging fallback.");
    } finally {
      setIsLoading(false);
      setIsNudging(false);
    }
  };

  const handleNudge = async (nudgeType: NudgeType) => {
    const currentFormality = recommendationData?.calibration.formality_target || 7;
    let targetFormality = currentFormality;

    if (nudgeType === "too_formal") {
      targetFormality = Math.max(3, currentFormality - 2);
    } else if (nudgeType === "too_casual") {
      targetFormality = Math.min(10, currentFormality + 2);
    } else if (nudgeType === "not_me") {
      targetFormality = currentFormality;
    }

    await fetchRecommendation(targetFormality, nudgeType);
  };

  const handleReplanCapsule = () => {
    setIsReplanning(true);
    setTimeout(() => {
      setIsReplanning(false);
    }, 600);
  };

  // Cart Handlers
  const handleAddToCart = (garment: Garment) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.id === garment.id)) return prev;
      return [...prev, garment];
    });
    setIsCartOpen(true);
  };

  const handleAddAllToCart = (garments: Garment[]) => {
    setCartItems((prev) => {
      const existingIds = new Set(prev.map((g) => g.id));
      const newItems = garments.filter((g) => !existingIds.has(g.id));
      return [...prev, ...newItems];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (garmentId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== garmentId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-ink-muted text-sm font-serif">
        Loading Fitting Room profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-thread/20">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewState("profile")}
              className="text-left group"
            >
              <span className="text-xs uppercase tracking-widest text-thread font-bold block">
                The Fitting Room
              </span>
              <span className="text-lg font-serif text-ink font-semibold group-hover:text-accent transition-colors">
                Style Advisor
              </span>
            </button>
            <span className="hidden sm:inline-block text-border font-light">|</span>
            <span className="hidden sm:inline-block text-xs text-ink-muted">
              Zero-Hallucination Canadian Wardrobe
            </span>
          </div>

          <div className="flex items-center gap-4">
            {viewState === "result" && (
              <button
                type="button"
                onClick={() => setViewState("profile")}
                className="text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
              >
                Edit Profile
              </button>
            )}

            <Link
              href="/admin"
              className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
              title="Internal Catalog Management"
            >
              Admin
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-fitting bg-surface-raised border border-border hover:border-thread/50 text-ink text-xs font-medium flex items-center gap-2 shadow-xs transition-all"
            >
              <span>Fitting Bag</span>
              <span className="w-5 h-5 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8">
        {viewState === "profile" ? (
          <SharedProfile
            profile={profile}
            onUpdate={updateProfile}
            occasion={occasion}
            onOccasionChange={setOccasion}
            audienceText={audienceText}
            onAudienceChange={setAudienceText}
            flow={flow}
            onFlowChange={setFlow}
            onSubmit={() => fetchRecommendation()}
            isLoading={isLoading}
          />
        ) : flow === "occasion" && recommendationData ? (
          <OccasionResult
            data={recommendationData}
            onNudge={handleNudge}
            onToggleOwned={toggleOwnedItem}
            ownedItemIds={profile.owned_item_ids || []}
            onAddToCart={handleAddToCart}
            onAddAllToCart={handleAddAllToCart}
            cartItemIds={cartItems.map((g) => g.id)}
            onBackToEdit={() => setViewState("profile")}
            isNudging={isNudging}
          />
        ) : (
          <CapsuleResult
            ownedItemIds={profile.owned_item_ids || []}
            onToggleOwned={toggleOwnedItem}
            onAddToCart={handleAddToCart}
            onAddAllToCart={handleAddAllToCart}
            cartItemIds={cartItems.map((g) => g.id)}
            onBackToEdit={() => setViewState("profile")}
            onReplanCapsule={handleReplanCapsule}
            isReplanning={isReplanning}
          />
        )}
      </main>

      {/* Shared Cart Sliding Drawer */}
      <SharedCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal with 1 WTP Question */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        initialEmail={profile.email}
      />

      {/* Footer */}
      <footer className="border-t border-border bg-surface/40 py-8 text-center text-xs text-ink-muted space-y-2">
        <p className="font-serif italic text-sm text-ink">
          &ldquo;The AI is allowed to have taste, but not facts.&rdquo;
        </p>
        <p>
          Curated across Canadian retailers: Aritzia, RW&CO, Lululemon, Kotn, and Vessi.
        </p>
      </footer>
    </div>
  );
}
