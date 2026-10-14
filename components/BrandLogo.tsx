"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";

interface BrandLogoProps {
  href?: string;
  onClick?: () => void;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  href,
  onClick,
  showTagline = true,
  size = "md",
  className = "",
}) => {
  const { t } = useLanguage();

  const iconSizes = {
    sm: "w-8 h-8 p-0.5",
    md: "w-9 h-9 sm:w-10 sm:h-10 p-1",
    lg: "w-11 h-11 sm:w-12 sm:h-12 p-1.5",
  };

  const titleSizes = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
  };

  const content = (
    <div className={`group flex items-center gap-3 transition-all ${className}`}>
      {/* 1. Bold Sartorial Monogram Emblem Shield in Canadian Verified Moss Green */}
      <div
        className={`${iconSizes[size]} shrink-0 rounded-fitting bg-gradient-to-br from-[#4A7C5B] via-[#3F6B4F] to-[#2D4E39] border border-[#5B8F6D]/70 shadow-[0_3px_10px_rgba(63,107,79,0.25)] transition-all duration-300 group-hover:border-amber-400/70 group-hover:shadow-[0_4px_16px_rgba(63,107,79,0.4)] group-hover:scale-[1.03] flex items-center justify-center`}
      >
        <svg
          viewBox="-90 -90 180 180"
          width="100%"
          height="100%"
          fill="none"
          className="w-full h-full drop-shadow-xs"
          aria-hidden="true"
        >
          <defs>
            {/* Vivid Luminous Gold Gradient */}
            <linearGradient id="monogramGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Architectural 'A' Silhouette in Pure Clean White (Bold & Clear) */}
          <path
            d="M-54 75 L0 -75 L54 75"
            stroke="#FFFFFF"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 'A' Crossbar in Luminous Tailoring Gold */}
          <path
            d="M-36 22 L36 22"
            stroke="#FBBF24"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Fluid Sartorial 'S' Silk Thread in Shimmering Gold (Bold & Prominent) */}
          <path
            d="M30 -40 C18 -70 -30 -68 -32 -35 C-35 -5 35 5 32 40 C30 68 -15 72 -35 55"
            stroke="url(#monogramGold)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Apex Needle Eye Gold Bead */}
          <circle cx="0" cy="-75" r="5.5" fill="#FEF08A" stroke="#24402F" strokeWidth="2" />

          {/* Center Tailoring Pin Intersection */}
          <circle cx="0" cy="22" r="4.5" fill="#FFFFFF" stroke="#24402F" strokeWidth="2" />
        </svg>
      </div>

      {/* 2. Brand Typography Lockup on the Right: STYLE ADVISOR */}
      <div className="flex flex-col justify-center select-none text-left">
        <span
          className={`${titleSizes[size]} font-serif font-bold tracking-[0.08em] text-ink uppercase leading-none group-hover:text-accent transition-colors`}
        >
          STYLE ADVISOR
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex cursor-pointer text-left focus:outline-none" title="Style Advisor">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex cursor-pointer text-left focus:outline-none"
        title="Style Advisor"
      >
        {content}
      </button>
    );
  }

  return content;
};
