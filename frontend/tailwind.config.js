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
        plant: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        forest: {
          dark: '#081C15',
          deep: '#1B4332',
          medium: '#2D6A4F',
          moss: '#40916C',
          sage: '#52B788',
          mint: '#74C69D',
          pale: '#D8F3DC',
        },
        earth: {
          50: '#FAF7F2',
          100: '#F4ECE1',
          200: '#E8D7C3',
          300: '#D5BDA0',
          400: '#C2A17E',
          500: '#A3805B',
          600: '#846243',
          700: '#674B33',
          800: '#4D3726',
          900: '#35251B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'plant-sm': '0 2px 8px -1px rgba(45, 106, 79, 0.08), 0 1px 4px -1px rgba(45, 106, 79, 0.04)',
        'plant-md': '0 8px 24px -4px rgba(45, 106, 79, 0.12), 0 4px 12px -2px rgba(45, 106, 79, 0.08)',
        'plant-lg': '0 16px 36px -6px rgba(45, 106, 79, 0.16), 0 8px 18px -4px rgba(45, 106, 79, 0.1)',
        'glow-green': '0 0 25px -5px rgba(34, 197, 94, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
