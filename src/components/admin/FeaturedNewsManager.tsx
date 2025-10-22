'use client';

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Search, 
  Plus, 
  X, 
  Star,
  Eye
} from 'lucide-react';
import { WordPressButton } from './WordPressButton';
import { WordPressBadge } from './WordPressBadge';
import { FeaturedNewsService } from '@/lib/featuredNewsService';
import { NewsWithCategory, FeaturedNewsConfig, FeaturedNews } from '@/types/news';
import { CategoryService } from '@/lib/categoryService';
import { Category } from '@/types/category';

interface FeaturedNewsManagerProps {
  onClose: () => void;
  onSave: () => void;
  userId?: string;
}

interface SortableNewsItemProps {
  news: FeaturedNews;
  index: number;
  onRemove: (newsId: string) => void;
}

function SortableNewsItem({ news, index, onRemove }: SortableNewsItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: news.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg ${
        isDragging ? 'shadow-lg' : 'hover:shadow-md'
      } transition-shadow`}
    >
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </div>
        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {news.title}
          </h4>
          <WordPressBadge 
            variant="info"
            className="text-white"
          >
            {news.category.name}
          </WordPressBadge>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {news.views} visualizações • {new Date(news.publishedAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
      
      <WordPressButton
        variant="tertiary"
        size="small"
        onClick={() => {
          try {
            onRemove(news.id);
          } catch (error) {
            console.warn('Error removing news item:', error);
          }
        }}
        className="text-red-600 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </WordPressButton>
    </div>
  );
}

export function FeaturedNewsManager({ onClose, onSave, userId }: FeaturedNewsManagerProps) {
  const [, setCurrentConfig] = useState<FeaturedNewsConfig | null>(null);
  const [selectedNews, setSelectedNews] = useState<FeaturedNews[]>([]);
  const [availableNews, setAvailableNews] = useState<NewsWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [config, news, cats] = await Promise.all([
        FeaturedNewsService.getFeaturedNewsConfig(),
        FeaturedNewsService.getAvailableNewsForSelection(),
        CategoryService.getAllCategories()
      ]);

      setCurrentConfig(config);
      setAvailableNews(news);
      setCategories(cats);

      // Carregar notícias atualmente em destaque
      if (config && config.newsIds.length > 0) {
        const featuredNewsData = await FeaturedNewsService.getFeaturedNewsWithData();
        setSelectedNews(featuredNewsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedNews((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddNews = (news: NewsWithCategory) => {
    if (selectedNews.length >= 5) {
      alert('Máximo de 5 notícias em destaque permitidas');
      return;
    }

    if (selectedNews.find(n => n.id === news.id)) {
      return; // Já está selecionada
    }

    const featuredNews: FeaturedNews = {
      ...news,
      position: selectedNews.length + 1,
      publishedAt: news.publishedAt || news.createdAt
    };
    
    setSelectedNews([...selectedNews, featuredNews]);
    setAvailableNews(availableNews.filter(n => n.id !== news.id));
  };

  const handleRemoveNews = (newsId: string) => {
    const newsToRemove = selectedNews.find(n => n.id === newsId);
    if (newsToRemove) {
      setSelectedNews(selectedNews.filter(n => n.id !== newsId));
      
      // Converter FeaturedNews de volta para NewsWithCategory
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { position, ...newsData } = newsToRemove;
      setAvailableNews([...availableNews, newsData as NewsWithCategory]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const newsIds = selectedNews.map(news => news.id);
      await FeaturedNewsService.updateFeaturedNews(newsIds, userId || 'unknown');
      onSave();
    } catch (error) {
      console.error('Error saving featured news:', error);
      alert('Erro ao salvar notícias em destaque: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const filteredNews = availableNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || news.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Notícias em Destaque</h2>
          <WordPressButton variant="tertiary" onClick={onClose}>
            <X className="h-5 w-5" />
          </WordPressButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notícias Selecionadas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notícias em Destaque ({selectedNews.length}/5)
            </h3>
            
            {selectedNews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma notícia selecionada</p>
                <p className="text-sm">Selecione notícias da lista ao lado</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedNews.map(news => news.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedNews.map((news, index) => (
                      <SortableNewsItem
                        key={`selected-${news.id}`}
                        news={news}
                        index={index}
                        onRemove={handleRemoveNews}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Notícias Disponíveis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notícias Disponíveis
            </h3>

            {/* Filtros */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por categoria"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de notícias */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredNews.map(news => (
                <div
                  key={`available-${news.id}`}
                  className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {news.title}
                      </h4>
                      <WordPressBadge 
                        variant="info"
                        className="text-white"
                      >
                        {news.category.name}
                      </WordPressBadge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {news.views} visualizações • {new Date(news.publishedAt || news.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <WordPressButton
                    variant="primary"
                    size="small"
                    onClick={() => handleAddNews(news)}
                    disabled={selectedNews.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                  </WordPressButton>
                </div>
              ))}
              
              {filteredNews.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma notícia encontrada</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <WordPressButton variant="secondary" onClick={onClose}>
            Cancelar
          </WordPressButton>
          <WordPressButton 
            variant="primary" 
            onClick={handleSave}
            disabled={saving || selectedNews.length === 0}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </WordPressButton>
        </div>
      </div>
    </div>
  );
}
