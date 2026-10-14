"use client";

import React, { useState } from "react";
import Link from "next/link";

interface LogoConcept {
  id: string;
  name: string;
  subtitle: string;
  svgPath: string;
  dnaStory: string;
  elements: string[];
  vibe: string;
  palette: { name: string; hex: string }[];
}

const concepts: LogoConcept[] = [
  {
    id: "concept-1",
    name: "01. The Sartorial Monogram",
    subtitle: "Monogram Kiến Trúc S·A & Đường Chỉ May Đo",
    svgPath: "/images/logos/logo_concept_1_sartorial.svg",
    dnaStory:
      "Tái hiện tinh thần may đo Bespoke Savile Row kết hợp Haute Couture hiện đại. Chữ 'A' được dựng như ve áo vest tuxedo sắc sảo, đan lồng cùng nét lụa chữ 'S' mềm mại màu chỉ may Cognac (#C4704B) và tâm khâu xanh rêu Verified (#3F6B4F).",
    elements: [
      "Monogram 'SA' lồng ghép hình học đối xứng",
      "Vòng đo thước dây & kim khâu thêu tinh xảo",
      "Ve áo Tuxedo & đường cắt may kiến trúc",
    ],
    vibe: "Quiet Luxury · Sartorial Tailoring · Timeless Elegance",
    palette: [
      { name: "Deep Ink", hex: "#0F172A" },
      { name: "Cognac Thread", hex: "#C4704B" },
      { name: "Canadian Moss", hex: "#3F6B4F" },
      { name: "Linen Surface", hex: "#FDFBF7" },
    ],
  },
  {
    id: "concept-2",
    name: "02. The North Star & Lapel",
    subtitle: "Ngôi Sao Dẫn Lối & Ve Áo Kim Cương",
    svgPath: "/images/logos/logo_concept_2_compass.svg",
    dnaStory:
      "Style Advisor là người cố vấn định hướng cho các sự kiện tầm cỡ (High-Stakes Moments). Biểu tượng ngôi sao 4 cánh (Compass Star) giao thoa cùng hình thoi ve áo vest, đại diện cho tính chính xác tuyệt đối (Zero-Hallucination) và sự đĩnh đạc tự tin.",
    elements: [
      "Ngôi sao la bàn 4 cánh dẫn lối phong cách",
      "Hình thoi ve áo veston sắc cạnh hiện đại",
      "Tâm điểm ngọc lục bảo Verified Canadian Moss",
    ],
    vibe: "High-Stakes Authority · Zero-Hallucination · Precision",
    palette: [
      { name: "Deep Ink", hex: "#0F172A" },
      { name: "Gold Ochre", hex: "#F59E0B" },
      { name: "Verified Green", hex: "#3F6B4F" },
      { name: "Canvas Warm", hex: "#FAF8F5" },
    ],
  },
  {
    id: "concept-3",
    name: "03. The Golden Weave & Hanger",
    subtitle: "Móc Áo Gỗ Cổ Điển & Cấu Trúc Sợi Dệt Vô Cực",
    svgPath: "/images/logos/logo_concept_3_weave.svg",
    dnaStory:
      "Lấy cảm hứng từ phòng thử đồ độc quyền 'The Fitting Room'. Đường cong vai áo của chiếc móc gỗ bespoke ôm trọn hai vòng dệt sợi vải (warp & weft) đan cài hình vô cực (infinity), tượng trưng cho tủ đồ con nhộng (Capsule Wardrobe) với khả năng phối đồ biến hoá bất tận.",
    elements: [
      "Đường cong móc áo gỗ Bespoke cao cấp",
      "Vòng lặp dệt sợi vô cực tượng trưng cho Capsule",
      "Chốt nút may đo vàng Cognac & Deep Navy",
    ],
    vibe: "The Fitting Room · Modular Wardrobe · Tactile Quality",
    palette: [
      { name: "Deep Navy", hex: "#0F172A" },
      { name: "Warm Amber", hex: "#C4704B" },
      { name: "Moss Accent", hex: "#3F6B4F" },
      { name: "Warm Wool", hex: "#F4EFE6" },
    ],
  },
];

