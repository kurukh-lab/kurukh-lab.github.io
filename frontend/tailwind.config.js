/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#5D4037',
        'brand-secondary': '#8D6E63',
        'brand-accent': '#A1887F',
        'brand-neutral': '#EFEBE9',
      },
    },
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: [
      {
        kurukh: {
          "primary": "#7E57C2",
          "primary-focus": "#673AB7",
          "primary-content": "#ffffff",
          "secondary": "#FF9800",
          "secondary-focus": "#F57C00",
          "secondary-content": "#ffffff",
          "accent": "#5D4037",
          "accent-focus": "#4E342E",
          "accent-content": "#ffffff",
          "neutral": "#F5F5F5",
          "neutral-focus": "#E0E0E0",
          "neutral-content": "#424242",
          "base-100": "#ffffff",
          "base-200": "#F9F7FF",
          "base-300": "#EFEBE9",
          "base-content": "#1f2937",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "light",
      "cupcake",
    ],
    darkTheme: "cupcake",
  },
}

