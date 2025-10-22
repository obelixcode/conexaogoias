import { Metadata } from 'next';
import { SettingsService } from '@/lib/settingsService';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await SettingsService.getSettings();
  
  return {
    title: `${settings.siteName} - Portal de Notícias de Goiás`,
    description: settings.siteDescription,
    openGraph: {
      title: `${settings.siteName} - Portal de Notícias de Goiás`,
      description: settings.siteDescription,
      type: 'website',
    },
  };
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bem-vindo ao Portal de Notícias
        </h1>
        <p className="text-lg text-gray-600">
          Carregando conteúdo...
        </p>
      </div>
    </div>
  );
}