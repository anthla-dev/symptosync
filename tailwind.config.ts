import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'draw-ekg': 'draw-ekg 3s ease-in-out infinite',
        'message-in': 'message-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'draw-ekg': {
          '0%': { strokeDashoffset: '260', opacity: '0' },
          '10%': { opacity: '1' },
          '60%': { strokeDashoffset: '0', opacity: '1' },
          '85%': { strokeDashoffset: '0', opacity: '0.2' },
          '100%': { strokeDashoffset: '0', opacity: '0' },
        },
        'message-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;