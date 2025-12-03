import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f8ff",
          100: "#e0eaff",
          200: "#bed0ff",
          300: "#97b2ff",
          400: "#7493ff",
          500: "#4c6bff",
          600: "#354fe6",
          700: "#2a3eb8",
          800: "#253894",
          900: "#1b2661"
        }
      }
    }
  },
  plugins: []
};

export default config;
