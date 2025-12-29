import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Colour palette aligned with design system
      colors: {
        ink: '#0F172A',
        slate: {
          DEFAULT: '#1E293B',
          600: '#475569',
        },
        stone: '#64748B',
        cloud: '#F8FAFC',
        grid: '#E2E8F0',
        eucalypt: {
          light: '#D1FAE5',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        ocean: {
          light: '#DBEAFE',
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        ochre: {
          light: '#FEF3C7',
          DEFAULT: '#D97706',
          dark: '#B45309',
        },
        rust: '#EF4444',
      },
      // Typography - using CSS variables set in globals.css
      fontFamily: {
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // Type scale
      fontSize: {
        // Headings
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '400' }],
        'h1': ['3.5rem', { lineHeight: '1.1', fontWeight: '400' }],
        'h2': ['2.5rem', { lineHeight: '1.2', fontWeight: '400' }],
        'h3': ['1.75rem', { lineHeight: '1.3', fontWeight: '500' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        // Body
        'body': ['1.0625rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'eyebrow': ['0.8125rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.05em' }],
      },
      // Spacing rhythm (8px base)
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      // Border radius
      borderRadius: {
        DEFAULT: '6px',
        'lg': '8px',
        'xl': '12px',
      },
      // Box shadows
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'button-hover': '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
      // Max widths for content
      maxWidth: {
        'content': '65ch',
        'prose': '75ch',
      },
      // Animation timing
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      // Keyframes for page load animation
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out forwards',
        'draw-line': 'draw-line 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
