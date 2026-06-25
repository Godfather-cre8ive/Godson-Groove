import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5C842',
          'yellow-dark': '#E0B325',
          'yellow-light': '#FDE68A',
          'yellow-pale': '#FFFBEB',
          dark: '#1A1209',
          'dark-800': '#2D1F0A',
          'dark-700': '#3D2D12',
          cream: '#FFF9ED',
          charcoal: '#2C2C2C',
          gray: '#6B6B6B',
          'gray-light': '#F5F5F0',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounceSoft 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-pattern.svg')",
        'brand-gradient': 'linear-gradient(135deg, #F5C842 0%, #E0B325 100%)',
        'dark-gradient': 'linear-gradient(180deg, #1A1209 0%, #2D1F0A 100%)',
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(245, 200, 66, 0.25)',
        'brand-lg': '0 8px 48px rgba(245, 200, 66, 0.35)',
        'soft': '0 2px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
