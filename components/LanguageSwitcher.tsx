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
      {/* English Option: Features Canadian Flag 🇨🇦 per user requirement */}
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs font-medium cursor-pointer ${
          language === "en"
            ? "bg-accent text-white font-semibold shadow-xs"
            : "text-ink-muted hover:text-ink hover:bg-surface/60"
        }`}
        title="English (Canada)"
      >
        <span className="text-sm leading-none" role="img" aria-label="Canadian Flag">
          🇨🇦
        </span>
        <span className="tracking-tight">EN</span>
        <span className="hidden sm:inline-block text-[10px] opacity-80">(CA)</span>
      </button>

      <span className="text-border/60 mx-0.5 select-none">|</span>

      {/* French Option: French Canada */}
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        aria-pressed={language === "fr"}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs font-medium cursor-pointer ${
          language === "fr"
            ? "bg-accent text-white font-semibold shadow-xs"
            : "text-ink-muted hover:text-ink hover:bg-surface/60"
        }`}
        title="Français (Canada)"
      >
        <span className="text-sm leading-none" role="img" aria-label="Fleur-de-lis">
          ⚜️
        </span>
        <span className="tracking-tight">FR</span>
      </button>
    </div>
  );
};
