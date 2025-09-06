/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(230, 100%, 50%)",
        accent: "hsl(180, 70%, 45%)",
        bg: "hsl(220, 15%, 95%)",
        surface: "hsl(0, 0%, 100%)",
        textPrimary: "hsl(220, 15%, 15%)",
        textSecondary: "hsl(220, 15%, 45%)",
        // Dark theme colors
        darkBg: "hsl(240, 10%, 8%)",
        darkSurface: "hsl(240, 10%, 12%)",
        darkCard: "hsl(240, 10%, 16%)",
        purple: {
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9"
        },
        blue: {
          500: "#3B82F6",
          600: "#2563EB"
        }
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px"
      },
      spacing: {
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px"
      },
      boxShadow: {
        card: "0 4px 16px hsla(0, 0%, 0%, 0.1)",
        modal: "0 12px 32px hsla(0, 0%, 0%, 0.16)",
        glow: "0 0 20px rgba(139, 92, 246, 0.3)"
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)' }
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}