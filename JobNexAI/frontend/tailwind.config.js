/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecf5ff',
          100: '#d0e8ff',
          200: '#a6d0ff',
          300: '#70b0ff',
          400: '#3a88ff',
          500: '#0066FF',
          600: '#0052d4',
          700: '#0040a8',
          800: '#00347d',
          900: '#002b5c',
        },
        secondary: {
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#d9bfff',
          300: '#bf94ff',
          400: '#a55aff',
          500: '#8B3DDE',
          600: '#7528c4',
          700: '#6222a5',
          800: '#501d86',
          900: '#3e1568',
        },
        accent: {
          cyan: '#00D4FF',
          pink: '#FF2D95',
          violet: '#7C3AED',
          amber: '#FFB800',
          emerald: '#00E676',
        },
        surface: {
          DEFAULT: '#f8f9fc',
          dark: '#0a0a0f',
          card: '#ffffff',
          muted: '#f1f3f8',
        },
      },
      backgroundImage: {
        'mesh-gradient': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.07), 0 2px 8px rgba(0, 0, 0, 0.03)',
        'glass-xl': '0 24px 64px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 20px rgba(0, 102, 255, 0.15), 0 0 40px rgba(0, 102, 255, 0.1)',
        'glow-secondary': '0 0 20px rgba(139, 61, 222, 0.15), 0 0 40px rgba(139, 61, 222, 0.1)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.15), 0 0 40px rgba(0, 212, 255, 0.1)',
        'glow-pink': '0 0 20px rgba(255, 45, 149, 0.15), 0 0 40px rgba(255, 45, 149, 0.1)',
        'glow-strong': '0 0 30px rgba(0, 102, 255, 0.25), 0 0 60px rgba(0, 102, 255, 0.1)',
        'card': '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.06)',
        '3d': '0 20px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)',
      },
      animation: {
        'morph': 'morph 6s ease-in-out infinite',
        'drift': 'drift 12s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'tilt-in': 'tilt-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'slide-up-fluid': 'slide-up-fluid 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-fluid': 'fade-in-fluid 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'ripple': 'ripple 1s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.05) rotate(3deg)' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'scale(0.98) rotate(-2deg)' },
          '75%': { transform: 'scale(1.02) rotate(2deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-20px, 30px) scale(0.95)' },
          '75%': { transform: 'translate(20px, 20px) scale(1.02)' },
        },
        breathe: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'tilt-in': {
          '0%': { opacity: 0, transform: 'translateY(40px) rotateX(10deg) scale(0.95)' },
          '100%': { opacity: 1, transform: 'translateY(0) rotateX(0) scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 102, 255, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 102, 255, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'slide-up-fluid': {
          '0%': { opacity: 0, transform: 'translateY(30px) scale(0.96)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        'fade-in-fluid': {
          '0%': { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.1)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 0.5 },
          '100%': { transform: 'scale(4)', opacity: 0 },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
