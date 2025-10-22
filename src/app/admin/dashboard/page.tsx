'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Eye, 
  FolderOpen, 
  Star, 
  TrendingUp,
  Plus,
  BarChart3
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressBadge } from '@/components/admin/WordPressBadge';
import { NewsService } from '@/lib/newsService';
import { CategoryService } from '@/lib/categoryService';
import { BannerService, BannerStats } from '@/lib/bannerService';
import { FeaturedNewsService } from '@/lib/featuredNewsService';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useUser } from '@/contexts/UserContext';
import { NewsStats, FeaturedNews } from '@/types/news';
import { CategoryStats } from '@/types/category';
import { FeaturedNewsManager } from '@/components/admin/FeaturedNewsManager';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <WordPressCard>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {trend && (
            <div className={`flex items-center text-xs mt-2 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend.value}% em relação ao mês anterior
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
    </WordPressCard>
  );
}


function DashboardContent() {
  const { settings } = useSettingsContext();
  const { user } = useUser();
  const [newsStats, setNewsStats] = useState<NewsStats>({
    totalNews: 0,
    publishedNews: 0,
    draftNews: 0,
    featuredNews: 0,
    totalViews: 0,
    newsByCategory: [],
    recentNews: []
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({
    totalCategories: 0,
    activeCategories: 0,
    categoriesWithNews: 0,
    topCategories: []
  });
  const [bannerStats, setBannerStats] = useState<BannerStats>({
    totalBanners: 0,
    activeBanners: 0,
    totalClicks: 0,
    totalImpressions: 0,
    clickThroughRate: 0,
    bannersByPosition: [],
    topBanners: []
  });
  const [, setIsLoading] = useState(true);
  const [showFeaturedManager, setShowFeaturedManager] = useState(false);
  const [featuredNews, setFeaturedNews] = useState<FeaturedNews[]>([]);

  const loadStats = async () => {
    try {
      const [newsResult, categoryResult, bannerResult, featuredResult] = await Promise.allSettled([
        NewsService.getNewsStats(),
        CategoryService.getCategoryStats(),
        BannerService.getBannerStats(),
        FeaturedNewsService.getFeaturedNewsWithData()
      ]);

      if (newsResult.status === 'fulfilled') {
        setNewsStats({
          ...newsResult.value,
          featuredNews: newsResult.value.featuredNews || 0
        });
      }
      if (categoryResult.status === 'fulfilled') {
        setCategoryStats(categoryResult.value);
      }
      if (bannerResult.status === 'fulfilled') {
        setBannerStats(bannerResult.value);
      }
      if (featuredResult.status === 'fulfilled') {
        setFeaturedNews(featuredResult.value);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do {settings.siteDescription.toLowerCase()}</p>
        </div>
        <WordPressButton asChild>
          <Link href="/admin/editor" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </Link>
        </WordPressButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Notícias"
          value={newsStats.totalNews}
          description={`${newsStats.publishedNews} publicadas, ${newsStats.draftNews} rascunhos`}
          icon={FileText}
        />
        <StatsCard
          title="Visualizações"
          value={newsStats.totalViews.toLocaleString('pt-BR')}
          description="Total de visualizações"
          icon={Eye}
        />
        <StatsCard
          title="Categorias"
          value={categoryStats.totalCategories}
          description={`${categoryStats.activeCategories} ativas`}
          icon={FolderOpen}
        />
        <StatsCard
          title="Banners Ativos"
          value={bannerStats.activeBanners}
          description={`${bannerStats.totalClicks} cliques totais`}
          icon={Star}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News by Category */}
        <WordPressCard title="Notícias por Categoria" description="Distribuição de notícias por categoria">
          <div className="space-y-4">
            {newsStats.newsByCategory.map((category, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium">{category.categoryName}</span>
                </div>
                <WordPressBadge variant="info">{category.count}</WordPressBadge>
              </div>
            ))}
          </div>
        </WordPressCard>

        {/* Recent News */}
        <WordPressCard title="Últimas Publicações" description="Notícias publicadas recentemente">
          <div className="space-y-4">
            {newsStats.recentNews.slice(0, 5).map((news) => (
              <div key={news.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {news.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {news.publishedAt 
                      ? new Date(news.publishedAt).toLocaleDateString('pt-BR')
                      : new Date(news.createdAt).toLocaleDateString('pt-BR')
                    }
                  </p>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Eye className="h-3 w-3 mr-1" />
                  {news.views}
                </div>
              </div>
            ))}
          </div>
        </WordPressCard>
      </div>

      {/* Featured News Management */}
      <WordPressCard title="Notícias em Destaque" description="Gerencie as 5 notícias que aparecem na homepage">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notícias Atuais em Destaque
              </h3>
              <p className="text-sm text-gray-500">
                {featuredNews.length} de 5 notícias selecionadas
              </p>
            </div>
            <WordPressButton 
              onClick={() => setShowFeaturedManager(true)}
              className="flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Gerenciar Destaques</span>
            </WordPressButton>
          </div>
          
          {featuredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {featuredNews.map((news, index) => (
                <div key={news.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {news.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {news.category.name} • {news.views} visualizações
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma notícia em destaque configurada</p>
              <p className="text-sm">Clique em &quot;Gerenciar Destaques&quot; para configurar</p>
            </div>
          )}
        </div>
      </WordPressCard>

      {/* Quick Actions */}
      <WordPressCard title="Ações Rápidas" description="Acesso rápido às principais funcionalidades">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/editor"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            prefetch={false}
          >
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-medium">Nova Notícia</h3>
              <p className="text-sm text-gray-500">Criar uma nova matéria</p>
            </div>
          </Link>
          
          <Link
            href="/admin/posts/categories"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            prefetch={false}
          >
            <FolderOpen className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium">Gerenciar Categorias</h3>
              <p className="text-sm text-gray-500">Organizar categorias</p>
            </div>
          </Link>
          
          <Link
            href="/admin/banners"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            prefetch={false}
          >
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="font-medium">Gerenciar Banners</h3>
              <p className="text-sm text-gray-500">Configurar publicidade</p>
            </div>
          </Link>
        </div>
      </WordPressCard>

      {/* Featured News Manager Modal */}
      {showFeaturedManager && (
        <FeaturedNewsManager
          onClose={() => setShowFeaturedManager(false)}
          onSave={() => {
            setShowFeaturedManager(false);
            // Recarregar dados
            loadStats();
          }}
          userId={user?.uid}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Carregando...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <WordPressCard key={index}>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </WordPressCard>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WordPressCard title="Carregando..." description="Aguarde...">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                </div>
              ))}
            </div>
          </WordPressCard>
          
          <WordPressCard title="Carregando..." description="Aguarde...">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                </div>
              ))}
            </div>
          </WordPressCard>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
