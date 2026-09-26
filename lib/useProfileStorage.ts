"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "../types/catalog";

const STORAGE_KEY = "style_advisor_profile_v4_2";

/**
 * Default profile configured strictly for Persona Sam (31, Founder pitching VCs in Gastown)
 * per PRD v4.2 Section 1 (OPEN-2) & Section 3.1
 */
export const DEFAULT_PROFILE: UserProfile = {
  // 1. Gender expression (Female · Neutral · Male)
  gender_expression: "Male",
  gender_cut: "male",

  // 2. Budget ($ · $$ · $$$)
  budget: "$$",
  budget_tier: "$$",

  // 3. Size (XS to XXL)
  size: "M",

  // 4. Body Type (5 neutral silhouettes + Not sure)
  body_type: "rectangle",

  // 5. Seasonal Colour (4-season wheel + Not sure)
  seasonal_colour: "autumn",
  palette_season: "autumn",

  // 6. Complexion (Dark · Medium · Light)
  complexion: "medium",

  // 7. Style (Casual · Sporty · Classic · Nerdy · Trendy · Fabulous)
  style: "classic",
  preferred_styles: ["classic"],

  // 8. Season or Climate (Spring/Summer · Fall/Winter)
  season_or_climate: "Fall/Winter",
  season_of_wear: "fall_winter",

  // 9. Lifestyle (Multi-select up to 2: New Grad, Family, Outdoors, Office Professional)
  lifestyle: ["office_professional"],
  lifestyle_tags: ["office_professional"],

  // Wardrobe checklist & pilot access
  owned_item_ids: [],
  email: "",
};

export function useProfileStorage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed to load profile from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Update profile and persist to localStorage
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save profile to localStorage:", e);
      }
      return next;
    });
  }, []);

  // Toggle owned garment ID for the "I Already Have This" feature
  const toggleOwnedItem = useCallback((garmentId: string) => {
    setProfile((prev) => {
      const current = new Set(prev.owned_item_ids || []);
      if (current.has(garmentId)) {
        current.delete(garmentId);
      } else {
        current.add(garmentId);
      }
      const updated = { ...prev, owned_item_ids: Array.from(current) };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save owned items to localStorage:", e);
      }
      return updated;
    });
  }, []);

  // Reset to defaults
  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to reset localStorage:", e);
    }
  }, []);

  return {
    profile,
    isLoaded,
    updateProfile,
    toggleOwnedItem,
    resetProfile,
  };
}
