/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      // ─── Paleta de la ferretería ──────────────────────────────
      colors: {
        primary: {
          50: '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          400: '#1D9E75',  // color principal
          600: '#0F6E56',
          800: '#085041',
          900: '#04342C',
        },
        danger: {
          50: '#FCEBEB',
          400: '#E24B4A',
          600: '#A32D2D',
          800: '#791F1F',
        },
        warning: {
          50: '#FAEEDA',
          400: '#BA7517',
          600: '#854F0B',
          800: '#633806',
        },
      },

      // ─── Fuentes ──────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // ─── Tamaños para POS (pantalla de caja) ──────────────────
      fontSize: {
        'pos-item': ['1.125rem', { lineHeight: '1.5rem' }],
        'pos-price': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'pos-total': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
      },

      // ─── Alturas específicas del layout ───────────────────────
      height: {
        'topbar': '56px',
        'sidebar': 'calc(100vh - 56px)',
      },
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
      },

      // ─── Animaciones ──────────────────────────────────────────
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },

  plugins: [],
};