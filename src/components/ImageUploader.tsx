'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorageService } from '@/lib/storageService';
import { isFirebaseStorageUrl } from '@/utils';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  uploadType?: 'banner' | 'cover' | 'content';
  entityId?: string; // ID da notícia, banner, etc
}

export function ImageUploader({ 
  onImageUploaded, 
  currentImage,
  className = '',
  aspectRatio = 'video',
  uploadType = 'cover',
  entityId
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[16/9]'
  };

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = StorageService.validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl: string;
      
      // Use o método de upload correto baseado no tipo
      if (uploadType === 'banner') {
        imageUrl = await StorageService.uploadBannerImage(
          file, 
          entityId || `temp-${Date.now()}`,
          (progress) => setUploadProgress(progress)
        );
      } else if (uploadType === 'cover') {
        imageUrl = await StorageService.uploadCoverImage(
          file, 
          entityId || `temp-${Date.now()}`,
          (progress) => setUploadProgress(progress)
        );
      } else { // content
        imageUrl = await StorageService.uploadContentImage(
          file, 
          (progress) => setUploadProgress(progress)
        );
      }
      
      onImageUploaded(imageUrl);
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem');
      setPreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    try {
      setPreview(null);
      onImageUploaded('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.warn('Error removing image:', error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
          hover:border-gray-400 transition-colors cursor-pointer
          ${aspectRatioClasses[aspectRatio]}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload de imagem"
        />

        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={isFirebaseStorageUrl(preview)}
            />
            
            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="text-sm mb-2">Fazendo upload...</div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="progress-bar"
                      style={{ '--progress': `${uploadProgress}%` } as React.CSSProperties}
                    />
                  </div>
                  <div className="text-xs mt-1">{Math.round(uploadProgress)}%</div>
                </div>
              </div>
            )}

            {/* Remove button */}
            {!isUploading && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  try {
                    e.stopPropagation();
                    removeImage();
                  } catch (error) {
                    console.warn('Error removing image:', error);
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Success indicator */}
            {!isUploading && uploadProgress === 0 && preview !== currentImage && (
              <div className="absolute top-2 left-2">
                <div className="bg-green-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              {isUploading ? 'Fazendo upload...' : 'Clique ou arraste uma imagem aqui'}
            </div>
            <div className="text-sm text-gray-500">
              PNG, JPG, WebP até 5MB
            </div>
            
            {isUploading && (
              <div className="mt-4 w-full max-w-xs">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="progress-bar"
                    style={{ '--progress': `${uploadProgress}%` } as React.CSSProperties}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {Math.round(uploadProgress)}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {preview && !isUploading && (
        <div className="text-sm text-gray-600 text-center">
          Imagem carregada com sucesso! Clique para alterar.
        </div>
      )}
    </div>
  );
}
