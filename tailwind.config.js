/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        purple: {
          0:"#2D132C",
          50: "#1F0D1F",
          100: "#170A16"
        },
        pink: {
          0: "#F1557B",
          50: "#A93B56",
          100: "#602231"
        },
        green: {
          0: "#A1EE40",
          100: "#405F1A"
        },
        yellow: {
          0: "#EEBD40",
          100: "#5F4C1A"
        },
        orange: {
          0: "#F15555"
        }
      }
    },
  },
  plugins: [],
}
