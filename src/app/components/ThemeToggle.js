'use client';

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  // O componente conecta-se ao contexto para saber o tema atual e a função de trocar
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      onClick={toggleTheme} 
      style={{ 
        padding: '8px 16px',
        cursor: 'pointer',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--foreground)',
        fontWeight: 'bold',
        fontSize: '0.85rem'
      }}
    >
      Mudar para Tema {theme === 'dark' ? 'Claro' : 'Escuro'}
    </button>
  );
}