'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Eye, Tag, Search } from 'lucide-react';
import Image from 'next/image';
import { NewsService } from '@/lib/newsService';
import { NewsWithCategory } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { extractTextFromHtml } from '@/utils';
import { NewsListSkeleton } from '@/components/LoadingSkeleton';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<NewsWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const results = await NewsService.searchNews(
        { query: searchTerm },
        { page: 1, limit: 50 }
      );
      
      setSearchResults(results.data);
      setTotalResults(results.pagination.total);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {query ? `Resultados para "${query}"` : 'Buscar Notícias'}
          </h1>
        </div>

        {/* Results */}
        {loading ? (
          <NewsListSkeleton count={3} />
        ) : query ? (
          <div>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {totalResults > 0 
                  ? `${totalResults} resultado${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
                  : 'Nenhum resultado encontrado'
                }
              </p>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                {searchResults.map((news) => (
                  <article key={news.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Image */}
                        {news.coverImage && (
                          <div className="flex-shrink-0">
                            <Image
                              src={news.coverImage}
                              alt={news.title}
                              width={128}
                              height={96}
                              className="w-32 h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Category */}
                          <div className="mb-2">
                            <span
                              className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{ backgroundColor: news.category.color }}
                            >
                              {news.category.name}
                            </span>
                          </div>
                          
                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            <a href={`/noticia/${news.slug}`}>
                              {news.title}
                            </a>
                          </h2>
                          
                          {/* Subtitle */}
                          {news.subtitle && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {news.subtitle}
                            </p>
                          )}
                          
                          {/* Excerpt */}
                          <p className="text-gray-700 mb-4 line-clamp-3">
                            {extractTextFromHtml(news.content, 150)}
                          </p>
                          
                          {/* Meta Info */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(news.publishedAt || news.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{news.views} visualizações</span>
                            </div>
                            
                            {news.tags && news.tags.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Tag className="h-4 w-4" />
                                <span>{news.tags.slice(0, 2).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente usar palavras-chave diferentes ou verifique a ortografia.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Dicas para melhorar sua busca:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use palavras-chave mais gerais</li>
                    <li>Verifique a ortografia</li>
                    <li>Tente sinônimos</li>
                    <li>Use menos palavras-chave</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Digite algo para buscar
            </h3>
            <p className="text-gray-600">
              Use a barra de pesquisa no topo da página para encontrar notícias.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<NewsListSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
