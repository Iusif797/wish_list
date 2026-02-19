import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#edfcf2",
          100: "#d4f7e0",
          200: "#adedc6",
          300: "#78dea5",
          400: "#40c77f",
          500: "#1aad64",
          600: "#0e8b4f",
          700: "#0c7042",
          800: "#0d5836",
          900: "#0b492e",
          950: "#04291a",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 0 24px rgba(26, 173, 100, 0.2)",
        "glow-lg": "0 0 48px rgba(26, 173, 100, 0.25)",
        "glow-xl": "0 0 64px rgba(26, 173, 100, 0.3)",
        soft: "0 2px 24px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 8px 48px rgba(0, 0, 0, 0.06)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 24px 48px -12px rgba(0, 0, 0, 0.12), 0 8px 24px -4px rgba(0, 0, 0, 0.06)",
        "card-dark": "0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 2px 8px -2px rgba(0, 0, 0, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
