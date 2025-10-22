'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatNewsDate } from '@/utils/formatDate';
import { NewsWithCategory } from '@/types';
import { getCategoryBadgeClass } from '@/utils';

interface NewsCardProps {
  news: NewsWithCategory;
  variant?: 'default' | 'featured' | 'compact';
  showCategory?: boolean;
  className?: string;
}

export function NewsCard({ 
  news, 
  variant = 'default', 
  showCategory = true,
  className = '' 
}: NewsCardProps) {
  const baseClasses = "group cursor-pointer transition-all duration-300 hover:shadow-lg";
  
  const variantClasses = {
    default: "bg-white rounded-lg overflow-hidden border border-gray-200",
    featured: "bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md",
    compact: "bg-white rounded-lg overflow-hidden border border-gray-200"
  };

  const imageSizes = {
    default: { width: 300, height: 200 },
    featured: { width: 400, height: 250 },
    compact: { width: 120, height: 80 }
  };

  const imageSize = imageSizes[variant];

  if (variant === 'compact') {
    return (
      <Link href={news.slug ? `/noticia/${news.slug}` : '#'} className={`${baseClasses} ${className}`}>
        <div className="flex space-x-3 p-3">
          <div className="shrink-0">
            <div className="relative w-20 h-16 rounded-md overflow-hidden">
              {news.coverImage ? (
                <Image
                  src={news.coverImage}
                  alt={news.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">📷</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-900 transition-colors">
              {news.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {formatNewsDate(news.publishedAt || news.createdAt)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={news.slug ? `/noticia/${news.slug}` : '#'} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="relative">
        <div className="relative w-full h-48 overflow-hidden">
          {news.coverImage ? (
            <Image
              src={news.coverImage}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={variant === 'featured' ? '400px' : '300px'}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Sem imagem</span>
            </div>
          )}
          {showCategory && (
            <div className={getCategoryBadgeClass(news.category.color)}>
              {news.category.name}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-900 transition-colors mb-2">
            {news.title}
          </h3>
          
          {news.subtitle && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {news.subtitle}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Por {news.author}</span>
            <span>{formatNewsDate(news.publishedAt || news.createdAt)}</span>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{news.views || 0} visualizações</span>
            {variant === 'featured' && (
              <span className="text-blue-600 font-medium">Destaque</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
