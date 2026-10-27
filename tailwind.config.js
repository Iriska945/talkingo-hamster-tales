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
        // Liquid Glass Obsidian & Deep Space
        obsidian: {
          DEFAULT: "#000000",
          950: "#050507",
          900: "#09090C",
          850: "#0E0E12",
          800: "#141419",
          700: "#1E1E26",
          600: "#2B2B36",
        },
        // Liquid Glass Accents
        glass: {
          bg: "rgba(255, 255, 255, 0.04)",
          bgHover: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.12)",
          borderGlow: "rgba(255, 255, 255, 0.25)",
        },
        // Open Ethereal Ambient Highlights
        ambient: {
          blue: "#38bdf8",
          indigo: "#6366f1",
          purple: "#a855f7",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#f43f5e",
        },
        // Duo / Gamification mapped to refined neon accents on dark glass
        duo: {
          green: "#22c55e",
          "green-dark": "#16a34a",
          blue: "#38bdf8",
          "blue-dark": "#0284c7",
          yellow: "#fbbf24",
          "yellow-dark": "#d97706",
          red: "#f87171",
          "red-dark": "#dc2626",
          purple: "#c084fc",
          "purple-dark": "#9333ea",
          orange: "#fb923c",
          "orange-dark": "#ea580c",
          gray: "#27272a",
          "gray-dark": "#18181b",
          card: "#09090c",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      letterSpacing: {
        'open': '0.35em',
        'open-wide': '0.45em',
      },
      keyframes: {
        breathExpand: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.35' },
          '50%': { transform: 'scale(1.18)', opacity: '0.85' },
        },
        breathPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.2' },
          '50%': { transform: 'scale(1.35)', opacity: '0.05' },
        },
        wavePulse: {
          '0%, 100%': { transform: 'scaleY(0.35)', opacity: '0.4' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        orbGlow: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1) rotate(180deg)', opacity: '0.8' },
        }
      },
      animation: {
        'breath-expand': 'breathExpand 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'breath-pulse': 'breathPulse 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'wave-pulse': 'wavePulse 1.2s ease-in-out infinite',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
        'orb-glow': 'orbGlow 12s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
