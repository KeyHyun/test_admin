/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Metronic-like color palette
        primary: {
          DEFAULT: '#1b84ff',
          hover: '#056ee9',
          light: '#e9f3ff',
        },
        sidebar: {
          DEFAULT: '#1e1e2d',
          hover: '#2a2a3c',
          active: '#2b2b40',
          border: '#2d2d3f',
        },
        dark: {
          DEFAULT: '#111827',
          secondary: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
