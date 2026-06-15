import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Color Palettes ──────────────────────────────────────────────────────────

export const LIGHT_THEME = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF1F8',
  surfaceCard: '#FFFFFF',
  text: '#1A237E',           // Deep navy
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  disabled: '#D1D5DB',
  overlay: 'rgba(26,35,126, 0.5)',
  cardShadow: 'rgba(26,35,126, 0.08)',
  statusBarStyle: 'dark-content',
};

export const DARK_THEME = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  surfaceCard: '#1E1E1E',
  text: '#E0E0E0',           // Off-white
  textSecondary: '#A0A0A0',
  textLight: '#707070',
  border: '#333333',
  disabled: '#444444',
  overlay: 'rgba(0,0,0,0.7)',
  cardShadow: 'rgba(0,0,0,0.4)',
  statusBarStyle: 'light-content',
};

// ─── Shared tokens (same in both modes) ──────────────────────────────────────

export const SHARED = {
  accent: '#00BFA5',         // Teal — brand identity
  accentLight: '#33CCBB',
  accentDark: '#009B8D',
  primary: '#1B1F3B',        // Deep indigo (used in gradients)
  primaryLight: '#2A3060',
  error: '#E53935',
  errorLight: '#FFEBEE',
  success: '#43A047',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  white: '#FFFFFF',
  black: '#000000',
};

// ─── Context ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@savconnect_dark_mode';

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: LIGHT_THEME,
  colors: { ...LIGHT_THEME, ...SHARED },
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Rehydrate preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val !== null) setIsDarkMode(val === 'true');
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {});
      return next;
    });
  };

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const colors = { ...theme, ...SHARED };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Convenience hook ─────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}
