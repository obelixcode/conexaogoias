'use client';

import { useEffect } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useSafeDOM } from '@/hooks/useSafeDOM';
import { ClientOnly } from './ClientOnly';

function DynamicFaviconContent() {
  const { settings, isLoading } = useSettingsContext();
  const { safeCreateElement, safeAppendChild, safeRemoveElement, safeRemoveElements } = useSafeDOM();

  useEffect(() => {
    if (isLoading || !settings.faviconUrl) return;

    // Verificar se estamos no cliente
    if (typeof window === 'undefined' || !document?.head) return;

    let link: HTMLElement | null = null;
    let appleLink: HTMLElement | null = null;

    try {
      // Remove existing favicon links com verificação de segurança
      safeRemoveElements('link[rel*="icon"]');

      // Create new favicon link
      link = safeCreateElement('link', {
        rel: 'icon',
        type: 'image/x-icon',
        href: settings.faviconUrl
      });
      
      // Add to head
      if (link && document.head) {
        safeAppendChild(document.head, link);
      }

      // Also add apple-touch-icon for mobile
      appleLink = safeCreateElement('link', {
        rel: 'apple-touch-icon',
        href: settings.faviconUrl
      });
      
      if (appleLink && document.head) {
        safeAppendChild(document.head, appleLink);
      }
    } catch (error) {
      console.warn('Error updating favicon:', error);
    }

    // Cleanup function
    return () => {
      safeRemoveElement(link);
      safeRemoveElement(appleLink);
    };
  }, [settings.faviconUrl, isLoading, safeCreateElement, safeAppendChild, safeRemoveElement, safeRemoveElements]);

  return null; // This component doesn't render anything
}

export function DynamicFavicon() {
  return (
    <ClientOnly>
      <DynamicFaviconContent />
    </ClientOnly>
  );
}
