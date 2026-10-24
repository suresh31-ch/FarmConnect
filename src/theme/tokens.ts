/**
 * FarmConnect Design System Tokens
 * Reusable theme design tokens for FarmConnect - AI Powered Smart Agriculture Ecosystem
 */

export const colors = {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32', // Main Primary
    900: '#1B5E20',
    950: '#0A2E0C',
  },
  secondary: {
    DEFAULT: '#66BB6A',
    light: '#A5D6A7',
    dark: '#388E3C',
  },
  accent: {
    DEFAULT: '#FFC107', // Amber Gold
    light: '#FFD54F',
    dark: '#FFA000',
    glow: 'rgba(255, 193, 7, 0.3)',
  },
  success: {
    DEFAULT: '#43A047',
    light: '#E8F5E9',
  },
  warning: {
    DEFAULT: '#FF9800',
    light: '#FFF3E0',
  },
  danger: {
    DEFAULT: '#E53935',
    light: '#FFEBEE',
  },
  info: {
    DEFAULT: '#0288D1',
    light: '#E0F7FA',
  },
  background: {
    light: '#F4FBF7', // Soft white with subtle green tint
    lightSecondary: '#FFFFFF',
    dark: '#0B1910', // Deep organic dark emerald
    darkSecondary: '#122619',
    cardLight: 'rgba(255, 255, 255, 0.85)',
    cardDark: 'rgba(18, 38, 25, 0.75)',
  },
  text: {
    light: {
      primary: '#0F291E',
      secondary: '#4A6B5D',
      muted: '#819C90',
    },
    dark: {
      primary: '#F0FDF4',
      secondary: '#A7F3D0',
      muted: '#6EE7B7',
    }
  }
};

export const typography = {
  fontFamily: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px', // Standard card border-radius requested
  '2xl': '24px',
  full: '9999px',
};

export const shadows = {
  subtle: '0 4px 20px -2px rgba(46, 125, 50, 0.08)',
  card: '0 10px 30px -5px rgba(15, 41, 30, 0.08)',
  cardDark: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  glow: '0 0 25px rgba(46, 125, 50, 0.35)',
};

export const transitions = {
  default: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
};
