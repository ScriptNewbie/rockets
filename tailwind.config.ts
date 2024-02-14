import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-green-600",
    "bg-orange-500",
    "bg-yellow-500",

    "text-blue-500",
    "text-red-500",
    "text-green-500",
    "text-green-600",
    "text-orange-500",
    "text-yellow-500",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
