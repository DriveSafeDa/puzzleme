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
        cream: {
          50: "#FDFCFA",
          100: "#FAF8F5",
          200: "#F5F1EC",
          300: "#EBE6DE",
          400: "#D9D2C7",
        },
        puzzle: {
          snap: "#22C55E",
          active: "#3B82F6",
          border: "#E7E0D6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
