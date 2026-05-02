/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf4e7",
          100: "#fbe3c0",
          200: "#f8c97a",
          300: "#f5af40",
          400: "#f09520",
          500: "#e8821a",
          600: "#d06814",
          700: "#a84e0f",
          800: "#7c380b",
          900: "#522407",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}
