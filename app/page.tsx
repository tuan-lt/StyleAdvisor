"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useProfileStorage } from "../lib/useProfileStorage";
import { SharedProfile } from "../components/SharedProfile";
import { MultiStepProfile } from "../components/MultiStepProfile";
import { OccasionResult } from "../components/OccasionResult";
import { CapsuleResult } from "../components/CapsuleResult";
import { SharedCart } from "../components/SharedCart";
import { CheckoutModal } from "../components/CheckoutModal";
import { LandingPageView } from "../components/LandingPageView";
import { Garment, Occasion, RecommendApiResponse, NudgeType } from "../types/catalog";
import { useLanguage } from "../lib/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Footer } from "../components/Footer";
import { BrandLogo } from "../components/BrandLogo";

type ViewState = "landing" | "profile" | "result";

export default function Home() {
  const { language, t } = useLanguage();
  const { profile, isLoaded, updateProfile, toggleOwnedItem } = useProfileStorage();
  const [occasion, setOccasion] = useState<Occasion>("pitch");
  const [audienceText, setAudienceText] = useState<string>("Seed fund, partners are ex-engineers, meeting at their office in Gastown");
  const [flow, setFlow] = useState<"occasion" | "everyday">("occasion");
  const [viewState, setViewState] = useState<ViewState>("landing");
  const [profileMode, setProfileMode] = useState<"wizard" | "single">("wizard");

  const [recommendationData, setRecommendationData] = useState<RecommendApiResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [isNudging, setIsNudging] = useState<boolean>(false);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);

  // Cart state
  const [cartItems, setCartItems] = useState<Garment[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Progressive loading text sequence per PRD Section 7.3
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev === 1 ? 2 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const [nudgeIteration, setNudgeIteration] = useState<number>(0);

  const fetchRecommendation = async (
    formalityOverride?: number,
    nudge?: NudgeType,
    excludedIds?: string[],
    iterationOverride?: number
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
        owned_item_ids: profile.owned_item_ids,
        excluded_garment_ids: excludedIds || [],
        iteration: iterationOverride !== undefined ? iterationOverride : (nudge ? nudgeIteration : 0),
        locale: language,
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
    const nextIteration = nudgeIteration + 1;
    setNudgeIteration(nextIteration);

    const currentFormality = recommendationData?.calibration.formality_score || 4;
    let targetFormality = currentFormality;

    if (nudgeType === "too_formal") {
      targetFormality = Math.max(2, currentFormality - 1);
    } else if (nudgeType === "too_casual") {
      targetFormality = Math.min(5, currentFormality + 1);
    } else if (nudgeType === "not_me") {
      targetFormality = currentFormality;
    }

    // Capture currently displayed garment IDs to exclude them from the next recommendation
    const currentGarmentIds = Object.values(recommendationData?.selected_garment_ids || {}).filter(Boolean) as string[];

    await fetchRecommendation(targetFormality, nudgeType, currentGarmentIds, nextIteration);
  };

  const [capsuleIteration, setCapsuleIteration] = useState<number>(0);

  const handleReplanCapsule = async () => {
    const nextIteration = capsuleIteration + 1;
    setCapsuleIteration(nextIteration);
    setIsReplanning(true);
    try {
      await fetchRecommendation(undefined, undefined, undefined, nextIteration);
    } finally {
      setIsReplanning(false);
    }
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
        {t.loading.loadingProfile}
      </div>
    );
  }

  if (viewState === "landing") {
    return (
      <>
        <LandingPageView
          onEnterFittingRoom={(chosenFlow) => {
            if (chosenFlow) setFlow(chosenFlow);
            setViewState("profile");
          }}
        />

        {/* Shared Slide-over Cart (De-duplicated) */}
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

        {/* Checkout & WTP Survey Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          initialEmail={profile.email}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-thread/20">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
          <div className="flex items-center">
            <BrandLogo
              onClick={() => {
                setViewState("landing");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          <div className="flex items-center gap-3">

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-fitting text-ink hover:bg-surface-raised border border-border transition-all flex items-center gap-1.5 cursor-pointer"
              aria-label="Open Cart"
            >
              <span className="text-xs font-semibold">{t.common.shoppingBag}</span>
              {cartItems.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Language Switcher in Top Right Corner */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-6">
        {/* Progressive Loading Feedback */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <p className="font-serif text-lg text-ink font-medium">
                {loadingStep === 1
                  ? t.loading.step1
                  : flow === "occasion"
                  ? t.loading.step2Occasion
                  : t.loading.step2Capsule}
              </p>
              <p className="text-xs text-ink-muted">
                {t.loading.subtitle}
              </p>
            </div>
          </div>
        )}

        {viewState === "profile" ? (
          <div>
            {profileMode === "wizard" ? (
              <MultiStepProfile
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
            ) : (
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
            )}
          </div>
        ) : flow === "occasion" && recommendationData ? (
          <OccasionResult
            data={recommendationData}
            onNudge={handleNudge}
            onToggleOwned={toggleOwnedItem}
            ownedItemIds={profile.owned_item_ids || []}
            onAddToCart={handleAddToCart}
            onAddAllToCart={handleAddAllToCart}
            cartItemIds={cartItems.map((i) => i.id)}
            onBackToEdit={() => setViewState("profile")}
            isNudging={isNudging}
          />
        ) : (
          <CapsuleResult
            profile={profile}
            ownedItemIds={profile.owned_item_ids || []}
            onToggleOwned={toggleOwnedItem}
            onAddToCart={handleAddToCart}
            onAddAllToCart={handleAddAllToCart}
            cartItemIds={cartItems.map((i) => i.id)}
            onBackToEdit={() => setViewState("profile")}
            onReplanCapsule={handleReplanCapsule}
            isReplanning={isReplanning}
            capsuleAiData={recommendationData?.capsule}
          />
        )}
      </main>

      {/* Shared Slide-over Cart (De-duplicated) */}
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

      {/* Checkout & WTP Survey Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        initialEmail={profile.email}
      />

      {/* UNIFIED FOOTER */}
      <Footer />
    </div>
  );
}
