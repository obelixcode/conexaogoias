import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { FeaturedNewsConfig, FeaturedNews, NewsWithCategory } from '@/types/news';
import { Category } from '@/types/category';
import { NewsService } from './newsService';

const FEATURED_NEWS_CONFIG_COLLECTION = 'featured_news_config';
const CONFIG_DOC_ID = 'current';

export class FeaturedNewsService {
  // Buscar configuração atual de notícias em destaque
  static async getFeaturedNewsConfig(): Promise<FeaturedNewsConfig | null> {
    try {
      const configDoc = await getDoc(doc(db, FEATURED_NEWS_CONFIG_COLLECTION, CONFIG_DOC_ID));
      
      if (!configDoc.exists()) {
        return null;
      }
      
      const data = configDoc.data();
      return {
        newsIds: data.newsIds || [],
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || ''
      };
    } catch (error) {
      console.error('Error getting featured news config:', error);
      // Retornar null em vez de lançar erro para usuários não autenticados
      return null;
    }
  }

  // Atualizar lista de notícias em destaque
  static async updateFeaturedNews(newsIds: string[], updatedBy: string): Promise<void> {
    try {
      if (newsIds.length > 5) {
        throw new Error('Máximo de 5 notícias em destaque permitidas');
      }

      const configRef = doc(db, FEATURED_NEWS_CONFIG_COLLECTION, CONFIG_DOC_ID);
      
      const configData = {
        newsIds: newsIds || [],
        updatedAt: new Date(),
        updatedBy: updatedBy || 'unknown'
      };

      // Verificar se o documento existe
      const configDoc = await getDoc(configRef);
      
      if (configDoc.exists()) {
        await updateDoc(configRef, configData);
      } else {
        await setDoc(configRef, configData);
      }
    } catch (error) {
      console.error('Error updating featured news:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error('Erro ao atualizar notícias em destaque: ' + errorMessage);
    }
  }

  // Buscar notícias completas baseado nos IDs configurados
  static async getFeaturedNewsWithData(): Promise<FeaturedNews[]> {
    try {
      const config = await this.getFeaturedNewsConfig();
      
      if (!config || config.newsIds.length === 0) {
        return [];
      }

      // Buscar todas as notícias publicadas e filtrar pelos IDs
      const newsQuery = query(
        collection(db, 'news'),
        where('isPublished', '==', true)
      );

      const newsSnapshot = await getDocs(newsQuery);
      const newsMap = new Map<string, NewsWithCategory>();
      
      newsSnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        // Só incluir se o ID estiver na lista de destaques
        if (config.newsIds.includes(doc.id)) {
          // Criar objeto NewsWithCategory com campos obrigatórios
          const newsWithCategory: NewsWithCategory = {
            id: doc.id,
            title: data.title || '',
            subtitle: data.subtitle || '',
            content: data.content || '',
            coverImage: data.coverImage || '',
            categoryId: data.categoryId || '',
            author: data.author || '',
            tags: data.tags || [],
            slug: data.slug || '',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            publishedAt: data.publishedAt?.toDate?.() || new Date(),
            isPublished: data.isPublished || false,
            isFeatured: data.isFeatured || false,
            views: data.views || 0,
            metaDescription: data.metaDescription || '',
            metaKeywords: data.metaKeywords || [],
            category: {
              id: '',
              name: '',
              slug: '',
              color: ''
            }
          };
          newsMap.set(doc.id, newsWithCategory);
        }
      });

      // Buscar todas as categorias
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoryMap = new Map<string, Category>();
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const category: Category = {
          id: doc.id,
          name: data.name || '',
          slug: data.slug || '',
          color: data.color || '#6B7280',
          description: data.description || '',
          order: data.order || 0,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
        categoryMap.set(doc.id, category);
      });

      // Montar lista de notícias em destaque na ordem configurada
      const featuredNews: FeaturedNews[] = [];
      
      console.log('🔍 Featured news order from config:', config.newsIds);
      
