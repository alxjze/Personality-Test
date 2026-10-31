/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#155EEF', 600: '#155EEF', 700: '#0F4BC4', 50: '#EAF2FF', 100: '#D6E6FF', 200: '#B3D0FF' },
        navy: '#102A56',
        sky: '#67B7FF',
        surface: '#F7FAFF',
        ink: '#172B4D',
        muted: '#64748B',
        // Soft tag palette for career tendencies (matches the mockup's coloured chips)
        tag: {
          violet: '#5B4BDB', violetBg: '#EEEBFF',
          blue: '#155EEF', blueBg: '#EAF2FF',
          orange: '#C2570C', orangeBg: '#FFF1E6',
          teal: '#0E7C86', tealBg: '#E3F6F7',
          rose: '#BE3B5E', roseBg: '#FDEBF0',
          green: '#15803D', greenBg: '#E7F7EC',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,42,86,0.04), 0 8px 24px -12px rgba(16,42,86,0.10)',
        lift: '0 18px 40px -16px rgba(21,94,239,0.28)',
        chip: '0 10px 30px -10px rgba(16,42,86,0.22)',
        glow: '0 12px 32px -12px rgba(21,94,239,0.55)',
      },
      borderRadius: { xl2: '1.25rem', '4xl': '2rem' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        'scale-in': 'scale-in .5s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
