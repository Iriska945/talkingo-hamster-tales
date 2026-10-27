/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Open Inspired Mindful Palette
        open: {
          bg: "#FAF8F5",
          sand: "#F4F0E8",
          card: "#FFFFFF",
          border: "#EAE6DE",
          text: "#1C1A17",
          muted: "#78746D",
          subtle: "#A8A399",
          sage: "#3F634D",
          "sage-light": "#E8EFEA",
          terracotta: "#D2674E",
          "terracotta-light": "#F9EFEB",
          ochre: "#C49B52",
          "ochre-light": "#F8F3E8",
          slate: "#476579",
          "slate-light": "#EBF1F5",
          ink: "#141312",
        },
        // Legacy Duo mapping with refined modern tones
        duo: {
          green: "#3F634D",
          "green-dark": "#2E4A39",
          blue: "#476579",
          "blue-dark": "#344B5A",
          yellow: "#C49B52",
          "yellow-dark": "#A37E3B",
          red: "#D2674E",
          "red-dark": "#B24F38",
          purple: "#7E6B8F",
          "purple-dark": "#635272",
          orange: "#D87948",
          "orange-dark": "#B85F31",
          pink: "#C96D85",
          "pink-dark": "#A8536A",
          gray: "#EAE6DE",
          "gray-dark": "#A8A399",
          card: "#FFFFFF",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        open: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        bubble: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '26px',
        '4xl': '34px',
      },
      keyframes: {
        breathExpand: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.45' },
          '50%': { transform: 'scale(1.22)', opacity: '0.85' },
        },
        breathPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.45)', opacity: '0.1' },
        },
        wavePulse: {
          '0%, 100%': { transform: 'scaleY(0.4)', opacity: '0.5' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        'breath-expand': 'breathExpand 4s ease-in-out infinite',
        'breath-pulse': 'breathPulse 4s ease-in-out infinite',
        'wave-pulse': 'wavePulse 1.2s ease-in-out infinite',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
