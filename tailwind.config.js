/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8C61',
          dark: '#E55A2B',
        },
      },
      fontFamily: {
        // Default: Inter for user dashboard
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        // Manager dashboard: Arial/Helvetica
        manager: ['Arial', 'Helvetica', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        // User dashboard typography (chat interface scale)
        'xs': ['12px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'sm': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'base': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'lg': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'xl': ['18px', { lineHeight: '1.45', letterSpacing: '0', fontWeight: '600' }],
        '2xl': ['20px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        '3xl': ['24px', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '600' }],
        '4xl': ['28px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        // Label and caption sizes
        'label': ['12px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        'caption': ['11px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
}
