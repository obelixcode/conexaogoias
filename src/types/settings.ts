export interface SiteSettings {
  // Informações básicas
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  
  // Contatos
  contactEmail: string;
  adminEmail: string;
  phone1: string;
  phone2: string;
  address: string;
  
  // Redes sociais
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
  };
  
  // SEO
  twitterHandle: string;
  foundingYear: number;
  
  // Favicon
  faviconUrl: string;
  
  // Logo
  logoUrl: string;
  footerLogoUrl: string;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettingsFormData {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  adminEmail: string;
  phone1: string;
  phone2: string;
  address: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  twitterHandle: string;
  foundingYear: number;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Conexão Goiás',
  siteDescription: 'Portal de notícias de Goiás. Informação confiável e atualizada.',
  siteUrl: 'https://conexaogoias.com',
  contactEmail: 'contato@conexaogoias.com',
  adminEmail: 'admin@conexaogoias.com',
  phone1: '(62) 99999-9999',
  phone2: '(62) 3333-3333',
  address: 'Rua das Flores, 123\nCentro - Goiânia/GO',
  socialMedia: {
    facebook: 'https://facebook.com/conexaogoias',
    twitter: 'https://twitter.com/conexaogoias',
    instagram: 'https://instagram.com/conexaogoias',
    youtube: 'https://youtube.com/@conexaogoias',
    whatsapp: 'https://wa.me/5562999999999'
  },
  twitterHandle: '@conexaogoias',
  foundingYear: new Date().getFullYear(),
  faviconUrl: '',
  logoUrl: '',
  footerLogoUrl: '',
  createdAt: new Date(),
  updatedAt: new Date()
};
