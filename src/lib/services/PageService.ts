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
import { db } from '@/lib/firebase';

export interface Page {
  id?: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'private';
  type: 'footer' | 'general';
  footerType?: 'privacy' | 'terms' | 'about' | 'contact' | 'custom';
  metaDescription?: string;
  seoTitle?: string;
  author: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageData {
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'private';
  type: 'footer' | 'general';
  footerType?: 'privacy' | 'terms' | 'about' | 'contact' | 'custom';
  metaDescription?: string;
  seoTitle?: string;
  author: string;
}

export interface UpdatePageData extends Partial<CreatePageData> {
  id: string;
}

export interface PageFilters {
  status?: 'published' | 'draft' | 'private';
  type?: 'footer' | 'general';
  footerType?: 'privacy' | 'terms' | 'about' | 'contact' | 'custom';
  search?: string;
}

class PageService {
  private collectionName = 'pages';

  // Converter dados do Firestore para o formato da interface
  private convertFirestoreData(data: Record<string, unknown>, id: string): Page {
    return {
      id,
      title: (data.title as string) || '',
      slug: (data.slug as string) || '',
      content: (data.content as string) || '',
      status: (data.status as 'published' | 'draft' | 'private') || 'draft',
      type: (data.type as 'footer' | 'general') || 'general',
      footerType: data.footerType as 'about' | 'terms' | 'privacy' | 'contact' | 'custom' | undefined,
      metaDescription: data.metaDescription as string | undefined,
      seoTitle: data.seoTitle as string | undefined,
      author: (data.author as string) || 'Admin',
      views: (data.views as number) || 0,
      createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
      updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    };
  }

  // Converter dados da interface para o formato do Firestore
  private convertToFirestoreData(data: CreatePageData | UpdatePageData) {
    const now = serverTimestamp();
    const { id, ...dataWithoutId } = data as CreatePageData & { id?: string };
    return {
      ...dataWithoutId,
      updatedAt: now,
      ...(id ? {} : { createdAt: now, views: 0 }),
    };
  }

  // Buscar todas as páginas com filtros
  async getPages(filters: PageFilters = {}): Promise<Page[]> {
    try {
      let q = query(collection(db, this.collectionName));

      // Aplicar filtros
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.footerType) {
        q = query(q, where('footerType', '==', filters.footerType));
      }

      // Ordenar por data de atualização
      q = query(q, orderBy('updatedAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let pages = querySnapshot.docs.map(doc => 
        this.convertFirestoreData(doc.data(), doc.id)
      );

      // Aplicar filtro de busca no cliente (para simplicidade)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        pages = pages.filter(page => 
          page.title.toLowerCase().includes(searchTerm) ||
          page.slug.toLowerCase().includes(searchTerm) ||
          page.content.toLowerCase().includes(searchTerm)
        );
      }

      return pages;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  // Buscar página por ID
  async getPageById(id: string): Promise<Page | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertFirestoreData(docSnap.data(), docSnap.id);
      }

      return null;
    } catch (error) {
      console.error('Error fetching page by ID:', error);
      throw error;
    }
  }

  // Buscar página por slug
  async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        where('status', '==', 'published')
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return this.convertFirestoreData(doc.data(), doc.id);
      }

      return null;
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      throw error;
    }
  }

  // Criar nova página
  async createPage(data: CreatePageData): Promise<string> {
    try {
      const firestoreData = this.convertToFirestoreData(data);
      const docRef = await addDoc(collection(db, this.collectionName), firestoreData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  // Atualizar página existente
  async updatePage(data: UpdatePageData): Promise<void> {
    try {
      const { id, ...updateData } = data;
      const firestoreData = this.convertToFirestoreData({ ...updateData, id } as UpdatePageData);
      
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, firestoreData);
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  // Deletar página
  async deletePage(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  // Incrementar visualizações
  async incrementViews(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentViews = docSnap.data().views || 0;
        await updateDoc(docRef, { 
          views: currentViews + 1,
          lastViewedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Não lançar erro para não quebrar a experiência do usuário
    }
  }

  // Buscar páginas do rodapé
  async getFooterPages(): Promise<Page[]> {
    return this.getPages({ 
      type: 'footer', 
      status: 'published' 
    });
  }

  // Buscar páginas gerais
  async getGeneralPages(): Promise<Page[]> {
    return this.getPages({ 
      type: 'general', 
      status: 'published' 
    });
  }

  // Verificar se slug já existe
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug)
      );

      const querySnapshot = await getDocs(q);
      
      if (excludeId) {
        return querySnapshot.docs.every(doc => doc.id !== excludeId);
      }

      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  }
}

export const pageService = new PageService();
