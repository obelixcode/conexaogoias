'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { SiteSettings } from '@/types/settings';

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const settingsData = useSettings();

  return (
    <SettingsContext.Provider value={settingsData}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
