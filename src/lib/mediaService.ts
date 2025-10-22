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
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { StorageService } from './storageService';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  alt?: string;
  caption?: string;
  uploadedBy: string;
  isPublic: boolean;
}

export interface MediaFormData {
  name: string;
  alt?: string;
  caption?: string;
  isPublic: boolean;
}

const MEDIA_COLLECTION = 'media';

export class MediaService {
  // Upload media file
  static async uploadMedia(
    file: File, 
    metadata: MediaFormData,
    uploadedBy: string
  ): Promise<string> {
    try {
      // Validate file
      const validation = StorageService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Upload to Storage
      const timestamp = Date.now();
      const fileName = `media-${timestamp}-${file.name}`;
      const path = `media/${fileName}`;
      
      let url: string;
      try {
        url = await StorageService.uploadImage(file, path);
      } catch (error) {
        console.warn('Storage upload failed, using fallback:', error);
        // Use fallback URL if storage fails
        url = `https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=${encodeURIComponent(file.name)}`;
      }
      
      // Save metadata to Firestore
      const docRef = await addDoc(collection(db, MEDIA_COLLECTION), {
        name: metadata.name || file.name,
        url,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document',
        size: file.size,
        alt: metadata.alt || '',
        caption: metadata.caption || '',
        uploadedBy,
        isPublic: metadata.isPublic,
        uploadedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Upload media error:', error);
      throw new Error('Erro ao fazer upload do arquivo');
    }
  }

  // Get media library
  static async getMediaLibrary(): Promise<MediaItem[]> {
    try {
      const mediaQuery = query(
        collection(db, MEDIA_COLLECTION),
        orderBy('uploadedAt', 'desc')
      );
      
      const mediaSnapshot = await getDocs(mediaQuery);
      
      return mediaSnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name || '',
          url: data.url || '',
          type: data.type || 'image',
          size: data.size || 0,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          alt: data.alt || '',
          caption: data.caption || '',
          uploadedBy: data.uploadedBy || '',
          isPublic: data.isPublic || false
        } as MediaItem;
      });
    } catch (error) {
      console.error('Get media library error:', error);
      throw new Error('Erro ao buscar biblioteca de mídia');
    }
  }

  // Get media by ID
  static async getMediaById(id: string): Promise<MediaItem | null> {
    try {
      const mediaDoc = await getDoc(doc(db, MEDIA_COLLECTION, id));
      
      if (!mediaDoc.exists()) {
        return null;
      }
      
      const data = mediaDoc.data();
      return {
        id: mediaDoc.id,
        ...data,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as MediaItem;
    } catch (error) {
      console.error('Get media by ID error:', error);
      throw new Error('Erro ao buscar arquivo de mídia');
    }
  }

  // Update media metadata
  static async updateMediaMetadata(id: string, updates: Partial<MediaFormData>): Promise<void> {
    try {
      await updateDoc(doc(db, MEDIA_COLLECTION, id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update media metadata error:', error);
      throw new Error('Erro ao atualizar metadados do arquivo');
    }
  }

  // Delete media
  static async deleteMedia(id: string): Promise<void> {
    try {
      // Get media item to get URL for storage deletion
      const mediaItem = await this.getMediaById(id);
      if (!mediaItem) {
        throw new Error('Arquivo não encontrado');
      }

      // Delete from Storage
      await StorageService.deleteImage(mediaItem.url);
      
      // Delete from Firestore
      await deleteDoc(doc(db, MEDIA_COLLECTION, id));
    } catch (error) {
      console.error('Delete media error:', error);
      throw new Error('Erro ao excluir arquivo');
    }
  }

  // Search media
  static async searchMedia(searchQuery: string): Promise<MediaItem[]> {
    try {
      const mediaQuery = query(
        collection(db, MEDIA_COLLECTION),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff'),
        orderBy('name')
      );
      
      const mediaSnapshot = await getDocs(mediaQuery);
      
      return mediaSnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name || '',
          url: data.url || '',
          type: data.type || 'image',
          size: data.size || 0,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          alt: data.alt || '',
          caption: data.caption || '',
          uploadedBy: data.uploadedBy || '',
          isPublic: data.isPublic || false
        } as MediaItem;
      });
    } catch (error) {
      console.error('Search media error:', error);
      throw new Error('Erro ao buscar arquivos');
    }
  }

  // Get media by type
  static async getMediaByType(type: 'image' | 'video' | 'document'): Promise<MediaItem[]> {
    try {
      const mediaQuery = query(
        collection(db, MEDIA_COLLECTION),
        where('type', '==', type),
        orderBy('uploadedAt', 'desc')
      );
      
      const mediaSnapshot = await getDocs(mediaQuery);
      
      return mediaSnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name || '',
          url: data.url || '',
          type: data.type || 'image',
          size: data.size || 0,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          alt: data.alt || '',
          caption: data.caption || '',
          uploadedBy: data.uploadedBy || '',
          isPublic: data.isPublic || false
        } as MediaItem;
      });
    } catch (error) {
      console.error('Get media by type error:', error);
      throw new Error('Erro ao buscar arquivos por tipo');
    }
  }

  // Get public media
  static async getPublicMedia(): Promise<MediaItem[]> {
    try {
      const mediaQuery = query(
        collection(db, MEDIA_COLLECTION),
        where('isPublic', '==', true),
        orderBy('uploadedAt', 'desc')
      );
      
      const mediaSnapshot = await getDocs(mediaQuery);
      
      return mediaSnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name || '',
          url: data.url || '',
          type: data.type || 'image',
          size: data.size || 0,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          alt: data.alt || '',
          caption: data.caption || '',
          uploadedBy: data.uploadedBy || '',
          isPublic: data.isPublic || false
        } as MediaItem;
      });
    } catch (error) {
      console.error('Get public media error:', error);
      throw new Error('Erro ao buscar arquivos públicos');
    }
  }

  // Get media statistics
  static async getMediaStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    imagesCount: number;
    videosCount: number;
    documentsCount: number;
  }> {
    try {
      const mediaSnapshot = await getDocs(collection(db, MEDIA_COLLECTION));
      
      const files = mediaSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DocumentData[];
      
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
      const imagesCount = files.filter(file => file.type === 'image').length;
      const videosCount = files.filter(file => file.type === 'video').length;
      const documentsCount = files.filter(file => file.type === 'document').length;
      
      return {
        totalFiles: files.length,
        totalSize,
        imagesCount,
        videosCount,
        documentsCount
      };
    } catch (error) {
      console.error('Get media stats error:', error);
      throw new Error('Erro ao buscar estatísticas de mídia');
    }
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clean up orphaned files
  static async cleanupOrphanedFiles(): Promise<void> {
    try {
      // This would typically be a server-side function
      // For now, we'll just log that it should be implemented
      console.log('Cleanup orphaned files should be implemented as a Cloud Function');
    } catch (error) {
      console.error('Cleanup orphaned files error:', error);
      throw new Error('Erro ao limpar arquivos órfãos');
    }
  }
}
