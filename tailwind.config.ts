import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff9f4",
          100: "#ffe7d6",
          200: "#ffd0b0",
          300: "#ffb083",
          400: "#ff8f5b",
          500: "#f36d3f",
          600: "#d34f2c",
          700: "#b03e24",
          800: "#80311d",
          900: "#471911"
        },
        sand: {
          50: "#fbf6f0",
          100: "#f4e6d7",
          200: "#ead1b5",
          300: "#dfbc97",
          400: "#c7966b",
          500: "#a9744c",
          600: "#86583a",
          700: "#68422d",
          800: "#442a1c",
          900: "#25160f"
        },
        ink: {
          50: "#f5f4f2",
          100: "#e7e4e0",
          200: "#cfc7be",
          300: "#b4aa9f",
          400: "#8c8275",
          500: "#645b52",
          600: "#4a433c",
          700: "#322d28",
          800: "#1f1b18",
          900: "#130f0d"
        }
      },
      boxShadow: {
        glow: "0 10px 50px rgba(243, 109, 63, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
