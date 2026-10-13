import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'billings_theme_preference_v1';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved;
    }
    return 'system';
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Compute resolved theme
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemDark]);

  // Apply to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const next: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Compact icon button for Top Navigation Header (mobile & desktop)
 */
export const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={
        resolvedTheme === 'dark'
          ? 'Mudar para Tema Claro (Sol)'
          : 'Mudar para Tema Escuro (Lua)'
      }
      aria-label="Alternar tema claro e escuro"
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/80 active:scale-95 border border-transparent dark:border-stone-700/60 ${className}`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 stroke-[2.2] animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-stone-600 stroke-[2.2] animate-in fade-in zoom-in duration-200" />
      )}
    </button>
  );
};

/**
 * Full Segmented Control for Menus and Settings (Claro, Escuro, Sistema)
 */
export const ThemeSegmentedSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200/70 dark:border-stone-700/70 text-xs font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-stone-900 shadow-xs dark:bg-stone-700 dark:text-white font-bold'
            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>Claro</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-stone-900 text-white shadow-xs dark:bg-stone-700 dark:text-white font-bold'
            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-blue-400" />
        <span>Escuro</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-white text-stone-900 shadow-xs dark:bg-stone-700 dark:text-white font-bold'
            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
        }`}
      >
        <Monitor className="w-3.5 h-3.5 text-stone-500 dark:text-stone-300" />
        <span>Auto</span>
      </button>
    </div>
  );
};
