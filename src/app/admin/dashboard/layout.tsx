import { Metadata } from 'next';
import { SettingsService } from '@/lib/settingsService';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await SettingsService.getSettings();
  
  return {
    title: `Dashboard - Painel Administrativo | ${settings.siteName}`,
    description: `Painel administrativo do portal ${settings.siteName}`,
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
