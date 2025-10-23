import { NewsWithCategory } from '@/types';
import { Banner } from '@/types/banner';
import { NewsCard } from './NewsCard';
import { BannerDisplay } from './BannerDisplay';
import { NewsletterSubscription } from './NewsletterSubscription';

interface SidebarProps {
  recentNews?: NewsWithCategory[];
  mostReadNews?: NewsWithCategory[];
  banners?: Banner[];
  className?: string;
}

export function Sidebar({ recentNews = [], mostReadNews = [], banners = [], className = '' }: SidebarProps) {
  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Mais Lidas */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          MAIS LIDAS
        </h3>
        <div className="space-y-3">
          {mostReadNews?.length > 0 ? mostReadNews.slice(0, 5).map((news, index) => (
            <div key={news.id} className="flex items-start space-x-3">
              <div className="shrink-0 w-6 h-6 bg-blue-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <a href={`/noticia/${news.slug}`}>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-900 transition-colors cursor-pointer">
                    {news.title}
                  </h4>
                </a>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{news.views || 0} visualizações</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Nenhuma notícia lida esta semana</p>
            </div>
          )}
        </div>
      </div>

      {/* Banner - Sidebar Top */}
      <BannerDisplay 
        banners={banners.filter(b => b.position === 'sidebar-top')} 
        className="w-full"
        variant="sidebar"
      />

      {/* Últimas Notícias */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          ÚLTIMAS NOTÍCIAS
        </h3>
        <div className="space-y-3">
          {recentNews?.slice(0, 6).map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              variant="compact"
              showCategory={false}
            />
          ))}
        </div>
      </div>

      {/* Banner - Sidebar Bottom */}
      <BannerDisplay 
        banners={banners.filter(b => b.position === 'sidebar-bottom')} 
        className="w-full"
        variant="sidebar"
      />

      {/* Newsletter Signup */}
      <NewsletterSubscription />
    </aside>
  );
}
