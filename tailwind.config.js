/** @type {import('tailwindcss').Config} */
const jungoGreen = {
  50: '#EEF8EC',
  100: '#DDF1D5',
  200: '#BFE3B3',
  300: '#6BAC44',
  400: '#4EAF52',
  500: '#008000',
  600: '#006B00',
  700: '#005A00',
  800: '#004700',
};

const jungoBrown = {
  50: '#F5F1EE',
  100: '#EBE2DB',
  200: '#D9CCBF',
  300: '#B8A392',
  400: '#8F7563',
  500: '#7A5E4B',
  600: '#614B36',
  700: '#4E3B2A',
  800: '#3B2D20',
};

const jungoGray = {
  50: '#F5F5F5',
  100: '#EBEBEB',
  200: '#DCDCDC',
  300: '#B4B4B4',
  400: '#8E8E8E',
  500: '#777777',
  600: '#666666',
  700: '#555555',
  800: '#444444',
  900: '#333333',
  950: '#1F1F1F',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: jungoGray,
        green: jungoGreen,
        emerald: jungoGreen,
        'jungo-green': jungoGreen,
        'jungo-brown': jungoBrown,
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
