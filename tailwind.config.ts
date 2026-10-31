import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blumac: {
          navy: "#142B50",
          navyDark: "#0B182D",
          navyLight: "#1D3C70",
          copper: "#C77B64",
          copperLight: "#DE9984",
          copperDark: "#A85E48",
          ivory: "#F8F5EF",
          ivoryLight: "#FCFAF6",
          beige: "#E8E3DA",
          beigeLight: "#F2EFEB",
          charcoal: "#1A1E24",
          slate: "#5A6578",
          forest: "#1B5E20",
          amber: "#B45309",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(20, 43, 80, 0.04)",
        card: "0 4px 20px -2px rgba(20, 43, 80, 0.06)",
        float: "0 12px 32px -4px rgba(20, 43, 80, 0.12)",
      },
      borderRadius: {
        brand: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
