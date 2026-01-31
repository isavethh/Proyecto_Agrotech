/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para AgroBolivia
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#faf5f0',
          100: '#f0e6d6',
          200: '#e0ccad',
          300: '#cba86e',
          400: '#b8884a',
          500: '#a6723d',
          600: '#8c5a33',
          700: '#71452c',
          800: '#5e3a28',
          900: '#503225',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
