import { Suspense } from 'react';
import { ClientHeader } from '@/components/ClientHeader';
import { ClientFooter } from '@/components/ClientFooter';
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

async function HomePageContent() {
  try {
    const [featuredNews, categories, recentNews, mostReadNews, banners, categoryHighlights] = await Promise.all([
      FeaturedNewsService.getFeaturedNewsWithData().catch((error) => {
        console.error('Error loading featured news:', error);
        return [];
      }), // Get featured news from new service
      CategoryService.getAllCategories().catch(() => []), // Fallback to empty array
      NewsService.getRecentNews(6).catch(() => []), // Get recent news for sidebar
      NewsService.getMostReadNews(5).catch(() => []), // Get most read news for sidebar
      BannerService.getActiveBanners().catch(() => []), // Get active banners
      CategoryHighlightsService.getCategoryHighlights().catch(() => []) // Get category highlights
    ]);



    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader categories={categories} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Banner Header */}
          {banners.filter(b => b.position === 'header').length > 0 && (
            <div className="mb-8">
              <BannerDisplay 
                banners={banners.filter(b => b.position === 'header')} 
                className="w-full"
                variant="header"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Banner Content Top */}
              {banners.filter(b => b.position === 'content-top').length > 0 && (
                <div className="mb-8">
                  <BannerDisplay 
                    banners={banners.filter(b => b.position === 'content-top')} 
                    className="w-full"
                  />
                </div>
              )}

              {/* Featured News Grid */}
              {featuredNews.length > 0 && (
                <div className="mb-8">
                  <FeaturedNewsGrid featuredNews={featuredNews} className="w-full" />
                </div>
              )}

              {/* Banner Between News */}
              {banners.filter(b => b.position === 'between-news').length > 0 && (
                <div className="mb-8">
                  <BannerDisplay 
                    banners={banners.filter(b => b.position === 'between-news')} 
                    className="w-full"
                    variant="default"
                  />
                </div>
              )}

              {/* Category Highlights */}
              {categoryHighlights.length > 0 && (
                <div className="mb-8">
                  <CategoryHighlights highlights={categoryHighlights} />
                </div>
              )}

              {/* Welcome Message if no content */}
              {categories.length === 0 && featuredNews.length === 0 && (
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
              {categories.length > 0 && (
                <div className="space-y-8">
                  {await Promise.all(
                    categories
                      .filter(category => category.isActive)
                      .map(async (category) => {
                        const categoryNewsResponse = await NewsService.getNewsByCategory(category.id, { page: 1, limit: 6 }).catch(() => ({ data: [], total: 0, page: 1, totalPages: 0 }));
                        const categoryNews = Array.isArray(categoryNewsResponse) ? categoryNewsResponse : categoryNewsResponse.data;
                        return (
                          <CategorySection
                            key={category.id}
                            category={category}
                            news={categoryNews}
                            showViewAll={true}
                          />
                        );
                      })
                  )}
                </div>
              )}

              {/* Banner Content Bottom */}
              {banners.filter(b => b.position === 'content-bottom').length > 0 && (
                <div className="mt-8">
                  <BannerDisplay 
                    banners={banners.filter(b => b.position === 'content-bottom')} 
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
                <Sidebar recentNews={recentNews} mostReadNews={mostReadNews} banners={banners} />
              </Suspense>
            </div>
          </div>
        </main>

        <ClientFooter />
      </div>
    );
  } catch (error) {
    console.error('Error loading homepage:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      </div>
    );
  }
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 mb-8"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}