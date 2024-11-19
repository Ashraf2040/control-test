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
        main: "#0e2e3b",
        // main: "#36626a",
        // main: "#085f63",
        second: "white",
        third: "#e16262",
       
      },
    },
  },
  plugins: [],
};
export default config;
