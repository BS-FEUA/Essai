import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        feua: { DEFAULT: "#0f9f7a", dark: "#087a5d", light: "#d9f8ec" },
      },
    },
  },
  plugins: [],
};

export default config;
