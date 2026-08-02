import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        feua: { DEFAULT: "#0B5D3B", dark: "#06442B", light: "#E8F4ED" },
      },
    },
  },
  plugins: [],
};

export default config;
