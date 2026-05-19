/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f2fb',
          100: '#cce5f7',
          200: '#99cbef',
          300: '#66b1e7',
          400: '#3397df',
          500: '#0079bf',
          600: '#006aaa',
          700: '#005c95',
          800: '#004d7f',
          900: '#003f69',
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
