import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  profanityFilter: boolean;
  soundEffects: boolean;
  largeText: boolean;
  backgroundAnimation: boolean;
  theme: 'light' | 'dark' | 'system';
  showQuotes: boolean;
  showSuggestions: boolean;
  showInternalAnalysis: boolean;
  version?: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const defaultSettings: Settings = {
  profanityFilter: true,
  soundEffects: true,
  largeText: false,
  backgroundAnimation: true,
  theme: 'light',
  showQuotes: false,
  showSuggestions: false,
  showInternalAnalysis: false,
  version: 2,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('halozy_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.darkMode !== undefined) {
          parsed.theme = parsed.darkMode ? 'dark' : 'light';
          delete parsed.darkMode;
        }
        // Force reset for newly added settings if version is less than 2
        if (!parsed.version || parsed.version < 2) {
          parsed.showQuotes = false;
          parsed.showSuggestions = false;
          parsed.showInternalAnalysis = false;
          parsed.version = 2;
        }
        return { ...defaultSettings, ...parsed, version: 2 };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('halozy_settings', JSON.stringify(settings));
    
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme, settings]);

  useEffect(() => {
    // Listen for system theme changes if set to system
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement;
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      <div className={settings.largeText ? 'text-lg' : 'text-base'}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
