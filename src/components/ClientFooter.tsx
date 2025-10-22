import { Footer } from './Footer';
import { pageService } from '@/lib/services/PageService';
import { SettingsService } from '@/lib/settingsService';

export async function ClientFooter() {
  try {
    const [footerPages, settings] = await Promise.all([
      pageService.getFooterPages(),
      SettingsService.getSettings()
    ]);
    
    // Filtrar apenas páginas com id definido e mapear para o tipo esperado pelo Footer
    const validFooterPages = footerPages
      .filter(page => page.id)
      .map(page => ({
        id: page.id!,
        title: page.title,
        slug: page.slug
      }));
    
    return <Footer footerPages={validFooterPages} settings={settings} />;
  } catch (error) {
    console.error('Error loading footer data:', error);
    // Fallback com configurações padrão
    const defaultSettings = {
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
      foundingYear: new Date().getFullYear(),
      faviconUrl: '',
      logoUrl: '',
      footerLogoUrl: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return <Footer settings={defaultSettings} />;
  }
}
