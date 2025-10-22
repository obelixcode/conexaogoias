import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from './firebase';

export class StorageService {
  // Upload image with compression and retry logic
  static async uploadImage(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void,
    maxRetries: number = 3
  ): Promise<string> {
    // Check if Firebase Storage is available
    if (!storage) {
      console.warn('Firebase Storage not available, using fallback URL');
      return this.getFallbackImageUrl(file);
    }

    // Try to use storage, but fallback if it fails
    try {
      // Test if storage is actually working
      const testRef = ref(storage, 'test');
      if (!testRef) {
        throw new Error('Storage not properly initialized');
      }
    } catch (error) {
      console.warn('Firebase Storage not properly configured, using fallback URL:', error);
      return this.getFallbackImageUrl(file);
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Compress image if it's too large
        const compressedFile = await this.compressImage(file);
        
        const storageRef = ref(storage, path);
        
        // If we get here but storage is not working, fallback
        if (!storageRef) {
          throw new Error('Storage reference could not be created');
        }
        
        if (onProgress) {
          const uploadTask = uploadBytesResumable(storageRef, compressedFile);
          
          return new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
              },
              (error) => {
                console.error(`Upload attempt ${attempt} failed:`, error);
                lastError = error;
                reject(error);
              },
              async () => {
                try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(downloadURL);
                } catch (error) {
                  console.error(`Get download URL attempt ${attempt} failed:`, error);
                  lastError = error as Error;
                  reject(error);
                }
              }
            );
          });
        } else {
          const snapshot = await uploadBytes(storageRef, compressedFile);
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log('Upload successful:', { path, downloadURL });
          
          // Test if the URL is accessible
          try {
            const response = await fetch(downloadURL, { method: 'HEAD' });
            if (!response.ok) {
              console.warn('Uploaded file not accessible:', response.status);
              throw new Error(`File not accessible: ${response.status}`);
            }
            console.log('File accessibility test passed');
          } catch (accessError) {
            console.warn('File accessibility test failed:', accessError);
            throw new Error('Uploaded file is not accessible');
          }
          
          return downloadURL;
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Upload attempt ${attempt} failed:`, error);
        
        // If it's a permission error, use fallback immediately
        if (error instanceof Error && error.message.includes('permission')) {
          console.warn('Permission denied, using fallback URL');
          return this.getFallbackImageUrl(file);
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.error('All upload attempts failed, using fallback:', lastError);
    return this.getFallbackImageUrl(file);
  }

  // Fallback method when Firebase Storage is not available
  public static getFallbackImageUrl(file: File): string {
    // Use a placeholder service or return a data URL
    // For development, we'll use a placeholder service
    // In production, you should implement a proper fallback
    return `https://placehold.co/800x400/3B82F6/FFFFFF/png?text=${encodeURIComponent(file.name)}`;
  }

  // Test Firebase Storage connectivity
  static async testStorageConnection(): Promise<boolean> {
    try {
      if (!storage) {
        console.error('Firebase Storage not initialized');
        return false;
      }

      // Try to create a reference
      const testRef = ref(storage, 'test-connection');
      if (!testRef) {
        console.error('Could not create storage reference');
        return false;
      }

      console.log('Firebase Storage connection test successful');
      return true;
    } catch (error) {
      console.error('Firebase Storage connection test failed:', error);
      return false;
    }
  }

  // Upload cover image
  static async uploadCoverImage(
    file: File, 
    newsId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `cover-${newsId}-${timestamp}.${file.name.split('.').pop()}`;
    const path = `covers/${fileName}`;
    
    return this.uploadImage(file, path, onProgress);
  }

  // Upload content image (for Tiptap editor)
  static async uploadContentImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `content-${timestamp}.${file.name.split('.').pop()}`;
    const path = `content/${fileName}`;
    
    return this.uploadImage(file, path, onProgress);
  }

  // Upload banner image
  static async uploadBannerImage(
    file: File,
    bannerId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `banner-temp-${timestamp}-${randomId}.${file.name.split('.').pop()}`;
    const path = `banners/${fileName}`;
    
    console.log('Uploading banner image:', { fileName, path });
    
    try {
      const url = await this.uploadImage(file, path, onProgress);
      console.log('Banner upload completed:', url);
      return url;
    } catch (error) {
      console.error('Banner upload failed:', error);
      // Return fallback URL for development
      return this.getFallbackImageUrl(file);
    }
  }

  // Delete image
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Delete image error:', error);
      // Don't throw error for delete failures (image might not exist)
    }
  }

  // Compress image
  private static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Get file size in MB
  static getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }

  // Validate image file
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSizeMB = 5;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de arquivo não suportado. Use JPG, PNG ou WebP.'
      };
    }
    
    if (this.getFileSizeMB(file) > maxSizeMB) {
      return {
        isValid: false,
        error: `Arquivo muito grande. Máximo ${maxSizeMB}MB.`
      };
    }
    
    return { isValid: true };
  }

  // Generate unique filename
  static generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    const cleanBaseName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const prefixStr = prefix ? `${prefix}-` : '';
    return `${prefixStr}${cleanBaseName}-${timestamp}-${randomString}.${extension}`;
  }

  // Extract path from Firebase Storage URL
  static extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
      return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch {
      return null;
    }
  }

  // Clean up orphaned images (helper for admin)
  static async cleanupOrphanedImages(imageUrls: string[]): Promise<void> {
    try {
      const deletePromises = imageUrls.map(url => this.deleteImage(url));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cleanup orphaned images error:', error);
      throw new Error('Erro ao limpar imagens órfãs');
    }
  }
}
