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
          50: "#e6f7ec",
          100: "#ccebd8",
          200: "#99ddb3",
          300: "#66cf8e",
          400: "#33c169",
          500: "#00b140",
          600: "#009135",
          700: "#00712a",
          800: "#00501e",
          900: "#003012",
          950: "#001809",
        },
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
