'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeaturedNews, NewsWithCategory } from '@/types';
import { NewsCard } from './NewsCard';

interface FeaturedCarouselProps {
  featuredNews: FeaturedNews[];
  className?: string;
}

export function FeaturedCarousel({ featuredNews, className = '' }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || featuredNews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredNews.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredNews.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredNews.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (featuredNews.length === 0) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500">Nenhuma notícia em destaque</p>
      </div>
    );
  }

  if (featuredNews.length === 1) {
    return (
      <div className={className}>
        <NewsCard news={featuredNews[0] as unknown as NewsWithCategory} variant="featured" />
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main carousel */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="carousel-slide-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {featuredNews.map((news) => (
            <div key={news.id} className="w-full shrink-0">
              <NewsCard news={news as unknown as NewsWithCategory} variant="featured" />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <Button
          variant="outline"
          size="sm"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dots indicator */}
      {featuredNews.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {featuredNews.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-900' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play toggle */}
      <div className="flex justify-center mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {isAutoPlaying ? 'Pausar' : 'Reproduzir'} automático
        </Button>
      </div>
    </div>
  );
}
