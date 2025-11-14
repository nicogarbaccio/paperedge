/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Primary backgrounds
        background: "#0a0a0b", // Main app background (near black)
        surface: "#1a1a1b", // Card/component backgrounds
        "surface-secondary": "#2a2a2b", // Elevated/secondary surfaces

        // Semantic colors
        profit: "#10b981", // Green for wins/positive P&L
        loss: "#ef4444", // Red for losses/negative P&L
        pending: "#f59e0b", // Amber for pending bets
        push: "#6b7280", // Gray for pushes/neutral

        // Text colors
        "text-primary": "#f8fafc", // Primary text (off-white)
        "text-secondary": "#94a3b8", // Secondary/muted text

        // UI elements
        border: "#374151", // Borders and dividers
        accent: "#10b981", // Primary accent color

        // shadcn/ui compatibility
        foreground: "#f8fafc",
        card: {
          DEFAULT: "#1a1a1b",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "#1a1a1b",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#10b981",
          foreground: "#0a0a0b",
        },
        secondary: {
          DEFAULT: "#2a2a2b",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#2a2a2b",
          foreground: "#94a3b8",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f8fafc",
        },
        input: "#2a2a2b",
        ring: "#10b981",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        wave: {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 0.8 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-in-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: 0, transform: "scale(0.95)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s ease-in-out infinite",
        wave: "wave 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
