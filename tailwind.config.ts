import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx,json}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // "Fitting Room" Design System Palette
        surface: {
          DEFAULT: "#F7F4EF",
          dark: "#17181B",
          raised: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#1C1B19",
          muted: "#6B665E",
        },
        border: {
          DEFAULT: "#E4DED4",
          subtle: "#EDE8E1",
          strong: "#C8BFB0",
        },
        accent: {
          DEFAULT: "#1F2A44",
          navy: "#1F2A44",
        },
        navy: {
          DEFAULT: "#1F2A44",
          light: "#2C3B5E",
          dark: "#141C30",
        },
        thread: {
          DEFAULT: "#B08A5B",
          camel: "#B08A5B",
        },
        camel: {
          DEFAULT: "#B08A5B",
          light: "#C7A67D",
          dark: "#8C6A3F",
        },
        verified: {
          DEFAULT: "#3F6B4F",
          moss: "#3F6B4F",
        },
        moss: {
          DEFAULT: "#3F6B4F",
          light: "#528865",
          dark: "#2D4C38",
        },
        caution: {
          DEFAULT: "#8A5A12",
          ochre: "#8A5A12",
        },
        ochre: {
          DEFAULT: "#8A5A12",
          light: "#A8721B",
          dark: "#68420B",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        sans: ["Instrument Sans", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif"],
        newsreader: ["Newsreader", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        instrument: ["Instrument Sans", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        "fitting-card": "0 2px 12px -2px rgba(28, 27, 25, 0.06), 0 1px 3px -1px rgba(28, 27, 25, 0.04)",
        "fitting-raised": "0 12px 32px -4px rgba(28, 27, 25, 0.08), 0 4px 12px -2px rgba(28, 27, 25, 0.03)",
        "fitting-modal": "0 24px 48px -12px rgba(28, 27, 25, 0.18)",
      },
      borderRadius: {
        "fitting": "6px",
        "fitting-lg": "12px",
      },
    },
  },
  plugins: [],
};

export default config;
