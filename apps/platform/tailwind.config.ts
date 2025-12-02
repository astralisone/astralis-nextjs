import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        astralis: {
          navy: '#0A1B2B',
          blue: '#2B6CB0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
