import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deck: {
          950: "#070711",
          925: "#0b0b18",
          900: "#101123",
          850: "#15172b",
          800: "#1a1d32",
          700: "#292d46",
        },
        signal: "#58f0d1",
        cue: "#f06aa6",
        violet: "#9b7cff",
        amberline: "#f0c86a",
      },
      boxShadow: {
        panel: "0 24px 90px rgba(0, 0, 0, 0.34)",
        glow: "0 0 50px rgba(88, 240, 209, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
