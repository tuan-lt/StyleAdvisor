"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Footer } from "./Footer";
import { BrandLogo } from "./BrandLogo";

interface LandingPageViewProps {
  onEnterFittingRoom: (flow?: "occasion" | "everyday") => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterFittingRoom }) => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col selection:bg-thread/20">
      {/* 1. TOP EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
          <div className="flex items-center">
            <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          </div>

          <nav className="flex items-center gap-5 sm:gap-6 text-sm font-medium">
            <Link
              href="/about"
              className="text-ink-muted hover:text-ink transition-colors text-xs sm:text-sm font-medium"
            >
              {t.header.about || "About"}
            </Link>

            {/* Language Switcher: EN and FR */}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative flex-1 flex flex-col justify-center overflow-hidden pt-1.5 pb-1 sm:pt-2 sm:pb-1.5 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-2.5 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-[32px] font-serif font-semibold text-ink tracking-tight leading-tight sm:whitespace-nowrap max-w-2xl mx-auto">
            {t.landing.heroTitle}{" "}
            <span className="italic text-thread font-normal">{t.landing.heroTitleHighlight}</span>
          </h1>

          {/* Dual Flow Interactive Image Cards (Aligned with Title Width) */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl mx-auto text-left">
            {/* Card 1: Special */}
            <button
              type="button"
              onClick={() => onEnterFittingRoom("occasion")}
              className="group relative flex flex-col rounded-fitting-lg overflow-hidden border border-border hover:border-accent bg-surface-raised shadow-xs hover:shadow-fitting-card transition-all duration-300 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                <img
                  src="/images/flows/special.jpg"
                  alt={t.landing.cardSpecialTitle}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                    {t.landing.cardSpecialTitle}
                  </h3>
                  <p className="text-[11px] text-white/90 font-sans mt-0.5 leading-snug">
                    {language === "fr"
                      ? "Occasions spéciales : pitchs, entrevues, mariages & soirées."
                      : "High-stakes moments: pitches, interviews, weddings & dinner dates."}
                  </p>
                </div>
              </div>
            </button>

            {/* Card 2: Every */}
            <button
              type="button"
              onClick={() => onEnterFittingRoom("everyday")}
              className="group relative flex flex-col rounded-fitting-lg overflow-hidden border border-border hover:border-accent bg-surface-raised shadow-xs hover:shadow-fitting-card transition-all duration-300 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                <img
                  src="/images/flows/every.jpg"
                  alt={t.landing.cardEveryTitle}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                    {t.landing.cardEveryTitle}
                  </h3>
                  <p className="text-[11px] text-white/90 font-sans mt-0.5 leading-snug">
                    {language === "fr"
                      ? "Capsule modulaire : 15 pièces polyvalentes pour le quotidien."
                      : "Everyday modular capsule: 15 versatile pieces for daily rotation."}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* CTA Button: Find My Look (Without arrow) */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={() => onEnterFittingRoom("occasion")}
              className="w-full sm:w-auto px-9 py-3 rounded-fitting bg-accent hover:bg-accent/90 text-white text-sm font-semibold shadow-fitting-card hover:shadow-fitting-raised transition-all hover:scale-[1.02] cursor-pointer"
            >
              {language === "fr" ? "Trouver Mon Style" : "Find My Look"}
            </button>
          </div>

          {/* Subtitle placed below the CTA button */}
          <p className="pt-1 text-sm sm:text-base text-ink-muted leading-relaxed font-sans max-w-2xl mx-auto">
            {language === "fr" ? (
              <>
                {t.landing.heroSubtitle}{" "}
                <strong className="text-ink font-semibold">{t.landing.heroSubtitleHighlight}</strong>{" "}
                {t.landing.heroSubtitleEnd}
              </>
            ) : (
              <>
                Your personal style advisor tailored to your body shape, best colors, and Canadian weather—recommending only{" "}
                <strong className="text-ink font-semibold">100% real, in-stock clothes</strong> from trusted Canadian brands.
              </>
            )}
          </p>

          {/* Tagline: Unlock your confidence */}
          <p className="text-base sm:text-lg md:text-xl font-serif italic text-thread font-medium pt-1">
            {language === "fr" ? "Libérez votre confiance" : "Unlock your confidence"}
          </p>

          {/* Metric Highlights (3 ô - Mở rộng độ rộng, 2 dòng rõ ràng) */}
          <div className="pt-3.5 sm:pt-4 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto text-center border-t border-border/60">
            <div className="p-2.5 sm:p-3 bg-surface-raised/75 rounded-fitting border border-border/50 shadow-2xs flex flex-col justify-center items-center">
              <div className="text-base sm:text-xl font-serif font-bold text-thread sm:whitespace-nowrap">
                {t.landing.metric1Title}
              </div>
              <div className="text-[10px] sm:text-xs text-ink-muted uppercase tracking-wider mt-0.5 sm:whitespace-nowrap">
                {t.landing.metric1Desc}
              </div>
            </div>
            <div className="p-2.5 sm:p-3 bg-surface-raised/75 rounded-fitting border border-border/50 shadow-2xs flex flex-col justify-center items-center">
              <div className="text-base sm:text-xl font-serif font-bold text-thread sm:whitespace-nowrap">
                {t.landing.metric2Title}
              </div>
              <div className="text-[10px] sm:text-xs text-ink-muted uppercase tracking-wider mt-0.5 sm:whitespace-nowrap">
                {t.landing.metric2Desc}
              </div>
            </div>
            <div className="p-2.5 sm:p-3 bg-surface-raised/75 rounded-fitting border border-border/50 shadow-2xs flex flex-col justify-center items-center">
              <div className="text-base sm:text-xl font-serif font-bold text-thread sm:whitespace-nowrap">
                {t.landing.metric3Title}
              </div>
              <div className="text-[10px] sm:text-xs text-ink-muted uppercase tracking-wider mt-0.5 sm:whitespace-nowrap">
                {t.landing.metric3Desc}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIFIED FOOTER */}
      <Footer />
    </div>
  );
};
