import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { UserProvider } from '@/contexts/UserContext';
import { DynamicFavicon } from '@/components/DynamicFavicon';
import { SettingsService } from '@/lib/settingsService';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await SettingsService.getSettings();
    
    return {
      title: `${settings.siteName} - Portal de Notícias de Goiás`,
      description: settings.siteDescription,
      keywords: ['notícias', 'Goiás', 'Goiânia', 'política', 'esportes', 'economia', 'cidades'],
      authors: [{ name: settings.siteName }],
      creator: settings.siteName,
      publisher: settings.siteName,
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(settings.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
      openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: settings.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        title: `${settings.siteName} - Portal de Notícias de Goiás`,
        description: settings.siteDescription,
        siteName: settings.siteName,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${settings.siteName} - Portal de Notícias de Goiás`,
        description: settings.siteDescription,
        creator: settings.twitterHandle,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: 'your-google-verification-code',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Fallback metadata
    return {
      title: 'Conexão Goiás - Portal de Notícias de Goiás',
      description: 'Portal de notícias de Goiás com as principais informações sobre política, esportes, economia e cidades.',
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QWK5Z5C0PN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QWK5Z5C0PN');
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SettingsProvider>
          <UserProvider>
            <DynamicFavicon />
            {children}
          </UserProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}