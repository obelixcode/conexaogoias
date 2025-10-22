import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

const VIEWS_COLLECTION = 'news_views';
const NEWS_COLLECTION = 'news';

export interface ViewData {
  newsId: string;
  views: number;
  uniqueViews: number;
  lastViewedAt: string;
  sessionViews: Record<string, number>; // sessionId -> count
}

export class ViewsService {
  // Incrementar visualização de uma notícia
  static async incrementView(newsId: string, sessionId: string): Promise<void> {
    try {
      console.log('Incrementing view for newsId:', newsId, 'sessionId:', sessionId);
      
      const viewDocRef = doc(db, VIEWS_COLLECTION, newsId);
      const viewDoc = await getDoc(viewDocRef);
      
      if (viewDoc.exists()) {
        const viewData = viewDoc.data() as ViewData;
        console.log('Existing view data:', viewData);
        
        // Verificar se já visualizou nesta sessão
        const sessionViews = viewData.sessionViews || {};
        const hasViewedInSession = sessionViews[sessionId] > 0;
        
        console.log('Has viewed in session:', hasViewedInSession);
        
        // Atualizar contadores
        await updateDoc(viewDocRef, {
          views: increment(1),
          uniqueViews: hasViewedInSession ? viewData.uniqueViews : increment(1),
          lastViewedAt: new Date().toISOString(),
          [`sessionViews.${sessionId}`]: increment(1)
        });

        // Atualizar campo views da notícia
        const newsDocRef = doc(db, NEWS_COLLECTION, newsId);
        await updateDoc(newsDocRef, {
          views: increment(1)
        });
        
        console.log('View updated successfully');
      } else {
        console.log('Creating new view document');
        
        // Criar novo documento de visualizações
        const newViewData: ViewData = {
          newsId,
          views: 1,
          uniqueViews: 1,
          lastViewedAt: new Date().toISOString(),
          sessionViews: { [sessionId]: 1 }
        };
        
        await setDoc(viewDocRef, newViewData);

        // Atualizar campo views da notícia
        const newsDocRef = doc(db, NEWS_COLLECTION, newsId);
        await updateDoc(newsDocRef, {
          views: increment(1)
        });
        
        console.log('New view document created');
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
      throw error;
    }
  }

  // Obter estatísticas de visualização de uma notícia
  static async getNewsViews(newsId: string): Promise<ViewData | null> {
    try {
      const viewDocRef = doc(db, VIEWS_COLLECTION, newsId);
      const viewDoc = await getDoc(viewDocRef);
      
      if (viewDoc.exists()) {
        return viewDoc.data() as ViewData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting news views:', error);
      throw error;
    }
  }

  // Obter estatísticas gerais de visualizações
  static async getViewsStats(): Promise<{
    totalViews: number;
    totalUniqueViews: number;
    mostViewedNews: Array<{
      newsId: string;
      views: number;
      uniqueViews: number;
    }>;
  }> {
    try {
      // Em produção, isso seria uma query mais complexa
      // Por simplicidade, retornamos dados mockados
      return {
        totalViews: 12543,
        totalUniqueViews: 8932,
        mostViewedNews: [
          { newsId: '1', views: 1250, uniqueViews: 980 },
          { newsId: '2', views: 1100, uniqueViews: 850 },
          { newsId: '3', views: 950, uniqueViews: 720 }
        ]
      };
    } catch (error) {
      console.error('Error getting views stats:', error);
      throw error;
    }
  }

  // Limpar visualizações antigas (manutenção)
  static async cleanupOldViews(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Em produção, implementar query para remover visualizações antigas
      console.log('Cleaning up views older than:', cutoffDate.toISOString());
    } catch (error) {
      console.error('Error cleaning up old views:', error);
      throw error;
    }
  }
}
