import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { CategoryHighlight, HighlightPost } from '@/types/category';

const CATEGORIES_COLLECTION = 'categories';
const NEWS_COLLECTION = 'news';

export class CategoryHighlightsService {
  // Buscar destaques por categoria
  static async getCategoryHighlights(): Promise<CategoryHighlight[]> {
    try {
      // Buscar todas as categorias ativas
      const categoriesQuery = query(
        collection(db, CATEGORIES_COLLECTION),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as { id: string; name: string; slug: string; color: string; isActive: boolean; order: number }));

      // Para cada categoria, buscar os 5 posts mais recentes
      const categoryHighlights: CategoryHighlight[] = [];
      
      for (const category of categories) {
        const newsQuery = query(
          collection(db, NEWS_COLLECTION),
          where('categoryId', '==', category.id),
          where('isPublished', '==', true),
          orderBy('publishedAt', 'desc'),
          limit(4)
        );
        
        const newsSnapshot = await getDocs(newsQuery);
        const posts: HighlightPost[] = [];
        let latestPostDate = new Date(0);
        
        newsSnapshot.forEach((doc) => {
          const data = doc.data();
          const publishedAt = data.publishedAt?.toDate() || data.createdAt?.toDate() || new Date();
          
          posts.push({
            id: doc.id,
            title: data.title,
            coverImage: data.coverImage,
            slug: data.slug,
            publishedAt,
            views: data.views || 0
          });
          
          // Atualizar data do post mais recente
          if (publishedAt > latestPostDate) {
            latestPostDate = publishedAt;
          }
        });
        
        // Só incluir categorias que têm posts
        if (posts.length > 0) {
          categoryHighlights.push({
            id: category.id,
            name: category.name,
            slug: category.slug,
            color: category.color,
            posts,
            latestPostDate
          });
        }
      }
      
      // Ordenar categorias pela data do post mais recente (mais recente primeiro)
      categoryHighlights.sort((a, b) => b.latestPostDate.getTime() - a.latestPostDate.getTime());
      
      // Retornar apenas as 4 primeiras categorias
      return categoryHighlights.slice(0, 4);
      
    } catch (error) {
      console.error('Error getting category highlights:', error);
      return [];
    }
  }
}
