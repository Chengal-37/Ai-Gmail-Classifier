
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(241, 78%, 62%)', // A vibrant purple
          light: 'hsl(241, 78%, 72%)',
        },
        accent: {
          DEFAULT: 'hsl(348, 100%, 61%)', // A punchy pink/red
          light: 'hsl(348, 100%, 71%)',
        },
        dark: {
          900: 'hsl(210, 20%, 5%)',
          800: 'hsl(210, 20%, 10%)',
          700: 'hsl(210, 18%, 18%)',
          600: 'hsl(210, 15%, 30%)',
          border: 'hsl(210, 15%, 22%)',
        },
        light: {
          900: 'hsl(210, 20%, 95%)',
          800: 'hsl(210, 20%, 80%)',
        }
      },
      animation: {
        'gradient-bg': 'gradient-bg 15s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
      keyframes: {
        'gradient-bg': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backgroundImage: {
        'animated-gradient': 'linear-gradient(-45deg, hsl(210, 20%, 10%), hsl(241, 78%, 40%), hsl(348, 100%, 50%), hsl(210, 20%, 10%))',
      },
      backgroundSize: {
        '400%': '400% 400%',
      },
      boxShadow: {
        'glow-primary': '0 0 20px hsl(241, 78%, 62%, 0.5)',
        'glow-accent': '0 0 20px hsl(348, 100%, 61%, 0.5)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

module.exports = config;
