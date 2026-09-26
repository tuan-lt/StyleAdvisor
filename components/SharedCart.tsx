"use client";

import React from "react";
import { Garment } from "../types/catalog";

interface SharedCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Garment[];
  onRemoveItem: (garmentId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export function SharedCart({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}: SharedCartProps) {
  if (!isOpen) return null;

  // De-duplicate items per PRD FR-4.1
  const uniqueItemsMap = new Map<string, Garment>();
  for (const item of cartItems) {
    uniqueItemsMap.set(item.id, item);
  }
  const uniqueItems = Array.from(uniqueItemsMap.values());

  const totalCad = uniqueItems.reduce((acc, item) => acc + (item.price_cad || item.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-raised border-l border-border shadow-fitting-modal flex flex-col justify-between">
          {/* Cart Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif text-ink font-medium">Fitting Bag (Shared Cart)</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {uniqueItems.length} {uniqueItems.length === 1 ? "garment" : "garments"} verified
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-ink-muted hover:text-ink rounded-fitting hover:bg-surface transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Cart Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {uniqueItems.length === 0 ? (
              /* Empty Cart Calm View per PRD FR-4.3 ("You're ready. Wear what you have.") */
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-verified/10 text-verified flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-serif text-ink font-normal tracking-tight">
                    You&rsquo;re ready.
                  </h3>
                  <p className="text-lg font-serif text-thread italic">
                    Wear what you have.
                  </p>
                  <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed pt-2">
                    Every piece for your calibrated ensemble is already in your wardrobe. Zero new purchases necessary.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-fitting bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-raised transition-all cursor-pointer"
                >
                  Return to Advisor
                </button>
              </div>
            ) : (
              /* Items List */
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-ink-muted pb-2 border-b border-border">
                  <span>De-duplicated Selection</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-caution hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3 divide-y divide-border">
                  {uniqueItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-16 rounded-fitting object-cover bg-surface border border-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-thread">
                          {item.brand} • {item.slot}
                        </div>
                        <h4 className="text-xs font-medium text-ink truncate">{item.name}</h4>
                        <div className="text-xs font-bold text-ink mt-0.5 font-mono tabular-nums">
                          ${(item.price_cad || item.price || 0).toFixed(2)} CAD
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-xs text-ink-muted hover:text-caution p-1 cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {uniqueItems.length > 0 && (
            <div className="p-6 border-t border-border bg-surface/40 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>Canadian Merchant Total</span>
                  <span className="font-mono">CAD</span>
                </div>
                <div className="flex justify-between text-xl font-serif text-ink font-semibold">
                  <span>Estimated Total</span>
                  <span className="font-mono tabular-nums">${totalCad.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-ink-muted">
                  No hidden markup. Order directly through verified Canadian retailers.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenCheckout}
                className="w-full py-3.5 px-4 rounded-fitting bg-accent hover:bg-navy-light text-white font-medium text-sm tracking-wide shadow-fitting-raised transition-all cursor-pointer"
              >
                Proceed to Checkout ({uniqueItems.length} items) →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
