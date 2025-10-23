'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { StorageService } from '@/lib/storageService';
import { MediaService } from '@/lib/mediaService';

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function MediaUploadPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const newFiles: UploadedFile[] = fileArray.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      url: '',
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploading(true);

    // Upload files
    for (const uploadFile of newFiles) {
      try {
        // Use MediaService to upload and save to Firestore
        const mediaId = await MediaService.uploadMedia(uploadFile.file, {
          name: uploadFile.file.name,
          isPublic: true
        }, 'admin'); // TODO: Get actual user ID
        
        // Get the media item to get the URL
        const mediaItem = await MediaService.getMediaById(mediaId);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, url: mediaItem?.url || '', status: 'success', progress: 100 }
              : f
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: 'Erro no upload' }
              : f
          )
        );
      }
    }

    setUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8 text-green-500" />;
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8 text-purple-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const successfulUploads = uploadedFiles.filter(f => f.status === 'success').length;
  const failedUploads = uploadedFiles.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <WordPressButton
            variant="tertiary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </WordPressButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fazer Upload</h1>
            <p className="text-gray-600">Envie arquivos para a biblioteca de mídia</p>
          </div>
        </div>
      </div>

      {/* Upload Stats */}
      {uploadedFiles.length > 0 && (
        <WordPressCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{uploadedFiles.length}</span> arquivo(s) selecionado(s)
              </div>
              {successfulUploads > 0 && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">{successfulUploads} enviado(s)</span>
                </div>
              )}
              {failedUploads > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">{failedUploads} erro(s)</span>
                </div>
              )}
            </div>
            
            {uploading && (
              <div className="text-sm text-blue-600 font-medium">
                Enviando...
              </div>
            )}
          </div>
        </WordPressCard>
      )}

      {/* Upload Area */}
      <WordPressCard>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-gray-500 mb-4">
            Suporte para imagens, vídeos, áudios e documentos
          </p>
          
          <input
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivos
          </label>
        </div>
      </WordPressCard>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <WordPressCard title="Arquivos Enviados" description="Lista dos arquivos processados">
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file)}
                  <div>
                    <div className="font-medium text-gray-900">{file.file.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.file.size)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {file.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="progress-bar h-full bg-blue-500"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{file.progress}%</span>
                    </div>
                  )}
                  
                  {file.status === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Enviado</span>
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <X className="h-4 w-4" />
                      <span className="text-sm font-medium">{file.error}</span>
                    </div>
                  )}
                  
                  <WordPressButton
                    variant="tertiary"
                    size="small"
                    onClick={() => {
                      try {
                        removeFile(file.id);
                      } catch (error) {
                        console.warn('Error removing file:', error);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </WordPressButton>
                </div>
              </div>
            ))}
          </div>
        </WordPressCard>
      )}

      {/* Actions */}
      {uploadedFiles.length > 0 && (
        <div className="flex justify-end space-x-3">
          <WordPressButton
            variant="secondary"
            onClick={() => {
              try {
                setUploadedFiles([]);
              } catch (error) {
                console.warn('Error clearing file list:', error);
              }
            }}
          >
            Limpar Lista
          </WordPressButton>
          
          <WordPressButton
            onClick={() => {
              try {
                window.location.href = '/admin/media/library';
              } catch (error) {
                console.warn('Error navigating to library:', error);
              }
            }}
          >
            Ver Biblioteca
          </WordPressButton>
        </div>
      )}
    </div>
  );
}
