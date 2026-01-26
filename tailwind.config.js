/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#2D3436",  // Elephant Grey
          primary: "#1B7D7D", // Medical Teal
          accent: "#E17055", // Savannah Orange
          light: "#F5F6FA", // Ivory White
          surface: "#FFFFFF",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
