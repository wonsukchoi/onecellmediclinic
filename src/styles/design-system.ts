// Design System for OneCell Medi Clinic
export const designSystem = {
  colors: {
    // Primary brand colors inspired by medical professionalism
    primary: '#0055a5',         // Professional medical blue
    primaryDark: '#003d7a',     // Darker blue for hover states
    primaryLight: '#4a8bc2',    // Lighter blue for accents

    // Accent colors for warmth and elegance
    accent: '#dac4a5',          // Warm beige/gold
    accentDark: '#c5a883',      // Darker beige
    accentLight: '#e8d7bf',     // Lighter beige

    // Text colors for optimal readability
    text: {
      primary: '#333333',       // Dark gray for main text
      secondary: '#666666',     // Medium gray for secondary text
      light: '#999999',         // Light gray for muted text
      white: '#ffffff',         // White text for dark backgrounds
      inverse: '#ffffff'        // White text for contrast
    },

    // Background colors for different sections
    background: {
      white: '#ffffff',         // Pure white for cards and sections
      light: '#f8f9fa',         // Very light gray for subtle backgrounds
      section: '#fafbfc',       // Slightly different shade for alternating sections
      overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
      paper: '#ffffff'          // Paper-like white for elevated surfaces
    },

    // Status colors for feedback
    status: {
      success: '#10b981',       // Green for success states
      warning: '#f59e0b',       // Amber for warning states
      error: '#ef4444',         // Red for error states
      info: '#3b82f6'           // Blue for informational messages
    },

    // Border and line colors
    border: {
      light: '#e5e7eb',         // Light border for subtle separation
      medium: '#d1d5db',        // Medium border for form elements
      dark: '#9ca3af',          // Darker border for emphasis
      accent: '#dac4a5'         // Accent color border
    }
  },

  // Typography scale following modern design principles
  typography: {
    fontSize: {
      xs: '0.75rem',            // 12px - Small labels, captions
      sm: '0.875rem',           // 14px - Small text, secondary info
      base: '1rem',             // 16px - Base body text
      lg: '1.125rem',           // 18px - Large body text
      xl: '1.25rem',            // 20px - Small headings
      '2xl': '1.5rem',          // 24px - Medium headings
      '3xl': '1.875rem',        // 30px - Large headings
      '4xl': '2.25rem',         // 36px - Extra large headings
      '5xl': '3rem',            // 48px - Display headings
      '6xl': '3.75rem'          // 60px - Hero headings
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },

    lineHeight: {
      tight: '1.25',            // For headings
      normal: '1.5',            // For body text
      relaxed: '1.625',         // For comfortable reading
      loose: '2'                // For very relaxed reading
    },

    fontFamily: {
      primary: "'Pretendard', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      heading: "'Pretendard', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      mono: "'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace"
    }
  },

  // Consistent spacing scale using 8px base unit
  spacing: {
    xs: '0.5rem',               // 8px
    sm: '0.75rem',              // 12px
    md: '1rem',                 // 16px
    lg: '1.5rem',               // 24px
    xl: '2rem',                 // 32px
    '2xl': '3rem',              // 48px
    '3xl': '4rem',              // 64px
    '4xl': '6rem',              // 96px
    '5xl': '8rem',              // 128px
    '6xl': '12rem'              // 192px
  },

  // Border radius for consistent rounded corners
  borderRadius: {
    none: '0',
    sm: '0.25rem',              // 4px
    base: '0.375rem',           // 6px
    md: '0.5rem',               // 8px
    lg: '0.75rem',              // 12px
    xl: '1rem',                 // 16px
    '2xl': '1.5rem',            // 24px
    '3xl': '2rem',              // 32px
    full: '9999px'              // Fully rounded
  },

  // Box shadow for depth and elevation
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },

  // Z-index values for proper layering
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  },

  // Animation and transition values
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },

    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
      easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    }
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',    // Small devices
    md: '768px',    // Medium devices
    lg: '1024px',   // Large devices
    xl: '1280px',   // Extra large devices
    '2xl': '1536px' // 2X large devices
  },

  // Common component sizing
  sizing: {
    header: {
      height: '4rem',           // 64px - Standard header height
      heightMobile: '3.5rem'    // 56px - Mobile header height
    },

    button: {
      sm: '2rem',               // 32px - Small button height
      base: '2.5rem',           // 40px - Standard button height
      lg: '3rem'                // 48px - Large button height
    },

    input: {
      sm: '2rem',               // 32px - Small input height
      base: '2.5rem',           // 40px - Standard input height
      lg: '3rem'                // 48px - Large input height
    }
  }
} as const

// CSS Custom Properties generator for easy CSS integration
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {}

  // Generate color variables
  Object.entries(designSystem.colors).forEach(([category, colors]) => {
    if (typeof colors === 'string') {
      cssVars[`--color-${category}`] = colors
    } else {
      Object.entries(colors).forEach(([name, value]) => {
        cssVars[`--color-${category}-${name}`] = value
      })
    }
  })

  // Generate spacing variables
  Object.entries(designSystem.spacing).forEach(([size, value]) => {
    cssVars[`--spacing-${size}`] = value
  })

  // Generate typography variables
  Object.entries(designSystem.typography.fontSize).forEach(([size, value]) => {
    cssVars[`--text-${size}`] = value
  })

  // Generate border radius variables
  Object.entries(designSystem.borderRadius).forEach(([size, value]) => {
    cssVars[`--radius-${size}`] = value
  })

  // Generate shadow variables
  Object.entries(designSystem.shadow).forEach(([size, value]) => {
    cssVars[`--shadow-${size}`] = value
  })

  return cssVars
}

// Type definitions for TypeScript support
export type DesignSystemColors = typeof designSystem.colors
export type DesignSystemSpacing = keyof typeof designSystem.spacing
export type DesignSystemFontSize = keyof typeof designSystem.typography.fontSize
export type DesignSystemBorderRadius = keyof typeof designSystem.borderRadius
export type DesignSystemShadow = keyof typeof designSystem.shadow

// Helper functions for common design system operations
export const getColor = (path: string): string => {
  const parts = path.split('.')
  let current: any = designSystem.colors

  for (const part of parts) {
    current = current[part]
    if (current === undefined) {
      throw new Error(`Color path "${path}" not found in design system`)
    }
  }

  return typeof current === 'string' ? current : '#000000'
}

export const getSpacing = (size: DesignSystemSpacing): string => {
  return designSystem.spacing[size] || '0'
}

export const getFontSize = (size: DesignSystemFontSize): string => {
  return designSystem.typography.fontSize[size] || '1rem'
}

export const getBorderRadius = (size: DesignSystemBorderRadius): string => {
  return designSystem.borderRadius[size] || '0'
}

export const getShadow = (size: DesignSystemShadow): string => {
  return designSystem.shadow[size] || 'none'
}