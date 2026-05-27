/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        osrs: {
          gold: '#c8a951',
          'gold-light': '#f0d060',
          dark: '#1a1209',
          panel: '#2c2416',
          border: '#5a4a28',
          text: '#e8d9a0',
          muted: '#9b8c60',
          green: '#4caf50',
          red: '#e53935',
        },
      },
    },
  },
  plugins: [],
}
