import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://StyleAdvisor.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Style Advisor | The Fitting Room",
    template: "%s | Style Advisor",
  },
  description:
    "Gain confidence with our style advisor. Remove the guesswork with zero-hallucination Canadian wardrobe recommendations tailored for high-stakes moments and everyday capsules.",
  keywords: [
    "Style Advisor",
    "AI Stylist",
    "Canadian Fashion",
    "Aritzia Outfits",
    "Vancouver Startup Dressing",
    "High Stakes Wardrobe",
    "Zero Hallucination AI",
    "Everyday Capsule Wardrobe",
    "Kotn",
    "RW&CO",
    "Lululemon",
    "Vessi",
  ],
  authors: [{ name: "Style Advisor Team" }],
  creator: "Style Advisor",
  publisher: "Style Advisor",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteUrl,
    title: "Style Advisor | Gain Confidence with AI Styling Intelligence",
    description:
      "Zero-hallucination wardrobe recommendations connecting you to verified, purchasable Canadian products.",
    siteName: "Style Advisor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Style Advisor | The Fitting Room",
    description:
      "Tells you exactly what to wear for high-stakes moments, explains why it works, and connects you to Canadian products you can buy today.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-surface">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col justify-between bg-surface text-ink selection:bg-thread/20 selection:text-ink">
        {children}
      </body>
    </html>
  );
}
