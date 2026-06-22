import React, { createContext, useCallback, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/constants/theme';

type Theme = typeof colors.light;
export type ThemePreference = 'light' | 'dark';

interface ThemeContextType {
  isDarkMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'dugoko_theme_preference';

const setThemeItem = (value: string): Promise<void> => {
  return SecureStore.setItemAsync(THEME_STORAGE_KEY, value);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start light unless the user explicitly toggles theme in this session.
  const [isDarkMode, setIsDarkMode] = useState(false);

  const setThemePreference = useCallback(async (preference: ThemePreference) => {
    await setThemeItem(preference);
    setIsDarkMode(preference === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    void setThemePreference(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setThemePreference]);

  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
