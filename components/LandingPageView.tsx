"use client";

import React from "react";

interface LandingPageViewProps {
  onEnterFittingRoom: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterFittingRoom }) => {
  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-between selection:bg-thread/20">
      {/* 1. TOP EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-thread font-bold block">
              The Fitting Room
            </span>
            <span className="hidden sm:inline-block text-border font-light">|</span>
            <span className="text-lg font-serif text-ink font-semibold">
              Style Advisor
            </span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6 text-xs font-medium">
            <a href="#value-pillars" className="text-ink-muted hover:text-ink transition-colors hidden md:inline-block">
              Why You'll Love It
            </a>
            <a href="#how-it-works" className="text-ink-muted hover:text-ink transition-colors hidden md:inline-block">
              How It Works
            </a>
            <a href="#retailers" className="text-ink-muted hover:text-ink transition-colors hidden sm:inline-block">
              Popular Brands
            </a>
            <button
              type="button"
              onClick={onEnterFittingRoom}
              className="px-4 py-2 rounded-fitting bg-accent hover:bg-accent/90 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              Start Styling →
            </button>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/80 bg-gradient-to-b from-surface to-surface-raised">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-thread/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-verified/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">


          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-ink tracking-tight leading-[1.25] max-w-2xl mx-auto">
            Look great and feel confident, <span className="italic text-thread font-normal">every single day</span>.<br />
            No guesswork, no wasted shopping.
          </h1>

          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans max-w-2xl mx-auto">
            Your personal style advisor tailored to your body shape, best colors, and the weather—recommending only <strong className="text-ink font-semibold">100% real, in-stock clothes</strong> from trusted Canadian brands.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onEnterFittingRoom}
              className="w-full sm:w-auto px-8 py-3.5 rounded-fitting bg-accent hover:bg-accent/90 text-white text-sm font-semibold shadow-fitting-card hover:shadow-fitting-raised transition-all hover:scale-[1.02] cursor-pointer"
            >
              ✨ Try the Fitting Room →
            </button>
            <a
              href="#value-pillars"
              className="w-full sm:w-auto px-6 py-3.5 rounded-fitting border border-border bg-surface hover:bg-surface-raised text-ink text-sm font-medium transition-all"
            >
              Why People Love It
            </a>
          </div>

          {/* Metric Highlights */}
          <div className="pt-10 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center border-t border-border/60">
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-semibold text-ink">Zero Guesswork</div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">Full Outfit Curation</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-semibold text-verified">100%</div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">Real Stores</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-semibold text-thread">-$1,200</div>
              <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5">Stop Wasting Money</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3 VALUE PILLARS SECTION */}
      <section id="value-pillars" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-thread">
            3 Simple Promises
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-ink">
            Getting Dressed Just Got Effortless
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            We solved the three biggest headaches of shopping online and figuring out what to wear.
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
                  <span className="text-[11px] font-bold uppercase tracking-wider text-thread block">Save Time</span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-ink mt-0.5">
                    Dressed in a Few Clicks
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                No more standing in front of your closet feeling stuck, or spending hours bouncing between 10 browser tabs. Get a full head-to-toe look ready for you.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 space-y-1.5 text-xs text-ink font-medium">
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> Say goodbye to morning stress
              </div>
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> Complete head-to-toe curation
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
                  <span className="text-[11px] font-bold uppercase tracking-wider text-verified block">Save Money</span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-ink mt-0.5">
                    No More Regret Buys
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Stop buying items that look nice online but end up hanging unworn in your closet. Our mix-and-match capsule makes sure every piece goes with everything else.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 space-y-1.5 text-xs text-ink font-medium">
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> Save up to $1,200/year on unworn clothes
              </div>
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> Clothes that you'll actually wear
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
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent block">100% Real</span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-ink mt-0.5">
                    Real Clothes You Can Buy
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Other AI tools generate fake images of clothes that don't exist. Style Advisor only suggests real garments that are currently in stock with direct links to buy.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/80 space-y-1.5 text-xs text-ink font-medium">
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> Direct links to official brand stores
              </div>
              <div className="flex items-center gap-2">
                <span className="text-verified font-bold">✓</span> Clear CAD prices with stock availability
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS 3-STEP SECTION */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-surface/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-thread">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-ink">
              3 Easy Steps to Great Style
            </h2>
            <p className="text-sm text-ink-muted">
              Designed to make getting dressed easy, fun, and foolproof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 bg-surface-raised border border-border rounded-fitting-lg space-y-3 relative shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-thread/50 shrink-0">01</span>
                <h4 className="text-base font-serif font-semibold text-ink">Tell Us About You</h4>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Share your body shape, your favourite colors, and your overall style vibe so we know what fits you best.
              </p>
            </div>

            <div className="p-6 bg-surface-raised border border-border rounded-fitting-lg space-y-3 relative shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-thread/50 shrink-0">02</span>
                <h4 className="text-base font-serif font-semibold text-ink">Where Are You Heading?</h4>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Whether it's an interview, a date, or just upgrading your weekly office wardrobe, pick the setting you're dressing for.
              </p>
            </div>

            <div className="p-6 bg-surface-raised border border-border rounded-fitting-lg space-y-3 relative shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-thread/50 shrink-0">03</span>
                <h4 className="text-base font-serif font-semibold text-ink">Get Your Complete Look</h4>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Receive head-to-toe outfit recommendations with friendly stylist tips on why each piece works for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PARTNER RETAILERS SECTION */}
      <section id="retailers" className="py-14 max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
          Featuring Clothes From Top Canadian Brands
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
            Ready to Love What You Wear?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Hop into the Fitting Room. Your personalized outfit suggestions are only a few clicks away.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onEnterFittingRoom}
              className="px-8 py-3.5 rounded-fitting bg-surface text-ink hover:bg-white text-sm font-semibold shadow-fitting-raised transition-all hover:scale-[1.03] cursor-pointer"
            >
              Start Styling Now →
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-8 bg-surface-dark text-white/60 text-xs border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-white font-serif font-semibold text-sm">Style Advisor</span>
            <span className="ml-2 text-[11px]">© 2026 Style Advisor. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Friendly</span>
            <span>•</span>
            <span>Weather & Climate Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
