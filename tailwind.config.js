/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tg-bg':       'var(--tg-theme-bg-color)',
        'tg-text':     'var(--tg-theme-text-color)',
        'tg-hint':     'var(--tg-theme-hint-color)',
        'tg-button':   'var(--tg-theme-button-color)',
        'tg-btn-text': 'var(--tg-theme-button-text-color)',
        'tg-sec-bg':   'var(--tg-theme-secondary-bg-color)',
        'tg-link':     'var(--tg-theme-link-color)',
      },
      fontFamily: {
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      },
    },
  },
  plugins: [],
}
