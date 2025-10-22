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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, CategoryFormData, CategoryWithCount, CategoryStats } from '@/types';

const CATEGORIES_COLLECTION = 'categories';
const NEWS_COLLECTION = 'news';

export class CategoryService {
  // Create category
  static async createCategory(categoryData: CategoryFormData): Promise<string> {
    try {
      // Check if slug already exists
      const existingCategory = await this.getCategoryBySlug(categoryData.slug);
      if (existingCategory) {
        throw new Error('Já existe uma categoria com este slug');
      }
      
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
        name: categoryData.name,
        slug: categoryData.slug,
        color: categoryData.color,
        description: categoryData.description || '',
        order: categoryData.order,
        isActive: categoryData.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create category error:', error);
      if (error instanceof Error && error.message.includes('slug')) {
        throw error;
      }
      throw new Error('Erro ao criar categoria');
    }
  }

  // Update category
  static async updateCategory(id: string, categoryData: Partial<CategoryFormData>): Promise<void> {
    try {
      // Check if slug already exists (excluding current category)
      if (categoryData.slug) {
        const existingCategory = await this.getCategoryBySlug(categoryData.slug);
        if (existingCategory && existingCategory.id !== id) {
          throw new Error('Já existe uma categoria com este slug');
        }
      }
      
      await updateDoc(doc(db, CATEGORIES_COLLECTION, id), {
        ...categoryData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update category error:', error);
      if (error instanceof Error && error.message.includes('slug')) {
        throw error;
      }
      throw new Error('Erro ao atualizar categoria');
    }
  }

  // Delete category
  static async deleteCategory(id: string): Promise<void> {
    try {
      // Check if category has news
      const newsQuery = query(
        collection(db, NEWS_COLLECTION),
        where('categoryId', '==', id)
      );
      
      const newsSnapshot = await getDocs(newsQuery);
      
      if (!newsSnapshot.empty) {
        throw new Error('Não é possível excluir categoria que possui notícias');
      }
      
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
    } catch (error) {
      console.error('Delete category error:', error);
      if (error instanceof Error && error.message.includes('notícias')) {
        throw error;
      }
      throw new Error('Erro ao excluir categoria');
    }
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, id));
      
      if (!categoryDoc.exists()) {
        return null;
      }
      
      const data = categoryDoc.data();
      return {
        id: categoryDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Category;
    } catch (error) {
      console.error('Get category by ID error:', error);
      throw new Error('Erro ao buscar categoria');
    }
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categoryQuery = query(
        collection(db, CATEGORIES_COLLECTION),
        where('slug', '==', slug)
      );
      
      const categorySnapshot = await getDocs(categoryQuery);
      
      if (categorySnapshot.empty) {
        return null;
      }
      
      const categoryDoc = categorySnapshot.docs[0];
      const data = categoryDoc.data();
      
      return {
        id: categoryDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Category;
    } catch (error) {
      console.error('Get category by slug error:', error);
      throw new Error('Erro ao buscar categoria');
    }
  }

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      // First try with orderBy, if it fails, get without ordering
      let categoriesSnapshot;
      
      try {
        const categoriesQuery = query(
          collection(db, CATEGORIES_COLLECTION),
          orderBy('order', 'asc')
        );
        categoriesSnapshot = await getDocs(categoriesQuery);
      } catch (orderError) {
        console.warn('OrderBy failed, fetching without order:', orderError);
        // Fallback: get all categories without ordering
        categoriesSnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
      }
      
      const categories = categoriesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Category;
      });
      
      // Sort manually if orderBy failed
      return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('Get all categories error:', error);
      throw new Error('Erro ao buscar categorias');
    }
  }

  // Get active categories
  static async getActiveCategories(): Promise<Category[]> {
    try {
      // First try with orderBy, if it fails, get without ordering
      let categoriesSnapshot;
      
      try {
        const categoriesQuery = query(
          collection(db, CATEGORIES_COLLECTION),
          where('isActive', '==', true),
          orderBy('order', 'asc')
        );
        categoriesSnapshot = await getDocs(categoriesQuery);
      } catch (orderError) {
        console.warn('OrderBy failed for active categories, fetching without order:', orderError);
        // Fallback: get active categories without ordering
        const categoriesQuery = query(
          collection(db, CATEGORIES_COLLECTION),
          where('isActive', '==', true)
        );
        categoriesSnapshot = await getDocs(categoriesQuery);
      }
      
      const categories = categoriesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Category;
      });
      
      // Sort manually if orderBy failed
      return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('Get active categories error:', error);
      throw new Error('Erro ao buscar categorias ativas');
    }
  }

  // Get categories with news count
  static async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    try {
      const categories = await this.getAllCategories();
      const categoriesWithCount: CategoryWithCount[] = [];
      
      for (const category of categories) {
        // Get news count for this category
        const newsQuery = query(
          collection(db, NEWS_COLLECTION),
          where('categoryId', '==', category.id),
          where('isPublished', '==', true)
        );
        
        const newsSnapshot = await getDocs(newsQuery);
        
        categoriesWithCount.push({
          ...category,
          newsCount: newsSnapshot.size
        });
      }
      
      return categoriesWithCount;
    } catch (error) {
      console.error('Get categories with count error:', error);
      throw new Error('Erro ao buscar categorias com contagem');
    }
  }

  // Update category order
  static async updateCategoryOrder(categoryIds: string[]): Promise<void> {
    try {
      const updatePromises = categoryIds.map((id, index) => 
        updateDoc(doc(db, CATEGORIES_COLLECTION, id), {
          order: index + 1,
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Update category order error:', error);
      throw new Error('Erro ao atualizar ordem das categorias');
    }
  }

  // Generate slug from name
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  // Check if slug is unique
  static async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const categoryQuery = query(
        collection(db, CATEGORIES_COLLECTION),
        where('slug', '==', slug)
      );
      
      const categorySnapshot = await getDocs(categoryQuery);
      
      if (excludeId) {
        return categorySnapshot.docs.every(doc => doc.id !== excludeId);
      }
      
      return categorySnapshot.empty;
    } catch (error) {
      console.error('Check slug unique error:', error);
      throw new Error('Erro ao verificar slug');
    }
  }

  // Get category statistics
  static async getCategoryStats(): Promise<CategoryStats> {
    try {
      const categoriesSnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
      const newsSnapshot = await getDocs(collection(db, NEWS_COLLECTION));
      
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const news = newsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const activeCategories = categories.filter(cat => (cat as Record<string, unknown>).isActive);
      const categoriesWithNews = categories.filter(cat => 
        news.some(n => (n as Record<string, unknown>).categoryId === cat.id)
      );
      
      // Get top categories by news count and views
      const topCategories = categories.map(cat => {
        const categoryNews = news.filter(n => (n as Record<string, unknown>).categoryId === cat.id);
        const totalViews = categoryNews.reduce((sum, n) => sum + ((n as Record<string, unknown>).views as number || 0), 0);
        
        return {
          categoryName: (cat as Record<string, unknown>).name as string,
          newsCount: categoryNews.length,
          views: totalViews
        };
      }).sort((a, b) => b.newsCount - a.newsCount).slice(0, 10);
      
      return {
        totalCategories: categories.length,
        activeCategories: activeCategories.length,
        categoriesWithNews: categoriesWithNews.length,
        topCategories
      };
    } catch (error) {
      console.error('Get category stats error:', error);
      throw new Error('Erro ao buscar estatísticas das categorias');
    }
  }
}
