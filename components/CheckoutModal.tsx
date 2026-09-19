"use client";

import React, { useState } from "react";
import { Garment } from "../types/catalog";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Garment[];
  initialEmail?: string;
}

export function CheckoutModal({ isOpen, onClose, cartItems, initialEmail = "" }: CheckoutModalProps) {
  const [email, setEmail] = useState<string>(initialEmail);
  const [wtpAmount, setWtpAmount] = useState<number>(35);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalCad = cartItems.reduce((acc, item) => acc + item.price, 0);

  const getWtpLabel = (val: number) => {
    if (val === 0) return "$0 (Ad-supported / Free only)";
    if (val < 25) return `$${val} CAD (Occasional single event calibration)`;
    if (val < 60) return `$${val} CAD (Seasonal Wardrobe Refresh Concierge)`;
    return `$${val} CAD (Full Executive Stylist Retainer)`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Persist research capture
    try {
      const researchData = {
        email,
        wtp_cad: wtpAmount,
        cart_total_cad: totalCad,
        items_count: cartItems.length,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("style_advisor_wtp_research", JSON.stringify(researchData));
    } catch (err) {
      console.warn("Failed to store checkout research:", err);
    }

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative bg-surface-raised border border-border rounded-fitting-lg max-w-lg w-full p-6 sm:p-8 shadow-fitting-modal z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-thread">Direct Partner Checkout</div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-0.5">
              {isSubmitted ? "Your Fitting Bag is Ready" : "Complete Outfit Verification"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded-fitting transition-colors"
          >
            ✕
          </button>
        </div>

        {isSubmitted ? (
          /* Confirmation View with Direct Partner Links */
          <div className="space-y-6 py-2">
            <div className="p-4 bg-verified/10 border border-verified/20 rounded-fitting text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-verified text-white flex items-center justify-center mx-auto text-lg font-bold">
                ✓
              </div>
              <h3 className="text-base font-serif font-medium text-ink">Outfit Blueprint Saved</h3>
              <p className="text-xs text-ink-muted">
                A copy of your calibrated recommendations and care instructions has been reserved for{" "}
                <strong className="text-ink">{email}</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Direct Merchant Links (Zero Markup)
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-ink">{item.brand}:</span> {item.name}
                    </div>
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-accent text-white font-medium hover:bg-accent/90 shrink-0 ml-2"
                    >
                      Buy at {item.brand} (${item.price}) ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-fitting bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-raised transition-all"
            >
              Return to Style Advisor
            </button>
          </div>
        ) : (
          /* Research Capture Form: Email + 1 WTP Question */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
                Your Email (For Outfit Blueprint Delivery)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sam.founder@gastowntech.ca"
                className="w-full px-4 py-3 text-sm bg-surface/40 border border-border rounded-fitting focus:outline-none focus:ring-1 focus:ring-accent focus:bg-surface-raised transition-all"
              />
            </div>

            {/* WTP Slider Question */}
            <div className="space-y-3 bg-surface p-4 sm:p-5 rounded-fitting border border-border">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                  Stylist Feedback & Pricing Question
                </label>
                <p className="text-xs text-ink-muted leading-relaxed">
                  What would you consider a fair seasonal subscription price for an AI advisor that eliminates wardrobe guesswork?
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={wtpAmount}
                  onChange={(e) => setWtpAmount(Number(e.target.value))}
                  className="w-full accent-thread cursor-pointer"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-muted">$0 CAD</span>
                  <span className="font-semibold text-thread font-mono text-sm">
                    {getWtpLabel(wtpAmount)}
                  </span>
                  <span className="text-ink-muted">$120 CAD</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-fitting bg-accent hover:bg-accent/95 text-white font-medium text-sm tracking-wide shadow-fitting-raised transition-all"
              >
                Access Direct Partner Links →
              </button>
              <p className="text-[11px] text-center text-ink-muted">
                Strictly no spam or countdown banners. Fitting Room guarantee.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
