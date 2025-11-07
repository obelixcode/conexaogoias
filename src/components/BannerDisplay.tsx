'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Banner } from '@/types/banner';
import { BannerService } from '@/lib/bannerService';
import { isFirebaseStorageUrl } from '@/utils';

interface BannerDisplayProps {
  banners: Banner[];
  className?: string;
  variant?: 'default' | 'header' | 'sidebar';
}

export function BannerDisplay({ banners, className = '', variant = 'default' }: BannerDisplayProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (banners.length === 0) {
    // Se não houver banners, não renderiza nada (removendo o placeholder)
    return null;
  }

  const handleBannerClick = async (banner: Banner) => {
    try {
      await BannerService.recordBannerClick(banner.id, banner.position, {
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });
      
      // Open link in new tab
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error recording banner click:', error);
      // Still open the link even if tracking fails
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageError = (bannerId: string, imageUrl: string) => {
    console.warn(`Erro ao carregar imagem do banner ${bannerId}:`, imageUrl);
    setImageErrors(prev => new Set(prev).add(bannerId));
  };

  // Função para validar se a URL da imagem é válida
  const isValidImageUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    
    // Verificar se é uma URL válida
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };


  // Função para tentar corrigir URLs problemáticas
  const fixImageUrl = (url: string): string => {
    if (!url) return url;
    
    // Se a URL já é válida, retornar como está
    if (isValidImageUrl(url)) {
      return url;
    }
    
    // Tentar corrigir URLs do Firebase Storage
    if (url.includes('firebasestorage.googleapis.com')) {
      // Se já é uma URL do Firebase Storage, retornar como está
      return url;
    }
    
    // Se contém apenas o ID do arquivo, tentar construir a URL
    if (url.length > 10 && !url.includes('://')) {
      // Assumir que é um ID do Firebase Storage e construir a URL
      return `https://firebasestorage.googleapis.com/v0/b/aconexaogoias.firebasestorage.app/o/${encodeURIComponent(url)}?alt=media`;
    }
    
    return url;
  };

  // Função para verificar se a imagem pode ser carregada
  const canLoadImage = (url: string): boolean => {
    if (!url || !isValidImageUrl(url)) return false;
    
    // Para URLs do Firebase Storage, sempre tentar carregar
    if (url.includes('firebasestorage.googleapis.com')) {
      return true;
    }
    
    return true;
  };

  // Definir altura baseada na variante
  const getHeight = () => {
    switch (variant) {
      case 'header':
        return 'h-48 md:h-64';
      case 'sidebar':
        return 'h-32';
      default:
        return 'h-32';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => {
        const hasImageError = imageErrors.has(banner.id);
        const fixedImageUrl = fixImageUrl(banner.image);
        const hasInvalidUrl = !isValidImageUrl(fixedImageUrl);
        const canLoad = canLoadImage(fixedImageUrl);
        
        return (
          <div
            key={banner.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-white border border-gray-200"
            onClick={() => handleBannerClick(banner)}
          >
            <div className={`relative w-full ${getHeight()} overflow-hidden`}>
              {hasImageError || hasInvalidUrl || !canLoad ? (
                // Fallback quando a imagem não carrega ou URL é inválida
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">📢</div>
                    <p className="text-sm font-medium">{banner.title}</p>
                    <p className="text-xs opacity-80 mt-1">Clique para acessar</p>
                  </div>
                </div>
              ) : (
                // Usar Next.js Image igual à administração (sem sizes para Firebase Storage)
                <Image
                  src={fixedImageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => {
                    console.warn(`Erro ao carregar imagem do banner ${banner.id}:`, fixedImageUrl);
                    handleImageError(banner.id, fixedImageUrl);
                  }}
                  onLoad={() => {
                    console.log('✅ Imagem do banner carregada com sucesso:', banner.title);
                  }}
                  // Para URLs do Firebase Storage, usar unoptimized como na administração
                  unoptimized={isFirebaseStorageUrl(fixedImageUrl)}
                  // Adicionar prioridade para banners importantes
                  priority={variant === 'header'}
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            </div>
            
            {/* Banner title overlay - só mostra se a imagem carregou */}
            {banner.title && !hasImageError && !hasInvalidUrl && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className={`text-white font-medium line-clamp-2 ${variant === 'header' ? 'text-lg' : 'text-sm'}`}>
                  {banner.title}
                </p>
              </div>
            )}
            
          </div>
        );
      })}
    </div>
  );
}
