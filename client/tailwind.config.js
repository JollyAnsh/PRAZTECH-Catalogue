/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          mauve: "#9080a5",
          indigo: "#2e075d",
          indigoDark: "#2d065c",
          amethyst: "#381c59",
          grape: "#6e568b",
          white: "#fefdfe",
          grey: "#665f6e",
          purple: "#5e3e8b",
          purpleLight: "#5f3f8c",
          whiteLight: "#fefefe",
          // Numeric scale for theme harmony:
          950: '#2d065c', // Indigo Ink 2
          900: '#2e075d', // Indigo Ink (Main text)
          800: '#381c59', // Dark Amethyst (Primary)
          700: '#4a2574',
          600: '#5e3e8b', // Rebecca Purple (Secondary)
          500: '#6e568b', // Dusty Grape
          400: '#9080a5', // Dusty Mauve (Accent)
          300: '#b4a7c4',
          200: '#dcd5e4',
          100: '#f0edf5',
          50: '#fefdfe',  // White (Background)
        },
        industrial: {
          950: '#24064a', // Deepest Indigo Ink
          900: '#2e075d', // Indigo Ink (Headers, main text)
          800: '#381c59', // Dark Amethyst (Primary actions, dark borders)
          700: '#5e3e8b', // Rebecca Purple (Secondary / Interactive)
          600: '#665f6e', // Dim Grey (Muted text / labels)
          500: '#6e568b', // Dusty Grape
          400: '#9080a5', // Dusty Mauve (Accent)
          300: '#c5b6d5', // Hairline mauve borders
          200: '#dfd5e8', // Visible soft mauve card borders
          100: '#efe9f5', // Soft purple secondary surface tint
          50: '#f7f4fa',  // Elegant Lavender Canvas Background
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
