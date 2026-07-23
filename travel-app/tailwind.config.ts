import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // "Premium Travel Document" Palette
        "bg-main": "#0B0F1A",         // Deep Ink Navy
        "card-bg": "#161B2C",         // Warm Charcoal Surface
        "card-border": "rgba(201, 161, 90, 0.18)", // 1px low-opacity Brass Gold border
        "accent-primary": "#C9A15A",  // Aged Brass / Foil Gold
        "accent-secondary": "#3D6B66",// Muted Luggage-Tag Teal
        "text-primary": "#EDEAE2",    // Warm Off-White (Primary text)
        "text-muted": "#8A94A6",      // Editorial Muted Slate
        "state-success": "#2A524E",   // Deep Muted Teal Confirmation
        "state-error": "#A84343",     // Muted Brick Red
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["4.5rem", { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "800" }],
        h1: ["3rem", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" }],
        h2: ["2rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.35", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.85rem", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.02em" }],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
      boxShadow: {
        document: "0 8px 24px -6px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(201, 161, 90, 0.15)",
        passport: "0 12px 36px -8px rgba(11, 15, 26, 0.7), inset 0 1px 0 rgba(201, 161, 90, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
