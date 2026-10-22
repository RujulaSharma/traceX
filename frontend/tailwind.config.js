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
          card: '#17191C',
          panel: '#22252A',
          silver: '#C6CBD1',
          chrome: '#F1F3F5',
          steel: '#8D949D',
          gunmetal: '#454B53',
          border: '#3A3F46',
          text: '#F4F5F6',
          muted: '#A4AAB2',
          slate: '#727982',
          green: '#39FF6A',
          greenHover: '#25E653',
          yellow: '#FFD84D',
          coral: '#FF6464',
          // Legacy mappings for backwards compatibility
          pink: '#C6CBD1',
          softPink: '#F1F3F5',
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
