/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    extend: {
      colors: {
        premium: {
            black: "#0B0B0B",
            card: "#121212",
            glass: "rgba(255, 255, 255, 0.03)",
            
            // 👇 AQUÍ CAMBIAS LOS TONOS
            green: "#11fb1c",  // Tu verde neón actual
            red: "#ff0808",    // Un rojo neón vibrante (puedes cambiarlo)
            
            text: {
                main: "#E5E5E5",
                dim: "#8E8E8E",
            }
        }, 
        tremor: {
          brand: {
            faint: "#1A1A1A", 
            muted: "#2A2A2A",
            subtle: "#BDFF00", 
            DEFAULT: "#BDFF00",
            emphasis: "#D4FF5C", 
            inverted: "#000000", 
          },
          background: {
            muted: "#0B0B0B",
            subtle: "#121212",
            DEFAULT: "#121212",
            emphasis: "#262626",
          },
          content: {
            subtle: "#525252",
            DEFAULT: "#8E8E8E",
            emphasis: "#E5E5E5",
            strong: "#FFFFFF",
            inverted: "#000000",
          },
        },
      },
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};