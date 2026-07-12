/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          'blue-from':    'var(--brand-blue-from)',
          'blue-to':      'var(--brand-blue-to)',
          yellow:         'var(--brand-yellow)',
          'yellow-soft':  'var(--brand-yellow-soft)',
          'yellow-press': 'var(--brand-yellow-press)',
          cream:          'var(--brand-cream)',
          ink:            'var(--brand-ink)',
          text:           'var(--brand-text)',
          'text-muted':   'var(--brand-text-muted)',
          card:           'var(--brand-card)',
          'card-border':  'var(--brand-card-border)',
          'card-solid':   'var(--brand-card-solid)',
          'card-text':    'var(--brand-card-text)',
          danger:         'var(--brand-danger)',
          success:        'var(--brand-success)',
        },
        // Keep tg-* aliases for backwards compat; :root values are repointed to brand palette.
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
      boxShadow: {
        'brand-sm':     '0 2px 8px rgba(0, 0, 0, 0.12)',
        'brand-md':     '0 8px 24px rgba(0, 0, 0, 0.18)',
        'brand-yellow': '0 6px 20px rgba(255, 215, 0, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
