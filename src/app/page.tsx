'use client';

import { useState, useEffect } from 'react';
import { ClientHeader } from '@/components/ClientHeader';
import { ClientSideFooter } from '@/components/ClientSideFooter';
import { FeaturedNewsGrid } from '@/components/FeaturedNewsGrid';
import { CategorySection } from '@/components/CategorySection';
import { Sidebar } from '@/components/Sidebar';
import { BannerDisplay } from '@/components/BannerDisplay';
import { NewsService } from '@/lib/newsService';
import { CategoryService } from '@/lib/categoryService';
import { BannerService } from '@/lib/bannerService';
import { FeaturedNewsService } from '@/lib/featuredNewsService';
import { CategoryHighlightsService } from '@/lib/categoryHighlightsService';
import { CategoryHighlights } from '@/components/CategoryHighlights';
import { FeaturedNews, Category, NewsWithCategory, Banner, CategoryHighlight } from '@/types';

export default function HomePage() {
  const [data, setData] = useState<{
    featuredNews: FeaturedNews[];
    categories: Category[];
    recentNews: NewsWithCategory[];
    mostReadNews: NewsWithCategory[];
    banners: Banner[];
    categoryHighlights: CategoryHighlight[];
    categoryNews: Map<string, NewsWithCategory[]>;
  }>({
    featuredNews: [],
    categories: [],
    recentNews: [],
    mostReadNews: [],
    banners: [],
    categoryHighlights: [],
    categoryNews: new Map()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Buscar dados iniciais
        const [featuredNews, categories, recentNews, mostReadNews, banners, categoryHighlights] = await Promise.all([
          FeaturedNewsService.getFeaturedNewsWithData().catch((error) => {
            console.error('Error loading featured news:', error);
            return [];
          }),
          CategoryService.getAllCategories().catch(() => []),
          NewsService.getRecentNews(6).catch(() => []),
          NewsService.getMostReadNews(5).catch(() => []),
          BannerService.getActiveBanners().catch(() => []),
          CategoryHighlightsService.getCategoryHighlights().catch(() => [])
        ]);

        // Buscar notícias para cada categoria ativa
        const categoryNewsMap = new Map<string, NewsWithCategory[]>();
        
        await Promise.all(
          categories
            .filter(cat => cat.isActive)
            .map(async (category) => {
              try {
                const response = await NewsService.getNewsByCategory(category.id, { page: 1, limit: 6 });
                const categoryNews = Array.isArray(response) ? response : response.data;
                categoryNewsMap.set(category.id, categoryNews);
              } catch (error) {
                console.error(`Error loading news for category ${category.name}:`, error);
                categoryNewsMap.set(category.id, []);
              }
            })
        );

        setData({
          featuredNews,
          categories,
          recentNews,
          mostReadNews,
          banners,
          categoryHighlights,
          categoryNews: categoryNewsMap
        });
      } catch (err) {
        console.error('Error loading homepage data:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="h-16 bg-gray-200 animate-pulse"></div>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
                <div className="space-y-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
        <div className="h-32 bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="h-16 bg-gray-200"></div>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Erro ao carregar o portal
            </h1>
            <p className="text-gray-600 mb-4">
              Verifique sua conexão com o Firebase e tente novamente.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800 text-sm">
                <strong>Dica:</strong> Acesse o painel administrativo para configurar categorias e notícias.
              </p>
            </div>
          </div>
        </main>
        <div className="h-32 bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClientHeader categories={data.categories} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner Header */}
        {data.banners.filter(b => b.position === 'header').length > 0 && (
          <div className="mb-8">
            <BannerDisplay 
              banners={data.banners.filter(b => b.position === 'header')} 
              className="w-full"
              variant="header"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Banner Content Top */}
            {data.banners.filter(b => b.position === 'content-top').length > 0 && (
              <div className="mb-8">
                <BannerDisplay 
                  banners={data.banners.filter(b => b.position === 'content-top')} 
                  className="w-full"
                />
              </div>
            )}

            {/* Featured News Grid */}
            {data.featuredNews.length > 0 && (
              <div className="mb-8">
                <FeaturedNewsGrid featuredNews={data.featuredNews} className="w-full" />
              </div>
            )}

            {/* Banner Between News */}
            {data.banners.filter(b => b.position === 'between-news').length > 0 && (
              <div className="mb-8">
                <BannerDisplay 
                  banners={data.banners.filter(b => b.position === 'between-news')} 
                  className="w-full"
                  variant="default"
                />
              </div>
            )}

            {/* Category Highlights */}
            {data.categoryHighlights.length > 0 && (
              <div className="mb-8">
                <CategoryHighlights highlights={data.categoryHighlights} />
              </div>
            )}

            {/* Welcome Message if no content */}
            {data.categories.length === 0 && data.featuredNews.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Bem-vindo ao Portal de Notícias
                </h2>
                <p className="text-gray-600 mb-8">
                  O portal está sendo configurado. Em breve você terá acesso às últimas notícias.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Para começar:
                  </h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Acesse o painel administrativo</li>
                    <li>• Crie algumas categorias</li>
                    <li>• Adicione notícias</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Category Sections */}
            {data.categories.length > 0 && (
              <div className="space-y-8">
                {data.categories
                  .filter(category => category.isActive)
                  .map((category) => {
                    const news = data.categoryNews.get(category.id) || [];
                    if (news.length === 0) return null;
                    
                    return (
                      <CategorySection
                        key={category.id}
                        category={category}
                        news={news}
                        showViewAll={true}
                      />
                    );
                  })}
              </div>
            )}

            {/* Banner Content Bottom */}
            {data.banners.filter(b => b.position === 'content-bottom').length > 0 && (
              <div className="mt-8">
                <BannerDisplay 
                  banners={data.banners.filter(b => b.position === 'content-bottom')} 
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar 
              recentNews={data.recentNews} 
              mostReadNews={data.mostReadNews}
              banners={data.banners}
            />
          </div>
        </div>
      </main>

      <ClientSideFooter />
    </div>
  );
}