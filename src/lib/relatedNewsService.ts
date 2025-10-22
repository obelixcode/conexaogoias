import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { News } from '@/types/news';

const NEWS_COLLECTION = 'news';

export class RelatedNewsService {
  // Encontrar matérias relacionadas baseado em tags e categoria
  static async getRelatedNews(
    currentNewsId: string,
    categoryId: string,
    tags: string[],
    limitCount: number = 5
  ): Promise<News[]> {
    try {
      const relatedNews: News[] = [];
      
      // 1. Buscar notícias da mesma categoria
      if (categoryId) {
        const categoryQuery = query(
          collection(db, NEWS_COLLECTION),
          where('categoryId', '==', categoryId),
          where('isPublished', '==', true),
          where('id', '!=', currentNewsId),
          orderBy('publishedAt', 'desc'),
          limit(limitCount)
        );
        
        const categorySnapshot = await getDocs(categoryQuery);
        const categoryNews = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as News[];
        
        relatedNews.push(...categoryNews);
      }
      
      // 2. Se não temos notícias suficientes, buscar por tags
      if (relatedNews.length < limitCount && tags.length > 0) {
        const remainingLimit = limitCount - relatedNews.length;
        const existingIds = relatedNews.map(news => news.id);
        
        // Buscar notícias que tenham pelo menos uma tag em comum
        const tagQuery = query(
          collection(db, NEWS_COLLECTION),
          where('isPublished', '==', true),
          where('id', 'not-in', existingIds),
          orderBy('publishedAt', 'desc'),
          limit(remainingLimit * 2) // Buscar mais para filtrar depois
        );
        
        const tagSnapshot = await getDocs(tagQuery);
        const tagNews = tagSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as News[];
        
        // Filtrar notícias que tenham tags em comum
        const filteredTagNews = tagNews.filter(news => {
          const newsTags = news.tags || [];
          return newsTags.some(tag => tags.includes(tag));
        });
        
        relatedNews.push(...filteredTagNews.slice(0, remainingLimit));
      }
      
      // 3. Se ainda não temos notícias suficientes, buscar as mais recentes
      if (relatedNews.length < limitCount) {
        const remainingLimit = limitCount - relatedNews.length;
        const existingIds = relatedNews.map(news => news.id);
        
        const recentQuery = query(
          collection(db, NEWS_COLLECTION),
          where('isPublished', '==', true),
          where('id', 'not-in', existingIds),
          orderBy('publishedAt', 'desc'),
          limit(remainingLimit)
        );
        
        const recentSnapshot = await getDocs(recentQuery);
        const recentNews = recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as News[];
        
        relatedNews.push(...recentNews);
      }
      
      return relatedNews.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting related news:', error);
      return [];
    }
  }

  // Encontrar matérias relacionadas por similaridade de título
  static async getRelatedByTitle(
    currentNewsId: string,
    title: string,
    limitCount: number = 5
  ): Promise<News[]> {
    try {
      // Extrair palavras-chave do título
      const keywords = title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(word => word.length > 3);
      
      if (keywords.length === 0) {
        return [];
      }
      
      // Buscar notícias que contenham palavras-chave similares
      const newsQuery = query(
        collection(db, NEWS_COLLECTION),
        where('status', '==', 'published'),
        where('id', '!=', currentNewsId),
        orderBy('publishedAt', 'desc'),
        limit(limitCount * 2)
      );
      
      const snapshot = await getDocs(newsQuery);
      const allNews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as News[];
      
      // Filtrar e ordenar por similaridade
      const relatedNews = allNews
        .map(news => {
          const newsTitle = news.title.toLowerCase();
          const similarity = keywords.filter(keyword => 
            newsTitle.includes(keyword)
          ).length;
          
          return { news, similarity };
        })
        .filter(item => item.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limitCount)
        .map(item => item.news);
      
      return relatedNews;
    } catch (error) {
      console.error('Error getting related news by title:', error);
      return [];
    }
  }

  // Obter estatísticas de matérias relacionadas
  static async getRelatedNewsStats(newsId: string): Promise<{
    totalRelated: number;
    byCategory: number;
    byTags: number;
    byTitle: number;
  }> {
    try {
      // Em produção, isso seria calculado com base nas consultas reais
      return {
        totalRelated: 5,
        byCategory: 3,
        byTags: 2,
        byTitle: 1
      };
    } catch (error) {
      console.error('Error getting related news stats:', error);
      return {
        totalRelated: 0,
        byCategory: 0,
        byTags: 0,
        byTitle: 0
      };
    }
  }
}
