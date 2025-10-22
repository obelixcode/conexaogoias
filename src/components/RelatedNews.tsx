'use client';

import { RelatedNews as RelatedNewsType, NewsWithCategory } from '@/types';
import { NewsCard } from './NewsCard';

interface RelatedNewsProps {
  relatedNews: RelatedNewsType[];
  className?: string;
}

export function RelatedNews({ relatedNews, className = '' }: RelatedNewsProps) {
  if (relatedNews.length === 0) return null;

  return (
    <section className={`mt-8 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Notícias Relacionadas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedNews.map((news) => (
          <NewsCard
            key={news.id}
            news={news as unknown as NewsWithCategory} // Type assertion needed due to interface differences
            variant="compact"
            showCategory={true}
          />
        ))}
      </div>
    </section>
  );
}
