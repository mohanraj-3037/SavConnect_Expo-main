// SavConnect Design Tokens
export const COLORS = {
  primary: '#1B1F3B',        // Deep indigo
  primaryLight: '#2A3060',
  accent: '#00BFA6',         // Vibrant teal
  accentLight: '#33CCBB',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF1F8',
  error: '#E53935',
  errorLight: '#FFEBEE',
  success: '#43A047',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  disabled: '#D1D5DB',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(27, 31, 59, 0.5)',
  cardShadow: 'rgba(27, 31, 59, 0.08)',
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4 },
  button: { fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// React Native Paper custom theme
export const paperTheme = {
  colors: {
    primary: COLORS.primary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.error,
    text: COLORS.text,
    onSurface: COLORS.text,
    disabled: COLORS.disabled,
    placeholder: COLORS.textLight,
    notification: COLORS.accent,
  },
};
