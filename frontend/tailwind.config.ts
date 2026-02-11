import type { Config } from "tailwindcss";

const config: Config = {
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
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "glow": "0 0 20px rgba(26, 173, 100, 0.15)",
        "glow-lg": "0 0 40px rgba(26, 173, 100, 0.2)",
        "soft": "0 2px 20px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 4px 40px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
