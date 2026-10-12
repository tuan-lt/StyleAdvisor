"use client";

import React from "react";
import { useLanguage } from "../lib/LanguageContext";

interface TrustLandingBlockProps {
  onStartStyling?: () => void;
}

export const TrustLandingBlock: React.FC<TrustLandingBlockProps> = ({ onStartStyling }) => {
  const { t } = useLanguage();

  return (
    <section className="mb-10 animate-fadeIn">
      {/* Hero Badge & Mission Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-surface-raised to-surface border border-border rounded-fitting-lg p-6 sm:p-10 shadow-fitting-raised">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-thread/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 rounded-full bg-verified/5 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-ink tracking-tight leading-[1.2] max-w-2xl mx-auto">
            {t.landing.heroTitle}{" "}
            <span className="italic text-thread">{t.landing.heroTitleHighlight}</span>
            {t.landing.heroTitleEnd}
          </h1>

          <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-sans max-w-2xl mx-auto">
            {t.landing.heroSubtitle}{" "}
            <strong className="text-ink font-semibold">{t.landing.heroSubtitleHighlight}</strong>{" "}
            {t.landing.heroSubtitleEnd}
          </p>

          {onStartStyling && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onStartStyling}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-fitting bg-accent hover:bg-accent/90 text-white text-sm font-semibold shadow-fitting-card hover:shadow-fitting-raised transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>✨ {t.header.startStyling}</span>
                <span>↓</span>
              </button>
            </div>
          )}
        </div>

        {/* 3 Value Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 pt-8 border-t border-border/80">
          {/* Pillar 1: Save Time */}
          <div className="group bg-surface/50 hover:bg-surface-raised border border-border/80 hover:border-accent/40 rounded-fitting-lg p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-fitting-card">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-fitting bg-thread/15 text-thread flex items-center justify-center text-lg font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-thread block">
                    {t.landing.pillar1Tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-ink group-hover:text-accent transition-colors">
                    {t.landing.pillar1Title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                {t.landing.pillar1Desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-ink font-medium flex items-center gap-1.5">
              <span className="text-verified font-bold">✓</span> {t.landing.pillar1Bullet1}
            </div>
          </div>

          {/* Pillar 2: Save Cost */}
          <div className="group bg-surface/50 hover:bg-surface-raised border border-border/80 hover:border-accent/40 rounded-fitting-lg p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-fitting-card">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-fitting bg-verified/15 text-verified flex items-center justify-center text-lg font-bold shrink-0">
                  💰
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-verified block">
                    {t.landing.pillar2Tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-ink group-hover:text-accent transition-colors">
                    {t.landing.pillar2Title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                {t.landing.pillar2Desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-ink font-medium flex items-center gap-1.5">
              <span className="text-verified font-bold">✓</span> {t.landing.pillar2Bullet2}
            </div>
          </div>

          {/* Pillar 3: Real 100% */}
          <div className="group bg-surface/50 hover:bg-surface-raised border border-border/80 hover:border-accent/40 rounded-fitting-lg p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-fitting-card">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-fitting bg-accent/15 text-accent flex items-center justify-center text-lg font-bold shrink-0">
                  🛡️
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent block">
                    {t.landing.pillar3Tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-ink group-hover:text-accent transition-colors">
                    {t.landing.pillar3Title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                {t.landing.pillar3Desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-ink font-medium flex items-center gap-1.5">
              <span className="text-verified font-bold">✓</span> {t.landing.pillar3Bullet1}
            </div>
          </div>
        </div>

        {/* Social Proof & Trust Badges */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{t.landing.brandsTitle}:</span>
            <span className="font-medium text-thread">RW&CO • Lululemon • Aritzia • Kotn • Frank And Oak • Vessi</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="text-verified font-bold">●</span> {t.landing.footerPrivacy}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-verified font-bold">●</span> {t.landing.footerWeather}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
