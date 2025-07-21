/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { filter: 'blur(2px) brightness(1.03)' },
          '50%': { filter: 'blur(6px) brightness(1.10)' },
        },
      },
      animation: {
        'glow': 'glow 2.5s ease-in-out infinite',
        'glow-pulse': 'glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} 