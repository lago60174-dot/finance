import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15171C",
        paper: "#FAFAF7",
        line: "#E4E2DC",
        moss: "#1F4D3D",
        clay: "#C9622B",
        income: "#2F7A55",
        expense: "#B3432D",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
