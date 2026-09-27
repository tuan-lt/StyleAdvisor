"use client";

import React from "react";

interface TrustLandingBlockProps {
  onStartStyling?: () => void;
}

export const TrustLandingBlock: React.FC<TrustLandingBlockProps> = ({ onStartStyling }) => {
  return (
    <section className="mb-10 animate-fadeIn">
      {/* Hero Badge & Mission Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-surface-raised to-surface border border-border rounded-fitting-lg p-6 sm:p-10 shadow-fitting-raised">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-thread/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 rounded-full bg-verified/5 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-4">


          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-ink tracking-tight leading-[1.2] max-w-2xl mx-auto">
            Look great and feel confident, <span className="italic text-thread">every single day</span>.<br />
            No guesswork, no wasted shopping.
          </h1>

          <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-sans max-w-2xl mx-auto">
            Your personal style advisor tailored to your body shape, best colors, and the weather—recommending only <strong className="text-ink font-semibold">100% real, in-stock clothes</strong> from trusted Canadian brands.
          </p>

          {onStartStyling && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onStartStyling}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-fitting bg-accent hover:bg-accent/90 text-white text-sm font-semibold shadow-fitting-card hover:shadow-fitting-raised transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>✨ Start Your Fitting Profile</span>
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
                  <span className="text-[11px] font-bold uppercase tracking-widest text-thread block">Save Time</span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-ink group-hover:text-accent transition-colors">
                    Dressed in a Few Clicks
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                No more standing in front of your closet feeling stuck or spending hours jumping between store websites. Get complete, coordinated looks curated for you.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-ink font-medium flex items-center gap-1.5">
              <span className="text-verified font-bold">✓</span> Say goodbye to morning stress
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
                  <span className="text-[11px] font-bold uppercase tracking-widest text-verified block">Save Money</span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-ink group-hover:text-accent transition-colors">
                    No More Regret Buys
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                Stop buying items that look nice online but end up hanging unworn in your closet. Every piece we suggest mixes and matches effortlessly.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-ink font-medium flex items-center gap-1.5">
              <span className="text-verified font-bold">✓</span> Clothes you'll actually wear
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
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent block">100% Real</span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-ink group-hover:text-accent transition-colors">
                    Real Clothes You Can Buy
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                No fake AI hallucinations. Every recommended item is a real, purchasable garment from top Canadian stores with direct links and live prices.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-ink font-medium flex items-center gap-1.5">
              <span className="text-verified font-bold">✓</span> Verified inventory, prices, and direct links
            </div>
          </div>
        </div>

        {/* Social Proof & Trust Badges */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">Popular Brands:</span>
            <span className="font-medium text-thread">RW&CO • Lululemon • Aritzia • Kotn • Frank And Oak • Vessi</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="text-verified font-bold">●</span> Privacy Friendly
            </span>
            <span className="flex items-center gap-1">
              <span className="text-verified font-bold">●</span> Weather & Climate Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
