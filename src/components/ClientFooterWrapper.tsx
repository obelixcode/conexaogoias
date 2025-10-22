'use client';

import { useEffect, useState } from 'react';
import { Footer } from './Footer';
import { pageService } from '@/lib/services/PageService';
import { SettingsService } from '@/lib/settingsService';
import { SiteSettings } from '@/types/settings';

export function ClientFooterWrapper() {
  const [footerPages, setFooterPages] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pages, siteSettings] = await Promise.all([
          pageService.getFooterPages(),
          SettingsService.getSettings()
        ]);
        
        const validFooterPages = pages
          .filter(page => page.id)
          .map(page => ({
            id: page.id!,
            title: page.title,
            slug: page.slug
          }));
        
        setFooterPages(validFooterPages);
        setSettings(siteSettings);
      } catch (error) {
        console.error('Error loading footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return <Footer footerPages={footerPages} settings={settings || undefined} />;
}
