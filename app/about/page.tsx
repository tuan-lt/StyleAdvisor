"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../lib/LanguageContext";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { Footer } from "../../components/Footer";

export default function AboutPage() {
  const { language, t } = useLanguage();

  const brandShowcase = [
    {
      name: "Aritzia",
      origin: "Vancouver, BC",
      specialty: language === "fr" ? "Luxe quotidien & tailleurs modernes" : "Everyday Luxury & Modern Tailoring",
      category: "Work & Evening",
    },
    {
      name: "RW&CO",
      origin: "Montreal, QC",
      specialty: language === "fr" ? "Costumes soignés & tenues professionnelles" : "Refined Suiting & Polished Business Wear",
      category: "Formal & Smart Casual",
    },
    {
      name: "Lululemon",
      origin: "Vancouver, BC",
      specialty: language === "fr" ? "Vêtements techniques & loisirs haut de gamme" : "Technical Layering & Elevated Athleisure",
      category: "Casual & Outerwear",
    },
    {
      name: "Kotn",
      origin: "Toronto, ON",
      specialty: language === "fr" ? "Basiques en coton égyptien écoresponsable" : "Traceable Egyptian Cotton Essentials",
      category: "Capsule Basics",
    },
    {
      name: "Frank And Oak",
      origin: "Montreal, QC",
      specialty: language === "fr" ? "Mode urbaine éco-conçue & intemporelle" : "Mindfully Designed Sustainable Fashion",
      category: "Contemporary Casual",
    },
    {
      name: "Vessi",
      origin: "Vancouver, BC",
      specialty: language === "fr" ? "Chaussures 100% imperméables pour le climat canadien" : "100% Waterproof Weatherproof Footwear",
      category: "All-Weather Shoes",
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-between selection:bg-thread/20">
      {/* 1. EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-serif text-ink font-bold tracking-tight hover:text-accent transition-colors"
            >
              {t.common.brandName}
            </Link>
          </div>

          <nav className="flex items-center gap-5 sm:gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-ink-muted hover:text-ink transition-colors text-xs sm:text-sm font-medium"
            >
              {language === "fr" ? "Accueil" : "Home"}
            </Link>
            <span className="text-accent font-semibold text-xs sm:text-sm border-b-2 border-accent pb-0.5">
              {t.header.about || "About"}
            </span>

            {/* Language Switcher: EN and FR */}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      {/* 2. ABOUT HERO */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-border/80 bg-gradient-to-b from-surface to-surface-raised">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-thread/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-verified/5 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest text-thread">
            {language === "fr" ? "À Propos de Style Advisor" : "About Style Advisor"}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-ink tracking-tight leading-[1.2]">
            {language === "fr"
              ? "L'intelligence vestimentaire pensée pour le quotidien canadien."
              : "Wardrobe Intelligence Built for Real Canadian Living."}
          </h1>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans max-w-2xl mx-auto">
            {language === "fr"
              ? "Zéro hallucination, 100% de vêtements réels en stock auprès de marques canadiennes reconnues, adaptés à votre morphologie, vos couleurs idéales et la météo locale."
              : "Zero AI hallucinations, 100% in-stock clothes from trusted Canadian brands tailored to your unique silhouette, palette, and real-time Canadian weather."}
          </p>
        </div>
      </section>

      {/* 3. 3 VALUE PILLARS (DỜI TỪ LANDINGPAGE VÀO) */}
      <section id="value-pillars" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
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

      {/* 4. REDESIGNED: HOW IT WORKS (3 EASY STEPS) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-surface-raised/70 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
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
            {/* Step 1 */}
            <div className="relative p-7 bg-surface border border-border rounded-fitting-lg space-y-4 shadow-fitting-card hover:border-accent/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-accent">
                    {t.landing.step1Num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold tracking-wider uppercase">
                    Step 1
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-ink pt-1">
                  {t.landing.step1Title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  {t.landing.step1Desc}
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 text-[11px] text-ink-muted flex items-center gap-1.5 font-medium">
                <span className="text-verified font-bold">✓</span>
                <span>{language === "fr" ? "Morphologie, saisons & budget" : "Silhouette, Season Palette & Budget"}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-7 bg-surface border border-border rounded-fitting-lg space-y-4 shadow-fitting-card hover:border-accent/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-thread">
                    {t.landing.step2Num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-thread/10 text-thread text-[10px] font-semibold tracking-wider uppercase">
                    Step 2
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-ink pt-1">
                  {t.landing.step2Title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  {t.landing.step2Desc}
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 text-[11px] text-ink-muted flex items-center gap-1.5 font-medium">
                <span className="text-verified font-bold">✓</span>
                <span>{language === "fr" ? "Météo locale & occasions spécifiques" : "Real-time Weather & Occasion Nuance"}</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-7 bg-surface border border-border rounded-fitting-lg space-y-4 shadow-fitting-card hover:border-accent/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-verified">
                    {t.landing.step3Num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-verified/10 text-verified text-[10px] font-semibold tracking-wider uppercase">
                    Step 3
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-ink pt-1">
                  {t.landing.step3Title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  {t.landing.step3Desc}
                </p>
              </div>
              <div className="pt-4 border-t border-border/60 text-[11px] text-ink-muted flex items-center gap-1.5 font-medium">
                <span className="text-verified font-bold">✓</span>
                <span>{language === "fr" ? "Liens officiels & prix en CAD" : "Direct Official Links & CAD Pricing"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REDESIGNED: FEATURING CLOTHES FROM TOP CANADIAN BRANDS */}
      <section id="retailers" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-thread">
            {language === "fr" ? "Partenaires de confiance" : "Verified Retail Network"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-ink">
            {t.landing.brandsTitle}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {language === "fr"
              ? "Nous recommandons exclusivement des vêtements authentiques et disponibles en stock auprès de marques canadiennes emblématiques."
              : "We only curate verified, in-stock pieces directly from premier Canadian apparel brands with clear CAD pricing."}
          </p>
        </div>

        {/* Editorial Brand Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {brandShowcase.map((brand) => (
            <div
              key={brand.name}
              className="p-6 bg-surface-raised border border-border rounded-fitting-lg space-y-3 hover:border-accent/40 hover:shadow-fitting-card transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-ink">{brand.name}</h3>
                <span className="text-[11px] text-thread font-medium">{brand.origin}</span>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {brand.specialty}
              </p>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                <span className="text-ink-muted font-medium">{brand.category}</span>
                <span className="text-verified font-semibold flex items-center gap-1">
                  <span>●</span> In Stock (CAD)
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 bg-accent text-white border-t border-accent/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight">
            {language === "fr" ? "Prêt à trouver votre style ?" : "Ready to Experience Intelligent Styling?"}
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            {language === "fr"
              ? "Entrez dans la cabine d'essayage et découvrez vos recommandations personnalisées."
              : "Step into the fitting room and unlock zero-hallucination Canadian wardrobe recommendations."}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-8 py-3.5 rounded-fitting bg-surface text-ink hover:bg-white text-sm font-semibold shadow-fitting-raised transition-all hover:scale-[1.03]"
            >
              Style Advisor →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. UNIFIED FOOTER */}
      <Footer />
    </div>
  );
}
