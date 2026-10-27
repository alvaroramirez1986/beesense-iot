/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        beesense: {
          gold: '#D4A017',
          amber: '#C8962E',
          navy: '#122B52',
          darkNavy: '#0B1C38',
          teal: '#2A9D8F',
          lightBg: '#F4F7FB',
        }
      },
      keyframes: {
        criticalBlink: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.65)'
          },
          '50%': {
            opacity: '0.45',
            transform: 'scale(0.99)',
            boxShadow: '0 0 22px 6px rgba(239, 68, 68, 0.45)'
          }
        },
        honeyPulse: {
          '0%, 100%': { opacity: '0.22', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.03)' }
        }
      },
      animation: {
        'critical-blink': 'criticalBlink 1.15s ease-in-out infinite',
        'honey-pulse': 'honeyPulse 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
