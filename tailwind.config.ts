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
      },
      keyframes: {
        'draw-ekg': {
          '0%': { strokeDashoffset: '260', opacity: '0' },
          '10%': { opacity: '1' },
          '60%': { strokeDashoffset: '0', opacity: '1' },
          '85%': { strokeDashoffset: '0', opacity: '0.2' },
          '100%': { strokeDashoffset: '0', opacity: '0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
