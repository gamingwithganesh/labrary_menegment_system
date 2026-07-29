/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yono: {
          50: '#fdf4f8',
          100: '#fbe8f2',
          200: '#f7d1e5',
          300: '#f0accf',
          400: '#e377ac',
          500: '#c2185b',
          600: '#a10053', // Signature Magenta/Pink
          700: '#880045',
          800: '#680048', // Deep Purple-Magenta
          900: '#2f003e', // Dark Indigo-Purple
          panel: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
