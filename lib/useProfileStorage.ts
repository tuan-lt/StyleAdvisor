"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile, GenderCut, BudgetTier, BodyType, PaletteSeason, SeasonOfWear } from "../types/catalog";

const STORAGE_KEY = "style_advisor_profile_v1";

export const DEFAULT_PROFILE: UserProfile = {
  gender_cut: "men",
  budget_tier: ["mid", "premium"],
  body_type: "athletic",
  palette_season: "autumn",
  preferred_styles: ["Tailored Minimal", "Smart Casual"],
  lifestyle_tags: ["Tech / Startups", "Travel", "Coffee Meetings"],
  season_of_wear: "fall",
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

  // Toggle owned garment ID
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
