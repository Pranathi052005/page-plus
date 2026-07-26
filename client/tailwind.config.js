/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#060709",
          surface: "#0d0f13",
          border: "#1f242e",
          grid: "rgba(0, 240, 255, 0.03)",
          accent: {
            blue: "#00f0ff",
            green: "#00ff88",
            amber: "#ffb300",
            red: "#ff3366",
            purple: "#bd00ff",
          }
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Share Tech Mono", "ui-monospace", "monospace"],
        display: ["Space Grotesk", "Outfit", "system-ui", "sans-serif"],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-glow': 'border-glow 4s ease infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 5px currentColor)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 15px currentColor)' }
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(0, 240, 255, 0.3)' },
          '50%': { borderColor: 'rgba(0, 240, 255, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
