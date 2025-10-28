'use client';

import { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { pageService } from '@/lib/services/PageService';
import { SettingsService } from '@/lib/settingsService';

export function ClientSideFooter() {
  const [footerData, setFooterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFooterData() {
      try {
        const [footerPages, settings] = await Promise.all([
          pageService.getFooterPages(),
          SettingsService.getSettings()
        ]);
        
        const validFooterPages = footerPages
          .filter(page => page.id)
          .map(page => ({
            id: page.id!,
            title: page.title,
            slug: page.slug
          }));
        
        setFooterData({ footerPages: validFooterPages, settings });
      } catch (error) {
        console.error('Error loading footer data:', error);
        // Fallback
        setFooterData({
          footerPages: [],
          settings: {
            siteName: 'Conexão Goiás',
            siteDescription: 'Portal de notícias de Goiás',
            siteUrl: 'https://conexaogoias.com',
            contactEmail: 'contato@conexaogoias.com',
            adminEmail: 'admin@conexaogoias.com',
            phone1: '',
            phone2: '',
            address: '',
            socialMedia: {
              facebook: '',
              twitter: '',
              instagram: '',
              youtube: '',
              whatsapp: ''
            },
            twitterHandle: '@conexaogoias',
            foundingYear: 2025,
            faviconUrl: '',
            logoUrl: '',
            footerLogoUrl: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadFooterData();
  }, []);

  if (isLoading || !footerData) {
    return (
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
        </div>
      </footer>
    );
  }

  return <Footer footerPages={footerData.footerPages} settings={footerData.settings} />;
}
