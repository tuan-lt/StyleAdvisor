"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-2 sm:py-2.5 bg-surface-dark text-white/70 text-xs border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white font-serif font-bold text-base hover:text-thread transition-colors">
            {t.common.brandName}
          </Link>
          <span className="text-white/40">|</span>
          <span className="text-[11px] text-white/60">
            © 2026 Style Advisor · ProductBC Build-a-Thon Demo
          </span>
        </div>

        <div className="text-xs text-white/60 font-medium">
          {t.landing.footerPrivacy || "Privacy Friendly"}
        </div>
      </div>
    </footer>
  );
};
