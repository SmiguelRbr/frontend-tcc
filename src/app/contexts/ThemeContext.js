'use client'; // Necessário pois usa hooks e acede ao localStorage do browser

import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Estado inicial padrão (dark)
  const [theme, setTheme] = useState('dark');

  // useEffect corre apenas no cliente (browser)
  useEffect(() => {
    // 1. Verifica se há um tema guardado no localStorage
    const savedTheme = localStorage.getItem('@app-theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
      // 2. Aplica o data-theme na tag <html> para o CSS funcionar
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Função para alternar entre dark e light
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('@app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}