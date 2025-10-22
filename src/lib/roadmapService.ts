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
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  RoadmapRequest, 
  RoadmapFormData, 
  RoadmapStatusChange, 
  RoadmapStatus, 
  RoadmapPriority,
  RoadmapStats,
  RoadmapFilters
} from '@/types';

const ROADMAP_COLLECTION = 'roadmap_requests';
const TIMELINE_COLLECTION = 'roadmap_status_timeline';

export class RoadmapService {
  // Create new roadmap request
  static async createRequest(formData: RoadmapFormData, authorId: string, authorName: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, ROADMAP_COLLECTION), {
        title: formData.title,
        description: formData.description || '',
        content: formData.content,
        priority: formData.priority,
        status: 'open' as RoadmapStatus,
        authorId,
        authorName,
        coverImage: formData.coverImage || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create initial status change entry
      await this.createStatusChange(docRef.id, authorId, authorName, 'open', 'open', 'Solicitação criada');

      return docRef.id;
    } catch (error) {
      console.error('Error creating roadmap request:', error);
      throw new Error('Erro ao criar solicitação');
    }
  }

  // Update existing roadmap request
  static async updateRequest(requestId: string, formData: RoadmapFormData): Promise<void> {
    try {
      const docRef = doc(db, ROADMAP_COLLECTION, requestId);
      await updateDoc(docRef, {
        title: formData.title,
        description: formData.description || '',
        content: formData.content,
        priority: formData.priority,
        coverImage: formData.coverImage || '',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating roadmap request:', error);
      throw new Error('Erro ao atualizar solicitação');
    }
  }

  // Delete roadmap request
  static async deleteRequest(requestId: string): Promise<void> {
    try {
      // Delete all timeline entries first
      const timelineQuery = query(
        collection(db, TIMELINE_COLLECTION),
        where('requestId', '==', requestId)
      );
      const timelineSnapshot = await getDocs(timelineQuery);
      
      const deletePromises = timelineSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the request
      await deleteDoc(doc(db, ROADMAP_COLLECTION, requestId));
    } catch (error) {
      console.error('Error deleting roadmap request:', error);
      throw new Error('Erro ao excluir solicitação');
    }
  }

  // Get roadmap request by ID
  static async getRequestById(requestId: string): Promise<RoadmapRequest | null> {
    try {
      const docRef = doc(db, ROADMAP_COLLECTION, requestId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.mapDocumentToRoadmapRequest(docSnap);
    } catch (error) {
      console.error('Error getting roadmap request:', error);
      throw new Error('Erro ao buscar solicitação');
    }
  }

  // Get all roadmap requests
  static async getAllRequests(): Promise<RoadmapRequest[]> {
    try {
      console.log('🔍 Buscando solicitações do roadmap...');
      const q = query(
        collection(db, ROADMAP_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('📊 Encontradas', querySnapshot.docs.length, 'solicitações');
      
      // Ordenar por prioridade no cliente
      const requests = querySnapshot.docs.map(doc => this.mapDocumentToRoadmapRequest(doc));
      return requests.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Alta prioridade primeiro
        }
        
        // Se a prioridade for igual, ordenar por data de criação (mais recente primeiro)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    } catch (error) {
      console.error('❌ Error getting roadmap requests:', error);
      throw new Error('Erro ao buscar solicitações');
    }
  }

  // Get requests by status
  static async getRequestsByStatus(status: RoadmapStatus): Promise<RoadmapRequest[]> {
    try {
      const q = query(
        collection(db, ROADMAP_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => this.mapDocumentToRoadmapRequest(doc));
      
      // Ordenar por prioridade no cliente
      return requests.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Alta prioridade primeiro
        }
        
        // Se a prioridade for igual, ordenar por data de criação (mais recente primeiro)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    } catch (error) {
      console.error('Error getting requests by status:', error);
      throw new Error('Erro ao buscar solicitações por status');
    }
  }

  // Get requests with filters
  static async getRequestsWithFilters(filters: RoadmapFilters): Promise<RoadmapRequest[]> {
    try {
      let q = query(collection(db, ROADMAP_COLLECTION));

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters.authorId) {
        q = query(q, where('authorId', '==', filters.authorId));
      }

      // Always order by priority and creation date
      q = query(q, orderBy('priority', 'asc'), orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let requests = querySnapshot.docs.map(doc => this.mapDocumentToRoadmapRequest(doc));

      // Apply date filters in memory (Firestore doesn't support range queries on multiple fields)
      if (filters.dateFrom) {
        requests = requests.filter(request => request.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        requests = requests.filter(request => request.createdAt <= filters.dateTo!);
      }

      return requests;
    } catch (error) {
      console.error('Error getting requests with filters:', error);
      throw new Error('Erro ao buscar solicitações com filtros');
    }
  }

  // Update request status
  static async updateStatus(
    requestId: string, 
    newStatus: RoadmapStatus, 
    userId: string, 
    userName: string,
    comment?: string
  ): Promise<void> {
    try {
      // Get current request to know old status
      const currentRequest = await this.getRequestById(requestId);
      if (!currentRequest) {
        throw new Error('Solicitação não encontrada');
      }

      const oldStatus = currentRequest.status;

      // Update the request status
      const docRef = doc(db, ROADMAP_COLLECTION, requestId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Create status change entry
      await this.createStatusChange(requestId, userId, userName, oldStatus, newStatus, comment);
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Erro ao atualizar status');
    }
  }

  // Create status change entry
  private static async createStatusChange(
    requestId: string,
    userId: string,
    userName: string,
    oldStatus: RoadmapStatus,
    newStatus: RoadmapStatus,
    comment?: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, TIMELINE_COLLECTION), {
        requestId,
        userId,
        userName,
        oldStatus,
        newStatus,
        comment: comment || '',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating status change:', error);
      // Don't throw here as the main operation might have succeeded
    }
  }

  // Get status timeline for a request
  static async getStatusTimeline(requestId: string): Promise<RoadmapStatusChange[]> {
    try {
      const q = query(
        collection(db, TIMELINE_COLLECTION),
        where('requestId', '==', requestId),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapDocumentToStatusChange(doc));
    } catch (error) {
      console.error('Error getting status timeline:', error);
      throw new Error('Erro ao buscar histórico de status');
    }
  }

  // Get roadmap statistics
  static async getStats(): Promise<RoadmapStats> {
    try {
      const allRequests = await this.getAllRequests();
      
      const stats: RoadmapStats = {
        total: allRequests.length,
        open: allRequests.filter(r => r.status === 'open').length,
        in_progress: allRequests.filter(r => r.status === 'in_progress').length,
        completed: allRequests.filter(r => r.status === 'completed').length,
        byPriority: {
          high: allRequests.filter(r => r.priority === 'high').length,
          medium: allRequests.filter(r => r.priority === 'medium').length,
          low: allRequests.filter(r => r.priority === 'low').length,
        }
      };

      return stats;
    } catch (error) {
      console.error('Error getting roadmap stats:', error);
      throw new Error('Erro ao buscar estatísticas');
    }
  }

  // Helper method to map Firestore document to RoadmapRequest
  private static mapDocumentToRoadmapRequest(doc: QueryDocumentSnapshot<DocumentData>): RoadmapRequest {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      content: data.content,
      priority: data.priority,
      status: data.status,
      authorId: data.authorId,
      authorName: data.authorName,
      coverImage: data.coverImage,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  // Helper method to map Firestore document to RoadmapStatusChange
  private static mapDocumentToStatusChange(doc: QueryDocumentSnapshot<DocumentData>): RoadmapStatusChange {
    const data = doc.data();
    return {
      id: doc.id,
      requestId: data.requestId,
      userId: data.userId,
      userName: data.userName,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      timestamp: data.timestamp?.toDate() || new Date(),
      comment: data.comment,
    };
  }
}
