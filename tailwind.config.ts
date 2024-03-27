import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    keyframes: {
      open: {
        "0%": { transform: "translateY(100%)", scale: "0" },
        "100%": { transform: "translateY(0)", scale: "1" },
      },
      fadeUp: {
        "0%": { opacity: "0", transform: "translateY(20px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
    },
    animation: {
      open: "open 0.5s ease-in-out",
      fadeUp: "fadeUp 0.5s ease-in-out",
    },
  },
  plugins: [],
};
export default config;
