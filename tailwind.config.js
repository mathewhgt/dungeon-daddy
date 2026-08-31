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
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'Cambria', 'serif'],
        book: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