export default function LogosShowcasePage() {
  const [selectedConcept, setSelectedConcept] = useState<string>("concept-1");
  const [bgMode, setBgMode] = useState<"light" | "dark">("light");

  return (
    <div className="min-h-screen bg-surface text-ink selection:bg-thread/20 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-serif text-ink font-bold tracking-tight hover:text-accent transition-colors"
            >
              Style Advisor
            </Link>
            <span className="text-border font-light">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-thread">
              Brand Identity System
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
            >
              ← Back to Fitting Room
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* Intro Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-verified/10 text-verified text-xs font-bold uppercase tracking-wider border border-verified/20">
            <span>✨</span> Brand DNA & Logo Exploration
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink font-normal tracking-tight">
            3 Định Hướng Thiết Kế Logo Cho Style Advisor
          </h1>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Được phát triển dựa trên 4 trụ cột DNA: May đo Bespoke cao cấp, Tinh thần Quiet Luxury tối giản của vùng Pacific Northwest (Vancouver/Gastown), Sự chuẩn xác không ảo giác (Zero-Hallucination) và Tủ đồ con nhộng (Capsule).
          </p>
        </div>

        {/* 3 Logo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {concepts.map((c) => {
            const isCurrent = selectedConcept === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedConcept(c.id)}
                className={`group rounded-fitting-lg border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? "border-accent ring-2 ring-accent/30 shadow-fitting-raised bg-surface-raised"
                    : "border-border hover:border-thread/50 bg-surface-raised/70 hover:shadow-fitting-card"
                }`}
              >
                <div>
                  {/* SVG Canvas Preview */}
                  <div className="aspect-[4/3] bg-[#FDFBF7] p-4 flex items-center justify-center border-b border-border relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={c.svgPath}
                      alt={c.name}
                      className="w-full h-full object-contain"
                    />
                    {isCurrent && (
                      <div className="absolute top-3 right-3 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                        Đang chọn
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-ink group-hover:text-accent transition-colors">
                        {c.name}
                      </h3>
                      <p className="text-xs font-semibold text-thread mt-0.5">
                        {c.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                      {c.dnaStory}
                    </p>

                    {/* Key Elements */}
                    <div className="space-y-1.5 pt-3 border-t border-border/80">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-ink/70">
                        Chi tiết biểu tượng:
                      </div>
                      <ul className="space-y-1">
                        {c.elements.map((el, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-ink-muted flex items-start gap-1.5"
                          >
                            <span className="text-accent shrink-0">·</span>
                            <span>{el}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Palette swatches */}
                    <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
                        Bảng màu DNA:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {c.palette.map((p) => (
                          <span
                            key={p.name}
                            title={`${p.name} (${p.hex})`}
                            style={{ backgroundColor: p.hex }}
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <a
                    href={c.svgPath}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-fitting bg-surface border border-border text-xs font-semibold text-ink-muted hover:text-ink hover:border-thread/50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>↓</span> Tải file Vector SVG
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Logo In-Depth Preview & Header Simulation */}
        {(() => {
          const active = concepts.find((c) => c.id === selectedConcept) || concepts[0];
          return (
            <div className="bg-surface-raised border border-border rounded-fitting-lg p-6 sm:p-8 space-y-6 shadow-fitting-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-thread">
                    Mô phỏng ứng dụng thực tế trên website
                  </div>
                  <h2 className="text-2xl font-serif text-ink font-bold mt-1">
                    {active.name} — Header Simulation
                  </h2>
                </div>

                {/* Dark / Light Toggle */}
                <div className="flex items-center gap-2 bg-surface p-1 rounded-fitting border border-border text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setBgMode("light")}
                    className={`px-3 py-1 rounded transition-colors ${
                      bgMode === "light"
                        ? "bg-surface-raised shadow-xs text-ink"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    Nền sáng (#FDFBF7)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode("dark")}
                    className={`px-3 py-1 rounded transition-colors ${
                      bgMode === "dark"
                        ? "bg-surface-dark text-white shadow-xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    Nền tối (#0F172A)
                  </button>
                </div>
              </div>

              {/* Simulated Header Bar */}
              <div
                className={`rounded-fitting border p-4 sm:p-6 transition-colors duration-300 ${
                  bgMode === "dark"
                    ? "bg-[#0F172A] border-white/10 text-white"
                    : "bg-[#FDFBF7] border-border text-ink"
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Logo Lockup in Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={active.svgPath}
                      alt={active.name}
                      className="w-10 h-10 object-contain rounded"
                    />
                    <div>
                      <div className="text-xl font-serif font-bold tracking-tight">
                        Style Advisor
                      </div>
                      <div
                        className={`text-[9px] font-semibold tracking-widest uppercase ${
                          bgMode === "dark" ? "text-amber-400" : "text-thread"
                        }`}
                      >
                        The Fitting Room
                      </div>
                    </div>
                  </div>

                  {/* Sample Nav Items */}
                  <div className="flex items-center gap-4 text-xs font-medium opacity-80">
                    <span className="hover:opacity-100 cursor-pointer">About</span>
                    <span className="hover:opacity-100 cursor-pointer">Shopping Bag (0)</span>
                    <span className="px-2 py-0.5 rounded border border-current text-[11px] font-semibold">
                      EN | FR
                    </span>
                  </div>
                </div>
              </div>

              {/* Story Description */}
              <div className="p-4 bg-surface rounded-fitting border border-border text-xs text-ink-muted leading-relaxed">
                <span className="font-bold text-ink">Ý nghĩa DNA thương hiệu: </span>
                {active.dnaStory}
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
