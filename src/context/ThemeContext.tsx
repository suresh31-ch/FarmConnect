/**
 * FarmConnect Theme Context
 * Manages Dark Mode & Large Font Accessibility
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLargeFont: boolean;
  toggleLargeFont: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('farmconnect_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isLargeFont, setIsLargeFont] = useState<boolean>(() => {
    return localStorage.getItem('farmconnect_large_font') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('farmconnect_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('farmconnect_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (isLargeFont) {
      root.classList.add('large-font');
      localStorage.setItem('farmconnect_large_font', 'true');
    } else {
      root.classList.remove('large-font');
      localStorage.setItem('farmconnect_large_font', 'false');
    }
  }, [isLargeFont]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleLargeFont = () => setIsLargeFont(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, isLargeFont, toggleLargeFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
