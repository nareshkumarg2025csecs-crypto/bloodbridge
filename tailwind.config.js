/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1255B5',
          dark: '#0e4391',
          light: '#286fd6',
          50: '#F0F6FF',
          100: '#E0EDFE',
          200: '#BAdafD',
        },
        navy: {
          DEFAULT: '#102B55',
          dark: '#0a1d3b',
          light: '#1b3f79',
        },
        background: '#F5F8FD',
        card: '#FFFFFF',
        text: {
          DEFAULT: '#172B4D',
          main: '#172B4D',
          muted: '#6B7A99',
        },
        border: '#E3EAF5',
        alert: {
          DEFAULT: '#E5484D',
          bg: '#FDECEC',
          dark: '#c72e33',
        },
      },
      borderRadius: {
        card: '16px',
        cardLg: '20px',
        btn: '12px',
        input: '12px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(18, 85, 181, 0.06)',
        'soft-md': '0 8px 30px rgba(18, 85, 181, 0.08)',
        'soft-lg': '0 12px 40px rgba(18, 85, 181, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
