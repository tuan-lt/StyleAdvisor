"use client";

import React from "react";
import { useLanguage } from "../lib/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface LandingPageViewProps {
  onEnterFittingRoom: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterFittingRoom }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-between selection:bg-thread/20">
      {/* 1. TOP EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-thread font-bold block">
              {t.common.tagline}
            </span>
            <span className="hidden sm:inline-block text-border font-light">|</span>
            <span className="text-lg font-serif text-ink font-semibold">
              {t.common.brandName}
            </span>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
            <a href="#value-pillars" className="text-ink-muted hover:text-ink transition-colors hidden md:inline-block">
              {t.header.whyLoveIt}
            </a>
            <a href="#how-it-works" className="text-ink-muted hover:text-ink transition-colors hidden md:inline-block">
              {t.header.howItWorks}
            </a>
            <a href="#retailers" className="text-ink-muted hover:text-ink transition-colors hidden sm:inline-block">
              {t.header.popularBrands}
            </a>
            <button
              type="button"
              onClick={onEnterFittingRoom}
              className="px-4 py-2 rounded-fitting bg-accent hover:bg-accent/90 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              {t.header.startStyling}
            </button>

            {/* Language Switcher in Top Right Corner */}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/80 bg-gradient-to-b from-surface to-surface-raised">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-thread/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-verified/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-ink tracking-tight leading-[1.25] max-w-2xl mx-auto">
            {t.landing.heroTitle}{" "}
            <span className="italic text-thread font-normal">{t.landing.heroTitleHighlight}</span>
            {t.landing.heroTitleEnd}
          </h1>

          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans max-w-2xl mx-auto">
            {t.landing.heroSubtitle}{" "}
            <strong className="text-ink font-semibold">{t.landing.heroSubtitleHighlight}</strong>{" "}
            {t.landing.heroSubtitleEnd}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onEnterFittingRoom}
              className="w-full sm:w-auto px-8 py-3.5 rounded-fitting bg-accent hover:bg-accent/90 text-white text-sm font-semibold shadow-fitting-card hover:shadow-fitting-raised transition-all hover:scale-[1.02] cursor-pointer"
            >
              {t.landing.tryFittingRoom}
            </button>
            <a
              href="#value-pillars"
              className="w-full sm:w-auto px-6 py-3.5 rounded-fitting border border-border bg-surface hover:bg-surface-raised text-ink text-sm font-medium transition-all"
            >
              {t.landing.whyPeopleLoveIt}
            </a>
          </div>

          {/* Metric Highlights */}
          <div className="pt-10 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center border-t border-border/60">
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-semibold text-ink">{t.landing.metric1Title}</div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">{t.landing.metric1Desc}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-semibold text-verified">{t.landing.metric2Title}</div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">{t.landing.metric2Desc}</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-semibold text-thread">{t.landing.metric3Title}</div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">{t.landing.metric3Desc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3 VALUE PILLARS SECTION */}
      <section id="value-pillars" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-thread">
            {t.landing.pillarsBadge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-ink">
            {t.landing.pillarsTitle}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {t.landing.pillarsDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Save Time */}
          <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 flex flex-col justify-between shadow-fitting-card hover:border-accent/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-fitting bg-thread/10 text-thread flex items-center justify-center text-xl font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-thread block">
                    {t.landing.pillar1Tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-ink mt-0.5">
                    {t.landing.pillar1Title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t.landing.pillar1Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 space-y-1.5 text-xs text-ink font-medium">
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> {t.landing.pillar1Bullet1}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> {t.landing.pillar1Bullet2}
              </div>
            </div>
          </div>

          {/* Pillar 2: Save Cost */}
          <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 flex flex-col justify-between shadow-fitting-card hover:border-accent/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-fitting bg-verified/10 text-verified flex items-center justify-center text-xl font-bold shrink-0">
                  💰
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-verified block">
                    {t.landing.pillar2Tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-ink mt-0.5">
                    {t.landing.pillar2Title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t.landing.pillar2Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 space-y-1.5 text-xs text-ink font-medium">
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> {t.landing.pillar2Bullet1}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> {t.landing.pillar2Bullet2}
              </div>
            </div>
          </div>

          {/* Pillar 3: Real 100% */}
          <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 flex flex-col justify-between shadow-fitting-card hover:border-accent/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-fitting bg-accent/10 text-accent flex items-center justify-center text-xl font-bold shrink-0">
                  🛡️
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent block">
                    {t.landing.pillar3Tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-ink mt-0.5">
                    {t.landing.pillar3Title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t.landing.pillar3Desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 space-y-1.5 text-xs text-ink font-medium">
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> {t.landing.pillar3Bullet1}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> {t.landing.pillar3Bullet2}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS 3-STEP SECTION */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-surface/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-thread">
              {t.landing.howBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-ink">
              {t.landing.howTitle}
            </h2>
            <p className="text-sm text-ink-muted">
              {t.landing.howDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 bg-surface-raised border border-border rounded-fitting-lg space-y-3 relative shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-thread/50 shrink-0">
                  {t.landing.step1Num}
                </span>
                <h4 className="text-base font-serif font-semibold text-ink">
                  {t.landing.step1Title}
                </h4>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                {t.landing.step1Desc}
              </p>
            </div>

            <div className="p-6 bg-surface-raised border border-border rounded-fitting-lg space-y-3 relative shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-thread/50 shrink-0">
                  {t.landing.step2Num}
                </span>
                <h4 className="text-base font-serif font-semibold text-ink">
                  {t.landing.step2Title}
                </h4>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                {t.landing.step2Desc}
              </p>
            </div>

            <div className="p-6 bg-surface-raised border border-border rounded-fitting-lg space-y-3 relative shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-thread/50 shrink-0">
                  {t.landing.step3Num}
                </span>
                <h4 className="text-base font-serif font-semibold text-ink">
                  {t.landing.step3Title}
                </h4>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                {t.landing.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PARTNER RETAILERS SECTION */}
      <section id="retailers" className="py-14 max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
          {t.landing.brandsTitle}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm sm:text-base font-serif font-semibold text-ink/70">
          <span className="hover:text-accent transition-colors">RW&CO</span>
          <span>•</span>
          <span className="hover:text-accent transition-colors">Lululemon</span>
          <span>•</span>
          <span className="hover:text-accent transition-colors">Aritzia</span>
          <span>•</span>
          <span className="hover:text-accent transition-colors">Kotn</span>
          <span>•</span>
          <span className="hover:text-accent transition-colors">Frank And Oak</span>
          <span>•</span>
          <span className="hover:text-accent transition-colors">Vessi</span>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 bg-accent text-white border-t border-accent/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-serif font-semibold tracking-tight">
            {t.landing.ctaTitle}
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            {t.landing.ctaDesc}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onEnterFittingRoom}
              className="px-8 py-3.5 rounded-fitting bg-surface text-ink hover:bg-white text-sm font-semibold shadow-fitting-raised transition-all hover:scale-[1.03] cursor-pointer"
            >
              {t.landing.ctaButton}
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-8 bg-surface-dark text-white/60 text-xs border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-white font-serif font-semibold text-sm">{t.common.brandName}</span>
            <span className="ml-2 text-[11px]">{t.landing.footerRights}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{t.landing.footerPrivacy}</span>
            <span>•</span>
            <span>{t.landing.footerWeather}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
