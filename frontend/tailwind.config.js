/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#080c0f",
          2: "#0e1418",
          3: "#141c22",
        },
        surface: {
          DEFAULT: "#1a242c",
          2: "#222e38",
        },
        accent: "#2be8a4",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
