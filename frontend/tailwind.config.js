/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1467ED', 600: '#1467ED', 700: '#084CBF', 50: '#EAF3FF', 100: '#D9E9FF', 200: '#B9D4FB' },
        line: '#DCE8FB',
        navy: '#101D42',
        sky: '#32A5FF',
        surface: '#F9FBFF',
        ink: '#101D42',
        muted: '#53627F',
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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 9px 24px rgba(27, 71, 133, .045)',
        lift: '0 16px 28px rgba(27, 71, 133, .09)',
        chip: '0 10px 30px -10px rgba(16,42,86,0.22)',
        glow: '0 9px 20px rgba(16, 100, 226, .20)',
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
