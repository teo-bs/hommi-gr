/**
 * Design Tokens - Single Source of Truth
 * Hommi Design System
 */

export const designTokens = {
  // Spacing Scale
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Size Scale (for interactive elements)
  size: {
    touchMin: '44px',      // WCAG minimum touch target
    buttonSm: '40px',
    buttonMd: '44px',
    buttonLg: '48px',
    inputHeight: '44px',
  },

  // Border Radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // Typography Scale
  typography: {
    sizes: {
      micro: '0.75rem',    // 12px
      small: '0.875rem',   // 14px
      base: '1rem',        // 16px
      lg: '1.125rem',      // 18px
      xl: '1.25rem',       // 20px
      '2xl': '1.5rem',     // 24px
      '3xl': '1.875rem',   // 30px
      '4xl': '2.25rem',    // 36px
      '5xl': '3rem',       // 48px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Transitions
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Layout
  layout: {
    containerMaxWidth: '1280px',
    containerPadding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
    sectionSpacing: {
      mobile: '48px',
      tablet: '64px',
      desktop: '80px',
    },
    gridGap: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
  },

  // Shadows (using design system tokens)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
} as const;

export type DesignTokens = typeof designTokens;
