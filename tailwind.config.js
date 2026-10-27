/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: "#58cc02",
          "green-dark": "#46a302",
          blue: "#1cb0f6",
          "blue-dark": "#1899d6",
          yellow: "#ffc800",
          "yellow-dark": "#e5a500",
          red: "#ff4b4b",
          "red-dark": "#ea2b2b",
          purple: "#ce82ff",
          "purple-dark": "#a559d9",
          orange: "#ff9600",
          "orange-dark": "#e08300",
          pink: "#ff86d0",
          "pink-dark": "#e66cb5",
          gray: "#e5e5e5",
          "gray-dark": "#afafaf",
          card: "#ffffff",
        }
      },
      fontFamily: {
        bubble: ['"Nunito"', '"Fredoka"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(-4%)' },
          '50%': { transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.15)', opacity: '0.3' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      animation: {
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 1.8s ease-in-out infinite',
        'wiggle': 'wiggle 0.4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
