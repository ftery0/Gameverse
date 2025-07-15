/** @type {import('tailwindcss').Config} */
import { stylePreset } from '../../packages/style/tailwind/tailwind.preset';

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}" 
  ],
  theme: {
    extend: {},
  },
  presets: [stylePreset],
  plugins: [],
};
