/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': {
          '400': '#fbbf24',
          '500': '#f59e0b', 
          '600': '#d97706',
        },
        'blue': {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
        }
      }
    }
  },
  plugins: [],
};
