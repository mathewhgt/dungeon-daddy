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
        background: '#0d1117',
        surface: {
          50: '#21262d',
          100: '#161b22',
          200: '#0d1117',
          300: '#090d12',
          card: '#161b22',
          hover: '#30363d',
          border: '#30363d',
        },
        dnd: {
          red: '#e53e3e',
          'red-dark': '#9b2c2c',
          gold: '#d97706',
          'gold-light': '#fbbf24',
          amber: '#f59e0b',
          parchment: '#fef3c7',
          blue: '#3b82f6',
          emerald: '#10b981',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['"FF Scala Sans"', '"ScalaSansOffc"', '"Scaly Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"MrsEavesAllSmallCaps"', '"Mrs Eaves Small Caps"', '"Mr Eaves Small Caps"', 'Cinzel', 'Georgia', 'serif'],
        heading: ['"MrsEavesAllSmallCaps"', '"Mrs Eaves Small Caps"', '"Mr Eaves Small Caps"', 'Cinzel', 'Georgia', 'serif'],
        book: ['"Bookmania"', '"Bookinsanity"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        scaly: ['"FF Scala Sans"', '"ScalaSansOffc Bold"', '"ScalaSansOffc"', '"Scaly Sans"', 'sans-serif'],
        scalyCaps: ['"Scaly Sans Caps"', '"Scala Sans Caps"', '"FF Scala Sans"', '"Scaly Sans"', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
