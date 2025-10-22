import { useState, useEffect } from 'react';
import { SettingsService } from '@/lib/settingsService';
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const siteSettings = await SettingsService.getSettings();
        setSettings(siteSettings);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
        setError('Erro ao carregar configurações do site');
        // Usar configurações padrão em caso de erro
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const refreshSettings = async () => {
    try {
      setError(null);
      const siteSettings = await SettingsService.getSettings();
      setSettings(siteSettings);
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      setError('Erro ao atualizar configurações do site');
    }
  };

  return {
    settings,
    isLoading,
    error,
    refreshSettings
  };
}
