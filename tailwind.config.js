/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00ffff',
        'neon-magenta': '#ff00ff',
      },
    },
  },
  plugins: [],
};
