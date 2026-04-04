/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        navy:    "#0B1829",
        navy2:   "#132236",
        navy3:   "#0E1C2D",
        card:    "#112033",
        border:  "#1E2E42",
        gold:    "#C9963A",
        "gold-light": "#E8B55A",
        cream:   "#F7F4EE",
        muted:   "#7A8899",
        green:   "#1A8C5A",
        "green-light": "#4CC98A",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn:  "fadeIn 0.2s ease",
        slideUp: "slideUp 0.25s ease",
      },
    },
  },
  plugins: [],
};