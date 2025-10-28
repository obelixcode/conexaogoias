import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { SettingsService } from '@/lib/settingsService';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsService } from '@/lib/newsService';
import { NewsCard } from '@/components/NewsCard';
import { NewsCardSkeleton } from '@/components/LoadingSkeleton';
import { UltimasFilters } from '@/components/UltimasFilters';

interface UltimasPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: 'recent' | 'popular' | 'oldest';
  }>;
}

async function getUltimasData(page: number = 1, sortBy: 'recent' | 'popular' | 'oldest' = 'recent') {
  try {
    return await NewsService.getAllPublishedNews(sortBy, page, 12);
  } catch (error) {
    console.error('Error fetching ultimas data:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        totalPages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false,
        limit: 12
      }
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await SettingsService.getSettings();
  
  return {
    title: `Últimas Notícias - ${settings.siteName}`,
    description: `Confira as últimas notícias publicadas em Goiás. Mantenha-se informado com as notícias mais recentes.`,
    openGraph: {
      title: `Últimas Notícias - ${settings.siteName}`,
      description: `Confira as últimas notícias publicadas em Goiás. Mantenha-se informado com as notícias mais recentes.`,
      type: 'website',
    },
  };
}

async function UltimasPageContent({ 
  page, 
  sortBy 
}: { 
  page: number; 
  sortBy: 'recent' | 'popular' | 'oldest'; 
}) {
  const data = await getUltimasData(page, sortBy);
  const { data: news, pagination } = data;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
        </Link>
      </div>

      {/* Page header */}
      <header className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div 
            className="category-indicator h-12"
            style={{ backgroundColor: '#3B82F6' }}
          />
          <h1 
            className="category-title text-3xl md:text-4xl"
            style={{ color: '#3B82F6' }}
          >
            ÚLTIMAS NOTÍCIAS
          </h1>
        </div>
        
        <p className="text-lg text-gray-600 mb-6">
          Confira as últimas notícias publicadas em Goiás. Mantenha-se informado com as notícias mais recentes.
        </p>

        {/* Sort controls */}
        <UltimasFilters currentSort={sortBy} />
      </header>

      {/* News grid */}
      {news.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <div className="h-12 w-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              📰
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma notícia encontrada
          </h3>
          <p className="text-gray-500">
            Não há notícias publicadas no momento.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {news.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                variant="default"
                showCategory={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                asChild
              >
                <a href={`/ultimas?page=${page - 1}&sort=${sortBy}`}>
                  Anterior
                </a>
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      asChild
                    >
                      <a href={`/ultimas?page=${pageNum}&sort=${sortBy}`}>
                        {pageNum}
                      </a>
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                asChild
              >
                <a href={`/ultimas?page=${page + 1}&sort=${sortBy}`}>
                  Próxima
                </a>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function UltimasPage({ searchParams }: UltimasPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const sortBy = (resolvedSearchParams.sort || 'recent') as 'recent' | 'popular' | 'oldest';

  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      </div>
    }>
      <UltimasPageContent page={page} sortBy={sortBy} />
    </Suspense>
  );
}

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;
