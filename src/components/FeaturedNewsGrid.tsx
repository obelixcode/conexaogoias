'use client';

import Image from 'next/image';
import { FeaturedNews } from '@/types/news';

interface FeaturedNewsGridProps {
  featuredNews: FeaturedNews[];
  className?: string;
}

export function FeaturedNewsGrid({ featuredNews, className = '' }: FeaturedNewsGridProps) {
  if (featuredNews.length === 0) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500">Nenhuma notícia em destaque</p>
      </div>
    );
  }

  // Garantir que temos exatamente 5 notícias
  const newsToShow = featuredNews.slice(0, 5);
  const [mainNews, ...otherNews] = newsToShow;

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Layout: 2 em cima (1 grande + 1 menor), 3 embaixo */}
      <div className="hidden lg:block w-full space-y-8">
        {/* Seção Superior: 2 cards lado a lado */}
        <div className="grid grid-cols-3 gap-8 h-[400px]">
          {/* Notícia principal (2 colunas) */}
          {mainNews && (
            <div className="col-span-2">
              <FeaturedNewsCard news={mainNews} variant="main" />
            </div>
          )}
          
          {/* Notícia secundária (1 coluna) */}
          {otherNews[0] && (
            <div className="col-span-1">
              <FeaturedNewsCard news={otherNews[0]} variant="secondary" />
            </div>
          )}
        </div>
        
        {/* Seção Inferior: 3 cards em linha */}
        <div className="grid grid-cols-3 gap-8 h-[250px]">
          {otherNews.slice(1, 4).map((news) => (
            <div key={news.id}>
              <FeaturedNewsCard news={news} variant="tertiary" />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet Layout: 2 colunas - ocupando todo o espaço */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-8 w-full">
        {newsToShow.map((news, index) => (
          <div key={news.id} className={index === 0 ? 'col-span-2' : ''}>
            <FeaturedNewsCard 
              news={news} 
              variant={index === 0 ? 'main' : 'secondary'} 
            />
          </div>
        ))}
      </div>

      {/* Mobile Layout: 1 coluna - ocupando todo o espaço */}
      <div className="grid md:hidden grid-cols-1 gap-4 w-full">
        {newsToShow.map((news) => (
          <div key={news.id}>
            <FeaturedNewsCard news={news} variant="mobile" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface FeaturedNewsCardProps {
  news: FeaturedNews;
  variant: 'main' | 'secondary' | 'tertiary' | 'mobile';
}

function FeaturedNewsCard({ news, variant }: FeaturedNewsCardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case 'main':
        return 'h-full';
      case 'secondary':
        return 'h-full';
      case 'tertiary':
        return 'h-full';
      case 'mobile':
        return 'h-[250px]';
      default:
        return 'h-[250px]';
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case 'main':
        return 'text-xl md:text-2xl lg:text-3xl';
      case 'secondary':
        return 'text-sm md:text-base';
      case 'tertiary':
        return 'text-sm md:text-base';
      case 'mobile':
        return 'text-lg md:text-xl';
      default:
        return 'text-lg';
    }
  };

  return (
    <a 
      href={`/noticia/${news.slug}`}
      className={`group relative block overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${getCardClasses()}`}
    >
      {/* Imagem de fundo */}
      <div className="relative h-full w-full">
        <Image
          src={news.coverImage}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={
            variant === 'main' 
              ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw'
              : variant === 'mobile'
              ? '100vw'
              : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw'
          }
        />
        
        {/* Overlay gradiente mais escuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        
        {/* Overlay adicional na área do texto para melhor contraste */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Tag da categoria */}
        <div className="absolute top-3 left-3 z-10">
          <span 
            className="inline-block px-3 py-1.5 text-xs font-bold text-white rounded-md shadow-lg"
            style={{ backgroundColor: news.category.color }}
          >
            {news.category.name.toUpperCase()}
          </span>
        </div>
        
        {/* Conteúdo da notícia */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className={`font-bold text-white leading-tight drop-shadow-lg ${getTitleClasses()}`}>
            {news.title}
          </h3>
          
          {news.subtitle && variant !== 'tertiary' && (
            <p className="mt-2 text-sm text-gray-100 line-clamp-2 drop-shadow-md">
              {news.subtitle}
            </p>
          )}
          
          {/* Informações adicionais */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-200 drop-shadow-md">
            <span className="font-medium">{news.views} visualizações</span>
            <span className="font-medium">{new Date(news.publishedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
