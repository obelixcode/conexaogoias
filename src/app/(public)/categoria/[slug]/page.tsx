import { Suspense } from 'react';
import { Metadata } from 'next';
import { SettingsService } from '@/lib/settingsService';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewsService } from '@/lib/newsService';
import { CategoryService } from '@/lib/categoryService';
import { NewsCard } from '@/components/NewsCard';
import { NewsCardSkeleton } from '@/components/LoadingSkeleton';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: 'recent' | 'popular' | 'oldest';
  }>;
}

async function getCategoryData(slug: string, page: number = 1) {
  try {
    const [category, newsData] = await Promise.all([
      CategoryService.getCategoryBySlug(slug),
      NewsService.getNewsByCategory(slug, { page, limit: 12 })
    ]);

    if (!category) {
      return null;
    }

    return {
      category,
      news: newsData.data,
      pagination: newsData.pagination
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const [category, settings] = await Promise.all([
    CategoryService.getCategoryBySlug(resolvedParams.slug),
    SettingsService.getSettings()
  ]);
  
  if (!category) {
    return {
      title: `Categoria não encontrada - ${settings.siteName}`,
    };
  }

  return {
    title: `${category.name} - ${settings.siteName}`,
    description: category.description || `Últimas notícias sobre ${category.name} em Goiás.`,
    openGraph: {
      title: `${category.name} - ${settings.siteName}`,
      description: category.description || `Últimas notícias sobre ${category.name} em Goiás.`,
      type: 'website',
    },
  };
}

async function CategoryPageContent({ 
  slug, 
  page, 
  sortBy 
}: { 
  slug: string; 
  page: number; 
  sortBy: string; 
}) {
  const data = await getCategoryData(slug, page);
  
  if (!data) {
    notFound();
  }

  const { category, news, pagination } = data;

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

      {/* Category header */}
      <header className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div 
            className="category-indicator h-12"
            style={{ backgroundColor: category.color }}
          />
          <h1 
            className="category-title text-3xl md:text-4xl"
            style={{ color: category.color }}
          >
            {category.name.toUpperCase()}
          </h1>
        </div>
        
        {category.description && (
          <p className="text-lg text-gray-600 mb-6">
            {category.description}
          </p>
        )}

        {/* Sort controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Ordenar por:</span>
          </div>
          <Select defaultValue={sortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="popular">Mais lidas</SelectItem>
              <SelectItem value="oldest">Mais antigas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* News grid */}
      {news.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma notícia encontrada
          </h3>
          <p className="text-gray-500">
            Não há notícias nesta categoria no momento.
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
                showCategory={false}
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
                <Link href={`/categoria/${slug}?page=${page - 1}&sort=${sortBy}`}>
                  Anterior
                </Link>
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
                      <Link href={`/categoria/${slug}?page=${pageNum}&sort=${sortBy}`}>
                        {pageNum}
                      </Link>
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                asChild
              >
                <Link href={`/categoria/${slug}?page=${page + 1}&sort=${sortBy}`}>
                  Próxima
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const sortBy = resolvedSearchParams.sort || 'recent';

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
      <CategoryPageContent slug={resolvedParams.slug} page={page} sortBy={sortBy} />
    </Suspense>
  );
}

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const categories = await CategoryService.getActiveCategories();
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}
