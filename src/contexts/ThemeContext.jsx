import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'kd-theme';
const ThemeContext = createContext(null);

const resolveInitial = () => {
  if (typeof window === 'undefined') return 'kd-light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'kd-light' || stored === 'kd-dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'kd-dark' : 'kd-light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(resolveInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'kd-dark' ? 'kd-light' : 'kd-dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'kd-dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
