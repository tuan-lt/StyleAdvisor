import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Style Advisor | The Fitting Room",
  description: "Gain confidence with our style advisor. Remove the guesswork with zero-hallucination Canadian wardrobe recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-surface">
      <body className="min-h-full flex flex-col justify-between bg-surface text-ink selection:bg-thread/20 selection:text-ink">
        {children}
      </body>
    </html>
  );
}
