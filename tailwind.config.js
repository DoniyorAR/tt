/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // primary indigo
          600: "#5458dc",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          100: "#d1fae5",
          400: "#34d399",
          500: "#10b981", // emerald
        },
      },
      boxShadow: {
        card: "0 8px 24px rgba(2, 6, 23, 0.08)", // slate-900/8
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
