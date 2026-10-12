"use client";

import React, { useState } from "react";
import { Garment } from "../types/catalog";
import { useLanguage } from "../lib/LanguageContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Garment[];
  initialEmail?: string;
}

export function CheckoutModal({ isOpen, onClose, cartItems, initialEmail = "" }: CheckoutModalProps) {
  const { language, t } = useLanguage();
  const isFr = language === "fr";

  const [email, setEmail] = useState<string>(initialEmail);
  const [wtpAmount, setWtpAmount] = useState<number>(35);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalCad = cartItems.reduce((acc, item) => acc + (item.price_cad || item.price || 0), 0);

  const getWtpLabel = (val: number) => {
    if (isFr) {
      if (val === 0) return "0 $ CAD (Liens gratuits en ligne uniquement)";
      if (val <= 20) return `${val} $ CAD / commande (Stylisme ponctuel pour un événement)`;
      if (val <= 50) return `${val} $ CAD / mois (Garde-robe saisonnière renouvelée)`;
      return `${val} $ CAD / mois (Service VIP sur demande avec retours simplifiés)`;
    }
    if (val === 0) return "$0 CAD (Free online links only)";
    if (val <= 20) return `$${val} CAD / order (Occasional high-stakes event styling)`;
    if (val <= 50) return `$${val} CAD / month (Quarterly seasonal wardrobe concierge)`;
    return `$${val} CAD / month (VIP On-demand home delivery & tailoring)`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

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
            <div className="text-xs font-bold uppercase tracking-wider text-thread">
              {isFr ? "Accès anticipé exclusif" : "Private Pilot Intake"}
            </div>
            <h2 className="text-2xl font-serif text-ink font-medium mt-0.5">
              {isSubmitted
                ? (isFr ? "Accès réservé avec succès" : "Pilot Access Reserved")
                : (isFr ? "Finaliser votre sélection" : "Checkout is Coming Soon")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded-fitting transition-colors cursor-pointer"
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
              <h3 className="text-base font-serif font-medium text-ink">
                {isFr ? "Vous êtes inscrit(e) sur la liste VIP" : "You are on the VIP Pilot List"}
              </h3>
              <p className="text-xs text-ink-muted">
                {isFr ? (
                  <>
                    Vos préférences de style ont bien été enregistrées pour <strong className="text-ink">{email}</strong>.
                    Voici vos liens marchands vérifiés pour commander dès aujourd'hui sans frais ajoutés.
                  </>
                ) : (
                  <>
                    Your styling preferences have been saved for <strong className="text-ink">{email}</strong>.
                    Below are your direct merchant links to order today with zero markup.
                  </>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {isFr ? "Liens directs des boutiques canadiennes" : "Direct Canadian Retailer Links"}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-ink">{item.brand}:</span> {item.name}
                    </div>
                    <a
                      href={item.retailer_url || item.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-thread hover:underline font-bold shrink-0 ml-2"
                    >
                      {isFr ? `Acheter sur ${item.brand} ↗` : `Buy on ${item.brand} ↗`}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-fitting bg-accent text-white font-serif text-sm font-medium hover:bg-navy-light transition-all cursor-pointer"
            >
              {isFr ? "Retourner à la cabine d'essayage" : "Back to Fitting Room"}
            </button>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-3.5 bg-surface rounded-fitting border border-border text-xs text-ink-muted leading-relaxed">
              {isFr
                ? "Le paiement unifié en 1 clic auprès des boutiques canadiennes arrive le mois prochain. Rejoignez notre projet pilote pour un accès anticipé et des conseils de style gratuits."
                : "Direct unified 1-click checkout across multiple Canadian retailers is launching next month. Join our private Vancouver pilot for free white-glove styling delivery."}
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink">
                {isFr ? "Votre adresse courriel" : "Your Work or Personal Email"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isFr ? "vous@exemple.ca" : "sam@earlystagestartup.ca"}
                className="w-full px-4 py-2.5 text-sm bg-surface/50 border border-border rounded-fitting focus:outline-none focus:ring-1 focus:ring-accent focus:bg-surface-raised transition-all"
              />
            </div>

            {/* Willingness to pay question */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-start">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink">
                  {isFr ? "Sondage de satisfaction & Tarif" : "Willingness-to-Pay (WTP) Survey"}
                </label>
                <span className="text-xs font-bold text-thread font-mono">
                  ${wtpAmount} CAD
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                {isFr
                  ? "Combien paieriez-vous pour un service de conciergerie vestimentaire qui livre vos tenues sur mesure avec retours à domicile simplifiés ?"
                  : "How much would you pay for a concierge service that delivers your curated outfit to your door with pre-verified sizes and free home returns?"}
              </p>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={wtpAmount}
                onChange={(e) => setWtpAmount(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="text-xs font-medium text-ink bg-surface/60 border border-border p-2 rounded-fitting">
                {getWtpLabel(wtpAmount)}
              </div>
            </div>

            {/* Summary info */}
            <div className="flex justify-between items-center text-xs text-ink-muted border-t border-border pt-3">
              <span>{isFr ? "Sélection actuelle :" : "Current Selection:"}</span>
              <span className="font-bold text-ink font-mono">
                ${totalCad.toFixed(2)} CAD ({cartItems.length} {isFr ? "articles" : "items"})
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-fitting bg-accent hover:bg-navy-light text-white font-serif text-base font-medium tracking-wide transition-all shadow-fitting-raised cursor-pointer"
            >
              {isFr ? "Accéder aux liens directs & Rejoindre le pilote" : "Request Private Pilot Access & View Links"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
