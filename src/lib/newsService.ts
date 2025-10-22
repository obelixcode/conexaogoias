import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment,
  serverTimestamp,
  UpdateData,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  News, 
  NewsFormData, 
  FeaturedNews, 
  NewsWithCategory, 
  NewsStats, 
  RelatedNews,
  PaginationParams,
  SearchParams,
  PaginatedResponse
} from '@/types';

const NEWS_COLLECTION = 'news';
const CATEGORIES_COLLECTION = 'categories';

export class NewsService {
  // Create news
  static async createNews(newsData: NewsFormData, coverImageUrl: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, NEWS_COLLECTION), {
        title: newsData.title,
        subtitle: newsData.subtitle,
        content: newsData.content,
        coverImage: coverImageUrl,
        categoryId: newsData.categoryId,
        author: newsData.author,
        tags: newsData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        slug: newsData.slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: newsData.isPublished ? serverTimestamp() : null,
        isPublished: newsData.isPublished,
        isFeatured: newsData.isFeatured,
        featuredPosition: newsData.featuredPosition || null,
        views: 0,
        metaDescription: newsData.metaDescription || '',
        metaKeywords: newsData.metaKeywords?.split(',').map(k => k.trim()).filter(k => k) || []
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create news error:', error);
      throw new Error('Erro ao criar notícia');
    }
  }

  // Update news
  static async updateNews(id: string, newsData: Partial<NewsFormData>, coverImageUrl?: string): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp()
      };

      // Only include fields that have values
      if (newsData.title !== undefined) updateData.title = newsData.title;
      if (newsData.subtitle !== undefined) updateData.subtitle = newsData.subtitle;
      if (newsData.content !== undefined) updateData.content = newsData.content;
      if (newsData.categoryId !== undefined) updateData.categoryId = newsData.categoryId;
      if (newsData.author !== undefined) updateData.author = newsData.author;
      if (newsData.slug !== undefined) updateData.slug = newsData.slug;
      if (newsData.isPublished !== undefined) updateData.isPublished = newsData.isPublished;
      if (newsData.isFeatured !== undefined) updateData.isFeatured = newsData.isFeatured;
      if (newsData.featuredPosition !== undefined && newsData.featuredPosition !== null) {
        updateData.featuredPosition = newsData.featuredPosition;
      }
      if (newsData.metaDescription !== undefined) updateData.metaDescription = newsData.metaDescription;

      if (coverImageUrl) {
        updateData.coverImage = coverImageUrl;
      }

      if (newsData.tags) {
        updateData.tags = newsData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }

      if (newsData.metaKeywords) {
        updateData.metaKeywords = newsData.metaKeywords.split(',').map(k => k.trim()).filter(k => k);
      }

      if (newsData.isPublished && !newsData.isPublished) {
        updateData.publishedAt = serverTimestamp();
      }

      await updateDoc(doc(db, NEWS_COLLECTION, id), updateData as UpdateData<DocumentData>);
    } catch (error) {
      console.error('Update news error:', error);
      throw new Error('Erro ao atualizar notícia');
    }
  }

  // Delete news
  static async deleteNews(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NEWS_COLLECTION, id));
    } catch (error) {
      console.error('Delete news error:', error);
      throw new Error('Erro ao excluir notícia');
    }
  }

  // Get news by ID
  static async getNewsById(id: string): Promise<News | null> {
    try {
      const newsDoc = await getDoc(doc(db, NEWS_COLLECTION, id));
      
      if (!newsDoc.exists()) {
        return null;
      }
      
      const data = newsDoc.data();
      return {
        id: newsDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate(),
      } as News;
    } catch (error) {
      console.error('Get news by ID error:', error);
      throw new Error('Erro ao buscar notícia');
    }
  }

  // Get news by slug
  static async getNewsBySlug(slug: string): Promise<NewsWithCategory | null> {
    try {
      console.log('Searching for news with slug:', slug);
      const newsQuery = query(
        collection(db, NEWS_COLLECTION),
        where('slug', '==', slug),
        where('isPublished', '==', true)
      );
      
      const newsSnapshot = await getDocs(newsQuery);
      console.log('Found news docs:', newsSnapshot.docs.length);
      
      if (newsSnapshot.empty) {
        console.log('No news found with slug:', slug);
        return null;
      }
      
      const newsDoc = newsSnapshot.docs[0];
      const newsData = newsDoc.data();
      console.log('News data:', { id: newsDoc.id, title: newsData.title, slug: newsData.slug, categoryId: newsData.categoryId });
      
      // Get category data
      const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, newsData.categoryId));
      const categoryData = categoryDoc.data();
      console.log('Category data:', categoryData);
      
      return {
        id: newsDoc.id,
        ...newsData,
        createdAt: newsData.createdAt?.toDate() || new Date(),
        updatedAt: newsData.updatedAt?.toDate() || new Date(),
        publishedAt: newsData.publishedAt?.toDate(),
        category: {
          id: categoryDoc.id,
          name: categoryData?.name || '',
          slug: categoryData?.slug || '',
          color: categoryData?.color || '#000000'
        }
      } as NewsWithCategory;
    } catch (error) {
      console.error('Get news by slug error:', error);
      throw new Error('Erro ao buscar notícia');
    }
  }

  // Increment views (with session protection)
  static async incrementViews(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, NEWS_COLLECTION, id), {
        views: increment(1)
      });
    } catch (error) {
      console.error('Increment views error:', error);
      // Don't throw error for views increment failure
    }
  }

  // Get featured news (top 5)
  static async getFeaturedNews(): Promise<FeaturedNews[]> {
    try {
      // Simplified query to avoid index requirements
      const featuredQuery = query(
        collection(db, NEWS_COLLECTION),
        where('isFeatured', '==', true),
        where('isPublished', '==', true),
        limit(10) // Get more to sort client-side
      );
      
      const featuredSnapshot = await getDocs(featuredQuery);
      const featuredNews: FeaturedNews[] = [];
      
      for (const newsDoc of featuredSnapshot.docs) {
        const newsData = newsDoc.data();
        
        // Get category data
        const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, newsData.categoryId));
        const categoryData = categoryDoc.data();
        
        featuredNews.push({
          id: newsDoc.id,
          title: newsData.title,
          subtitle: newsData.subtitle,
          coverImage: newsData.coverImage,
          slug: newsData.slug,
          category: {
            id: newsData.categoryId,
            name: categoryData?.name || 'Sem categoria',
            slug: categoryData?.slug || '',
            color: categoryData?.color || '#000000'
          },
          publishedAt: newsData.publishedAt?.toDate() || new Date(),
          views: newsData.views || 0,
          position: newsData.featuredPosition || 0
        });
      }
      
      // Sort by featuredPosition client-side and take top 5
      return featuredNews
        .sort((a, b) => a.position - b.position)
        .slice(0, 5);
    } catch (error) {
      console.error('Get featured news error:', error);
      // Return empty array instead of throwing error to prevent page crash
      return [];
    }
  }

  // Get news by category
  static async getNewsByCategory(
    categorySlug: string, 
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<NewsWithCategory>> {
    try {
      // First get category by slug
      const categoryQuery = query(
        collection(db, CATEGORIES_COLLECTION),
        where('slug', '==', categorySlug)
      );
      
      const categorySnapshot = await getDocs(categoryQuery);
      
      if (categorySnapshot.empty) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      const categoryDoc = categorySnapshot.docs[0];
      const categoryData = categoryDoc.data();
      
      // Get news by category
      const newsQuery = query(
        collection(db, NEWS_COLLECTION),
        where('categoryId', '==', categoryDoc.id),
        where('isPublished', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(params.limit)
      );
      
      const newsSnapshot = await getDocs(newsQuery);
      const news: NewsWithCategory[] = [];
      
      for (const newsDoc of newsSnapshot.docs) {
        const newsData = newsDoc.data();
        news.push({
          id: newsDoc.id,
          ...newsData,
          createdAt: newsData.createdAt?.toDate() || new Date(),
          updatedAt: newsData.updatedAt?.toDate() || new Date(),
          publishedAt: newsData.publishedAt?.toDate(),
          category: {
            id: categoryDoc.id,
            name: categoryData.name,
            slug: categoryData.slug,
            color: categoryData.color
          }
        } as NewsWithCategory);
      }
      
      return {
        data: news,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: news.length, // This is simplified - in production you'd want to get the actual total
          totalPages: Math.ceil(news.length / params.limit),
          hasNext: news.length === params.limit,
          hasPrev: params.page > 1
        }
      };
    } catch (error) {
      console.error('Get news by category error:', error);
      throw new Error('Erro ao buscar notícias da categoria');
    }
  }

  // Get recent news
  static async getRecentNews(limitCount: number = 10): Promise<NewsWithCategory[]> {
    try {
      const recentQuery = query(
        collection(db, NEWS_COLLECTION),
        where('isPublished', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );
      
      const recentSnapshot = await getDocs(recentQuery);
      const recentNews: NewsWithCategory[] = [];
      
      for (const newsDoc of recentSnapshot.docs) {
        const newsData = newsDoc.data();
        
        // Get category data
        const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, newsData.categoryId));
        const categoryData = categoryDoc.data();
        
        recentNews.push({
          id: newsDoc.id,
          ...newsData,
          createdAt: newsData.createdAt?.toDate() || new Date(),
          updatedAt: newsData.updatedAt?.toDate() || new Date(),
          publishedAt: newsData.publishedAt?.toDate(),
          category: {
            id: categoryDoc.id,
            name: categoryData?.name || '',
            slug: categoryData?.slug || '',
            color: categoryData?.color || '#000000'
          }
        } as NewsWithCategory);
      }
      
      return recentNews;
    } catch (error) {
      console.error('Get recent news error:', error);
      throw new Error('Erro ao buscar notícias recentes');
    }
  }

  // Get most read news (this week)
  static async getMostReadNews(limitCount: number = 10): Promise<NewsWithCategory[]> {
    try {
      // Calculate date one week ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const mostReadQuery = query(
        collection(db, NEWS_COLLECTION),
        where('isPublished', '==', true),
        where('publishedAt', '>=', oneWeekAgo),
        orderBy('publishedAt', 'desc'),
        limit(limitCount * 2) // Get more to sort by views client-side
      );
      
      const mostReadSnapshot = await getDocs(mostReadQuery);
      const mostReadNews: NewsWithCategory[] = [];
      
      for (const newsDoc of mostReadSnapshot.docs) {
        const newsData = newsDoc.data();
        
        // Get category data
        const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, newsData.categoryId));
        const categoryData = categoryDoc.data();
        
        mostReadNews.push({
          id: newsDoc.id,
          ...newsData,
          createdAt: newsData.createdAt?.toDate() || new Date(),
          updatedAt: newsData.updatedAt?.toDate() || new Date(),
          publishedAt: newsData.publishedAt?.toDate(),
          views: newsData.views || 0,
          category: {
            id: categoryDoc.id,
            name: categoryData?.name || '',
            slug: categoryData?.slug || '',
            color: categoryData?.color || '#000000'
          }
        } as NewsWithCategory);
      }
      
      // Sort by views (descending) and return top results
      return mostReadNews
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limitCount);
    } catch (error) {
      console.error('Get most read news error:', error);
      // Fallback to recent news if there's an error
      return this.getRecentNews(limitCount);
    }
  }

  // Get related news (intelligent matching by tags)
  static async getRelatedNews(newsId: string, limitCount: number = 3): Promise<RelatedNews[]> {
    try {
      // Get the current news to extract tags and category
      const currentNews = await this.getNewsById(newsId);
      
      if (!currentNews) {
        return [];
      }
      
      // Search for news with similar tags
      const relatedQuery = query(
        collection(db, NEWS_COLLECTION),
        where('isPublished', '==', true),
        where('categoryId', '==', currentNews.categoryId),
        orderBy('publishedAt', 'desc')
      );
      
      const relatedSnapshot = await getDocs(relatedQuery);
      const relatedNews: RelatedNews[] = [];
      
      for (const newsDoc of relatedSnapshot.docs) {
        if (newsDoc.id === newsId) continue; // Skip current news
        
        const newsData = newsDoc.data();
        const tags = newsData.tags || [];
        
        // Calculate similarity based on common tags
        const commonTags = currentNews.tags.filter(tag => tags.includes(tag));
        const similarity = commonTags.length / Math.max(currentNews.tags.length, tags.length);
        
        // Get category data
        const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, newsData.categoryId));
        const categoryData = categoryDoc.data();
        
        relatedNews.push({
          id: newsDoc.id,
          title: newsData.title,
          coverImage: newsData.coverImage,
          slug: newsData.slug,
          categoryName: categoryData?.name || '',
          publishedAt: newsData.publishedAt?.toDate() || new Date(),
          similarity
        });
      }
      
      // Sort by similarity and return top results
      return relatedNews
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Get related news error:', error);
      throw new Error('Erro ao buscar notícias relacionadas');
    }
  }

  // Search news
  static async searchNews(searchParams: SearchParams, pagination: PaginationParams): Promise<PaginatedResponse<NewsWithCategory>> {
    try {
      let newsQuery = query(
        collection(db, NEWS_COLLECTION),
        where('isPublished', '==', true)
      );
      
      // Add category filter if specified
      if (searchParams.category) {
        newsQuery = query(newsQuery, where('categoryId', '==', searchParams.category));
      }
      
      // Add featured filter if specified
      if (searchParams.isFeatured !== undefined) {
        newsQuery = query(newsQuery, where('isFeatured', '==', searchParams.isFeatured));
      }
      
      // Order by published date
      newsQuery = query(newsQuery, orderBy('publishedAt', 'desc'));
      
      // Add pagination
      newsQuery = query(newsQuery, limit(pagination.limit));
      
      const newsSnapshot = await getDocs(newsQuery);
      const news: NewsWithCategory[] = [];
      
      for (const newsDoc of newsSnapshot.docs) {
        const newsData = newsDoc.data();
        
        // Get category data
        const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, newsData.categoryId));
        const categoryData = categoryDoc.data();
        
        news.push({
          id: newsDoc.id,
          ...newsData,
          createdAt: newsData.createdAt?.toDate() || new Date(),
          updatedAt: newsData.updatedAt?.toDate() || new Date(),
          publishedAt: newsData.publishedAt?.toDate(),
          category: {
            id: categoryDoc.id,
            name: categoryData?.name || '',
            slug: categoryData?.slug || '',
            color: categoryData?.color || '#000000'
          }
        } as NewsWithCategory);
      }
      
      // Filter by search query if provided (client-side filtering for now)
      let filteredNews = news;
      if (searchParams.query) {
        const query = searchParams.query.toLowerCase();
        filteredNews = news.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.subtitle.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query)
        );
      }
      
      return {
        data: filteredNews,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: filteredNews.length,
          totalPages: Math.ceil(filteredNews.length / pagination.limit),
          hasNext: filteredNews.length === pagination.limit,
          hasPrev: pagination.page > 1
        }
      };
    } catch (error) {
      console.error('Search news error:', error);
      throw new Error('Erro ao buscar notícias');
    }
  }

  // Get all news (for admin)
  static async getAllNews(): Promise<News[]> {
    try {
      const newsQuery = query(
        collection(db, NEWS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const newsSnapshot = await getDocs(newsQuery);
      const news: News[] = [];
      
      for (const newsDoc of newsSnapshot.docs) {
        const newsData = newsDoc.data();
        news.push({
          id: newsDoc.id,
          ...newsData,
          createdAt: newsData.createdAt?.toDate() || new Date(),
          updatedAt: newsData.updatedAt?.toDate() || new Date(),
          publishedAt: newsData.publishedAt?.toDate(),
        } as News);
      }
      
      return news;
    } catch (error) {
      console.error('Get all news error:', error);
      throw new Error('Erro ao buscar todas as notícias');
    }
  }

  // Get news statistics
  static async getNewsStats(): Promise<NewsStats> {
    try {
      const newsSnapshot = await getDocs(collection(db, NEWS_COLLECTION));
      const categoriesSnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
      
      const news = newsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt?.toDate()
      })) as News[];
      
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const publishedNews = news.filter(n => n.isPublished);
      const draftNews = news.filter(n => !n.isPublished);
      const totalViews = news.reduce((sum, n) => sum + (n.views || 0), 0);
      
      // Group by category
      const newsByCategory = categories.map(cat => ({
        categoryName: (cat as Record<string, unknown>).name as string || 'Unknown',
        count: news.filter(n => n.categoryId === cat.id).length
      }));
      
      // Get recent news
      const recentNews = publishedNews
        .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
        .slice(0, 10);
      
      return {
        totalNews: news.length,
        publishedNews: publishedNews.length,
        draftNews: draftNews.length,
        totalViews,
        newsByCategory,
        recentNews
      };
    } catch (error) {
      console.error('Get news stats error:', error);
      throw new Error('Erro ao buscar estatísticas');
    }
  }
}
