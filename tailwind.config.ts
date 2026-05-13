import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B14',
        'bg-soft': '#15152A',
        ink: '#000000',
        'cyber-pink': '#FF2E93',
        'cyber-pink-dim': '#CC1F75',
        'cyber-blue': '#00D9FF',
        'cyber-blue-dim': '#00A8C7',
        'electric-violet': '#B026FF',
        'neon-yellow': '#FFE600',
        'neon-lime': '#C7FF00',
        chrome: '#E8E8F4',
        'chrome-mid': '#B8B8CC',
        // Cosmic glass palette
        'space-deep': '#0A0E1F',
        'space-mid': '#15192E',
        'space-light': '#1F2547',
        'lock-violet': '#7C5FFF',
        'lock-violet-light': '#A78BFF',
        'lock-violet-dim': '#5B3FE0',
        'lock-glow': '#B26BFF',
        'lock-cyan': '#5BC8FF',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
        display: ['"Black Han Sans"', '"Pretendard Variable"', 'sans-serif'],
      },
      boxShadow: {
        sticker: '4px 4px 0 #000',
        'sticker-lg': '6px 6px 0 #000',
        'sticker-pink': '4px 4px 0 #FF2E93',
        'sticker-blue': '4px 4px 0 #00D9FF',
        'sticker-white': '4px 4px 0 #fff',
        'glow-pink': '0 0 28px rgba(255, 46, 147, 0.55)',
        'glow-blue': '0 0 28px rgba(0, 217, 255, 0.55)',
        'glow-violet': '0 0 28px rgba(124, 95, 255, 0.55)',
        'glow-violet-strong': '0 0 40px rgba(178, 107, 255, 0.7)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        wiggle: 'wiggle 1.6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pop-in': 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        sparkle: 'sparkle 1.8s ease-in-out infinite',
        'holo-shift': 'holoShift 5s ease infinite',
        'spin-slow': 'spin 18s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2.5deg)' },
          '50%': { transform: 'rotate(2.5deg)' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(0.85) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.15) rotate(20deg)' },
        },
        holoShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
