'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BannerService } from '@/lib/bannerService';
import { Banner } from '@/types/banner';

export function BannerTest() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true);
        const activeBanners = await BannerService.getActiveBanners();
        console.log('Banners carregados:', activeBanners);
        setBanners(activeBanners);
      } catch (err) {
        console.error('Erro ao carregar banners:', err);
        setError('Erro ao carregar banners');
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando banners...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Erro: {error}</div>;
  }

  if (banners.length === 0) {
    return <div className="p-4">Nenhum banner encontrado</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Teste de Banners</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{banner.title}</h3>
            <p className="text-sm text-gray-600 mb-2">ID: {banner.id}</p>
            <p className="text-sm text-gray-600 mb-2">Posição: {banner.position}</p>
            <p className="text-sm text-gray-600 mb-4 break-all">URL: {banner.image}</p>
            
            <div className="relative w-full h-48 bg-gray-100 rounded">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover rounded"
                onError={() => {
                  console.error(`Erro ao carregar imagem do banner ${banner.id}:`, banner.image);
                }}
                onLoad={() => {
                  console.log(`✅ Imagem carregada: ${banner.title}`);
                }}
                unoptimized={banner.image.includes('firebasestorage.googleapis.com')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
