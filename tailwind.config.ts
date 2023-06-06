import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        "urbanist": ["Urbanist", "sans-serif"],
      },
      colors: {
        primary: "#2563eb",
        dark: "#0f172a",
        primaryLight: "#00B1FD",
        secondaryLight: "#71FACA"
      }
    },
  },
  plugins: [],
} satisfies Config