      for (let i = 0; i < config.newsIds.length; i++) {
        const newsId = config.newsIds[i];
        const newsData = newsMap.get(newsId);
        
        if (newsData) {
          const categoryData = categoryMap.get(newsData.categoryId);
          
          featuredNews.push({
            id: newsId, // Usar newsId em vez de newsData.id
            title: newsData.title,
            subtitle: newsData.subtitle || '',
            coverImage: newsData.coverImage,
            slug: newsData.slug,
            category: {
              id: categoryData?.id || newsData.categoryId,
              name: categoryData?.name || 'Sem categoria',
              slug: categoryData?.slug || 'sem-categoria',
              color: categoryData?.color || '#6B7280'
            },
            publishedAt: newsData.publishedAt instanceof Date ? newsData.publishedAt : new Date(),
            views: newsData.views || 0,
            position: i + 1
          });
        }
      }

      console.log('📋 Final featured news order:', featuredNews.map(n => ({ id: n.id, title: n.title, position: n.position })));
      
      return featuredNews;
    } catch (error) {
      console.error('Error getting featured news with data:', error);
      throw new Error('Erro ao buscar notícias em destaque');
    }
  }

  // Reordenar notícias em destaque
  static async reorderFeaturedNews(newsIds: string[], updatedBy: string): Promise<void> {
    try {
      if (newsIds.length > 5) {
        throw new Error('Máximo de 5 notícias em destaque permitidas');
      }

      await this.updateFeaturedNews(newsIds, updatedBy);
    } catch (error) {
      console.error('Error reordering featured news:', error);
      throw new Error('Erro ao reordenar notícias em destaque');
    }
  }

  // Buscar notícias disponíveis para seleção (todas as publicadas)
  static async getAvailableNewsForSelection(): Promise<NewsWithCategory[]> {
    try {
      // Buscar todas as notícias publicadas (sem excluir as já em destaque)
      const newsQuery = query(
        collection(db, 'news'),
        where('isPublished', '==', true),
        orderBy('publishedAt', 'desc')
      );

      const newsSnapshot = await getDocs(newsQuery);
      const newsList: NewsWithCategory[] = [];
      
      newsSnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const newsWithCategory: NewsWithCategory = {
          id: doc.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          content: data.content || '',
          coverImage: data.coverImage || '',
          categoryId: data.categoryId || '',
          author: data.author || '',
          tags: data.tags || [],
          slug: data.slug || '',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          publishedAt: data.publishedAt?.toDate?.() || new Date(),
          isPublished: data.isPublished || false,
          isFeatured: data.isFeatured || false,
          views: data.views || 0,
          metaDescription: data.metaDescription || '',
          metaKeywords: data.metaKeywords || [],
          category: {
            id: '',
            name: '',
            slug: '',
            color: ''
          }
        };
        newsList.push(newsWithCategory);
      });

      // Buscar todas as categorias
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoryMap = new Map<string, Category>();
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const category: Category = {
          id: doc.id,
          name: data.name || '',
          slug: data.slug || '',
          color: data.color || '#6B7280',
          description: data.description || '',
          order: data.order || 0,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
        categoryMap.set(doc.id, category);
      });

      // Montar lista de notícias com categorias
      const newsWithCategories: NewsWithCategory[] = newsList.map(newsData => {
        const categoryData = categoryMap.get(newsData.categoryId);
        
        return {
          ...newsData,
          category: {
            id: categoryData?.id || newsData.categoryId,
            name: categoryData?.name || 'Sem categoria',
            slug: categoryData?.slug || 'sem-categoria',
            color: categoryData?.color || '#6B7280'
          }
        };
      });

      return newsWithCategories;
    } catch (error) {
      console.error('Error getting available news for selection:', error);
      throw new Error('Erro ao buscar notícias disponíveis');
    }
  }

  // Inicializar configuração padrão se não existir
  static async initializeDefaultConfig(): Promise<void> {
    try {
      const config = await this.getFeaturedNewsConfig();
      
      if (!config) {
        // Buscar as 5 notícias mais recentes publicadas
        const recentNews = await NewsService.getRecentNews(5);
        const newsIds = recentNews.map(news => news.id);
        
        await this.updateFeaturedNews(newsIds, 'system');
      }
    } catch (error) {
      console.error('Error initializing default config:', error);
      throw new Error('Erro ao inicializar configuração padrão');
    }
  }
}
