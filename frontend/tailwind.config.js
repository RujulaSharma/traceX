/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tracex: {
          bg: '#08090A',
          alt: '#101113',
          card: '#171719',
          panel: '#1D1E21',
          pink: '#E7A1B5',
          softPink: '#F3B6C7',
          green: '#39FF6A',
          greenHover: '#25E653',
          yellow: '#FFD84D',
          text: '#F4F2F3',
          muted: '#A5A3A7',
          border: '#383438',
        },
        soc: {
          bg: '#090d16',
          panel: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#06b6d4',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          muted: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}
