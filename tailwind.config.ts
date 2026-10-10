import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // My KKR Brand — Kurukshetra Saffron
        saffron: {
          50:  '#FFF8F3',
          100: '#FFF0E6',
          200: '#FFD9B8',
          300: '#FFB87A',
          400: '#FF8C40',
          500: '#FF6B1A', // Primary brand
          600: '#E05510',
          700: '#B84010',
          800: '#8C3010',
          900: '#5C1E08',
        },
        gold: {
          400: '#F5C842',
          500: '#F5A623', // Secondary accent
          600: '#D4891A',
        },
        // Neutral palette
        ink: {
          50:  '#FAFAF8',
          100: '#F5F3EE',
          200: '#EDE8DF',
          300: '#DDD5C8',
          400: '#C4B9A8',
          500: '#A09080',
          600: '#7A6858',
          700: '#5A4C3C',
          800: '#3A3028',
          900: '#1C1208', // Darkest
          950: '#0F0A04',
        },
        // Status colors
        success: { 50: '#E8F5EE', 500: '#1A6B35', 600: '#145428' },
        warning: { 50: '#FEF6E2', 500: '#B5760A', 600: '#8C5808' },
        danger:  { 50: '#FBEAEA', 500: '#8C1A1A', 600: '#6B1414' },
        info:    { 50: '#EBF2FB', 500: '#1A3A8C', 600: '#142E70' },
      },
      fontFamily: {
        sans:  ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        hindi: ['var(--font-noto)', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'brand-sm': '0 4px 14px rgba(255, 107, 26, 0.25)',
        'brand-md': '0 8px 24px rgba(255, 107, 26, 0.35)',
        'brand-lg': '0 16px 48px rgba(255, 107, 26, 0.45)',
        'card':     '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'glass':    '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF6B1A 0%, #F5A623 100%)',
        'dark-gradient':  'linear-gradient(135deg, #1C1208 0%, #3A3028 100%)',
        'hero-gradient':  'linear-gradient(135deg, #FFFDF9 0%, #FFF8F3 40%, #FFF3EC 70%, #FFEDE0 100%)',
        'card-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,243,0.8) 100%)',
        'mesh-orange':    'radial-gradient(ellipse at 70% 30%, rgba(255,107,26,0.12) 0%, transparent 60%)',
        'mesh-gold':      'radial-gradient(ellipse at 30% 70%, rgba(245,166,35,0.10) 0%, transparent 60%)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-delay': 'float 8s ease-in-out infinite 2s',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'slide-up':    'slideUp 0.5s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%':      { transform: 'translateY(-16px) scale(1.02)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}

export default config
