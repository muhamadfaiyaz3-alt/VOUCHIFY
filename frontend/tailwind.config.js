// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // --- Light Mode System (Corporate/Clean) ---
        'light-bg': '#f9fafb', // gray-50
        'light-card': '#ffffff', // white
        'light-text-primary': '#111827', // gray-900
        'light-text-secondary': '#374151', // gray-700

        // --- Dark Mode System (Tech/Sleek) ---
        'dark-bg': '#0f172a', // slate-900
        'dark-card': '#1e293b', // slate-800
        'dark-text-primary': '#f8fafc', // slate-50
        'dark-text-secondary': '#cbd5e1', // slate-300

        // --- Brand Accents ---
        'brand-primary': '#2563eb', // blue-600
        'brand-secondary': '#4f46e5', // indigo-600
        'brand-dark-primary': '#7c3aed', // purple-600
        'brand-dark-accent': '#22d3ee', // cyan-400
      },
      backgroundImage: {
        'primary-gradient-light': 'linear-gradient(to right, #3b82f6, #4f46e5)', // blue-500 -> indigo-600
        'primary-gradient-dark': 'linear-gradient(to right, #9333ea, #4f46e5)', // purple-600 -> indigo-600
      },
      animation: {
        // Existing marquee animation
        marquee: 'marquee 120s linear infinite',
        // --- New Gradient Animation ---
        'gradient-flow': 'gradient-keys 15s ease infinite',
      },
      keyframes: {
        // Existing marquee keyframes
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // --- New Gradient Keyframes ---
        'gradient-keys': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': '0% 50%',
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': '100% 50%',
          },
        }
      },
    },
  },
  plugins: [],
}