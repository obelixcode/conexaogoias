'use client';

import Link from 'next/link';
import { NewsWithCategory, Category } from '@/types';
import { NewsCard } from './NewsCard';
import { getCategoryColorClass } from '@/utils';

interface CategorySectionProps {
  category: Category;
  news: NewsWithCategory[];
  showViewAll?: boolean;
  className?: string;
}

export function CategorySection({ 
  category, 
  news, 
  showViewAll = true,
  className = '' 
}: CategorySectionProps) {
  if (news.length === 0) return null;

  return (
    <section className={`mb-8 ${className}`}>
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="category-indicator"
            style={{ '--category-color': category.color } as React.CSSProperties}
          />
          <h2 className={`category-title ${getCategoryColorClass(category.color)}`}>
            {category.name.toUpperCase()}
          </h2>
        </div>
        
        {showViewAll && (
          <Link
            href={`/categoria/${category.slug}`}
            className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors"
          >
            Ver todas →
          </Link>
        )}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((newsItem) => (
          <NewsCard
            key={newsItem.id}
            news={newsItem}
            variant="default"
            showCategory={false}
          />
        ))}
      </div>
    </section>
  );
}
