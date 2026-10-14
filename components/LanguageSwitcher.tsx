"use client";

import React from "react";
import { useLanguage } from "../lib/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "compact" | "dropdown";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "pill",
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center bg-surface-raised/90 backdrop-blur-xs border border-border rounded-fitting p-0.5 shadow-xs transition-all ${className}`}
      role="group"
      aria-label="Language selection"
    >
      {/* English Option */}
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`px-3 py-1 rounded transition-all text-xs font-semibold cursor-pointer ${
          language === "en"
            ? "bg-accent text-white shadow-xs"
            : "text-ink-muted hover:text-ink hover:bg-surface/60"
        }`}
        title="English"
      >
        EN
      </button>

      <span className="text-border/60 mx-0.5 select-none text-xs">|</span>

      {/* French Option */}
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        aria-pressed={language === "fr"}
        className={`px-3 py-1 rounded transition-all text-xs font-semibold cursor-pointer ${
          language === "fr"
            ? "bg-accent text-white shadow-xs"
            : "text-ink-muted hover:text-ink hover:bg-surface/60"
        }`}
        title="Français"
      >
        FR
      </button>
    </div>
  );
};
