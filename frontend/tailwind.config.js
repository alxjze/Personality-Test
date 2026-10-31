/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#155EEF', 600: '#155EEF', 700: '#0F4BC4', 50: '#EAF2FF', 100: '#D6E6FF' },
        navy: '#102A56',
        sky: '#67B7FF',
        surface: '#F7FAFF',
        ink: '#172B4D',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,42,86,0.04), 0 4px 16px rgba(16,42,86,0.06)',
        lift: '0 8px 30px rgba(21,94,239,0.12)',
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
};
