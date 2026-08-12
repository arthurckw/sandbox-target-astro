/** @type {import('tailwindcss').Config}
 *
 * Tailwind utilities map to CSS variables defined in src/styles/design-tokens.css.
 * Every color/shadow/radius/transition class here flows through the design system.
 * Don't add hardcoded hex values — extend design-tokens.css first, then alias here.
 */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../shared/components/**/*.{js,jsx,ts,tsx}',
  ],
  // Theme is class-based (<html class="dark|light">) so the theme toggle
  // in the island nav can flip without touching prefers-color-scheme.
  darkMode: 'class',
  theme: {
    extend: {
      // Colors use the rgb(var(--token-rgb) / <alpha-value>) pattern so
      // Tailwind's opacity modifiers (bg-danger/30, border-logo/15, etc.)
      // compose correctly at compile time. Tokens that don't need alpha
      // composition (soft variants, on-foreground, fixed-alpha borders)
      // stay as plain var(...) references.
      colors: {
        // Surfaces
        'background':         'rgb(var(--bg-primary-rgb) / <alpha-value>)',
        'bg':                 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
        'surface':            'rgb(var(--bg-surface-rgb) / <alpha-value>)',
        'surface-elevated':   'rgb(var(--bg-surface-elevated-rgb) / <alpha-value>)',

        // Text
        'primary':            'rgb(var(--text-primary-rgb) / <alpha-value>)',
        'secondary':          'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        'tertiary':           'rgb(var(--text-tertiary-rgb) / <alpha-value>)',

        // Functional status
        success:              'rgb(var(--color-success-rgb) / <alpha-value>)',
        'success-soft':       'var(--color-success-soft)',
        danger:               'rgb(var(--color-danger-rgb) / <alpha-value>)',
        'danger-soft':        'var(--color-danger-soft)',
        warning:              'rgb(var(--color-warning-rgb) / <alpha-value>)',
        'warning-soft':       'var(--color-warning-soft)',
        info:                 'rgb(var(--color-info-rgb) / <alpha-value>)',
        'info-soft':          'var(--color-info-soft)',

        // Monochrome highlight (was teal, now mono per design-tokens.css)
        accent:               'rgb(var(--color-accent-rgb) / <alpha-value>)',
        'accent-hover':       'var(--color-accent-hover)',
        'accent-soft':        'var(--color-accent-soft)',
        'accent-on':          'var(--color-accent-on)',

        // accent-bright aliased to accent (mono now).
        'accent-bright':      'rgb(var(--color-accent-rgb) / <alpha-value>)',

        // Brand mark — ONLY for the logo. Don't use elsewhere.
        logo:                 'rgb(var(--color-logo-rgb) / <alpha-value>)',
        'logo-on':            'var(--color-logo-on)',

        // Borders (fixed alpha in tokens — these read as-is)
        'border-subtle':      'var(--border-subtle)',
        'border-emphasis':    'var(--border-emphasis)',
        'border-bright':      'var(--border-bright)',

        // Code surface (Jupyter / IDE convention — dark in both modes)
        'code-bg':            'var(--code-bg)',
        'code-text':          'var(--code-text)',
        'code-keyword':       'var(--code-keyword)',
        'code-string':        'var(--code-string)',
        'code-comment':       'var(--code-comment)',
      },
      boxShadow: {
        'soft':     'var(--shadow-soft)',
        'elevated': 'var(--shadow-elevated)',
        'glass':    'var(--glass-shadow)',
        'island':   'var(--island-shadow)',
      },
      borderRadius: {
        'sm':   'var(--radius-sm)',
        'md':   'var(--radius-md)',
        'lg':   'var(--radius-lg)',
        'xl':   'var(--radius-xl)',
        '2xl':  'var(--radius-2xl)',
        'pill': 'var(--radius-pill)',
      },
      fontFamily: {
        display: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        body:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Roboto Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        'smooth': 'var(--ease-smooth)',
        'spring-soft':   'var(--ease-spring-soft)',
        'spring-bouncy': 'var(--ease-spring-bouncy)',
      },
      transitionDuration: {
        'micro':   'var(--duration-micro)',
        'overlay': 'var(--duration-overlay)',
        'fast':    'var(--duration-fast)',
        'slow':    'var(--duration-slow)',
      },
    },
  },
  plugins: [],
};
