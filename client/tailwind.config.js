/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        'blur-gradient': 'radial-gradient(circle, #000000, #1f2937)'
      },
      backdropBlur: {
        xs: '2px' // Bạn có thể thêm các kích thước blur tùy chỉnh tại đây
      },
      colors: {
        'custom-button-control': '#7BAC79',
        'custom-button-control-hover': '#23831B',
        'custom-button-enroll': '#7BAC79',
        'custom-button-enroll-hover': '#628265',
        'custom-button-enroll-dark': '#7BAC79',
        'custom-background-category': '#D1E7D2',
        'custom-background-category-dark': '#D1E7D2',
        'custom-title': '#49C06A',
        'custom-tab': '#595959',
        'custom-background-tab': '#D1E7D2',
        'custom-background-tab-dark': '#D1E7D2',
        'custom-button-showmore': '#7BAC79',
        'custom-button-showall': '#7BAC79',
        'custom-button-showall-dark': '#7BAC79',
        'nav-light': '#ffffff',
        'nav-dark': '#222222',
        'line-dark': '#E0E0E0',
        'cate-text-dark': '#01C343',
        'shadow-cate': '#1f2937',
        'text-footer': '#00FF1A',
        'custom-img-footer': '#628265',
        'custom-button-footer': '#374B3F',
        'custom-bg-courseDetail': '#3C3C3C',
        'custom-bg-lesson': '#78CF7B',
        'custom-control-learning': '#313131'
      },
      spacing: {
        30: '7.5rem',
        26: '6.5rem'
      },
      gridTemplateRows: {
        'auto-min-content': 'min-content'
      },
      width: {
        112: '28rem',
        128: '32rem',
        200: '50rem',
        180: '43rem',
        160: '40rem',
        140: '35rem',
        120: '30rem',
        100: '25rem'
      },
      maxHeight: {
        128: '32rem'
      },
      height: {
        112: '28rem',
        128: '32rem',
        200: '50rem',
        180: '43rem',
        160: '40rem',
        140: '35rem',
        120: '30rem',
        100: '25rem'
      },
      textShadow: {
        default: '2px 2px 4px rgba(0, 0, 0, 0.5)'
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
        transform: 'transform'

      },
      boxShadow: {
        right: '8px 0 15px -3px rgba(0, 0, 0, 0.1), 4px 0 6px -2px rgba(0, 0, 0, 0.05)',
        bottom: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        custom: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      },
      aspectRatio: ['responsive']
    }
  },
  variants: {
    extend: {
      translate: ['responsive', 'group-hover', 'hover', 'focus'],
      transitionProperty: ['responsive', 'motion-safe', 'motion-reduce']
    }
  },
  plugins: [
    // require('@tailwindcss/transition'),
    // require('@tailwindcss/transform'),
    require('@tailwindcss/typography'),
    require('tailwindcss-transitions')(),
    require('tailwindcss-textshadow'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animated'),
    // require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.custom-scrollbar::-webkit-scrollbar': {
          width: '8px'
        },
        '.custom-scrollbar::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px'
        },
        '.custom-scrollbar::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)'
        }
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
    plugin(({ addVariant, e }) => {
      addVariant('sidebar-expanded', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => `.sidebar-expanded .${e(`sidebar-expanded${separator}${className}`)}`)
      })
    })
  ]
}
