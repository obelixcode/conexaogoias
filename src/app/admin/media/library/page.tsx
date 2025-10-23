'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Grid, 
  List, 
  Trash2, 
  Eye,
  Calendar,
  FileText
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressTable, WordPressTableHeader, WordPressTableBody, WordPressTableRow, WordPressTableCell, WordPressTableHeaderCell } from '@/components/admin/WordPressTable';
import { WordPressNotice } from '@/components/admin/WordPressNotice';
import { MediaService, MediaItem } from '@/lib/mediaService';

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = async () => {
    try {
      setLoading(true);
      const items = await MediaService.getMediaLibrary();
      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadFileName(file.name);
      
      // Create a custom upload function with progress tracking
      const uploadWithProgress = async () => {
        // Simulate progress for the first 80% (upload to storage)
        for (let i = 0; i <= 80; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Upload to MediaService (this handles both storage and Firestore)
        await MediaService.uploadMedia(file, {
          name: file.name,
          isPublic: true
        }, 'admin'); // TODO: Get actual user ID
        
        // Complete the progress
        setUploadProgress(100);
        await new Promise(resolve => setTimeout(resolve, 200));
      };
      
      await uploadWithProgress();
      
      // Reload media items
      await loadMediaItems();
      
      // Reset states and close modal
      setIsUploading(false);
      setUploadProgress(0);
      setUploadFileName('');
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadFileName('');
      alert('Erro ao fazer upload do arquivo');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    try {
      await MediaService.deleteMedia(itemId);
      await loadMediaItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Erro ao excluir arquivo');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.length} item(s)?`)) return;
    
    try {
      for (const itemId of selectedItems) {
        await MediaService.deleteMedia(itemId);
      }
      await loadMediaItems();
      setSelectedItems([]);
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Erro ao excluir arquivos');
    }
  };

  const formatFileSize = (bytes: number) => {
    return MediaService.formatFileSize(bytes);
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handlePreview = (item: MediaItem) => {
    setPreviewItem(item);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Mídia</h1>
        </div>
        <WordPressCard>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </WordPressCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Mídia</h1>
          <p className="text-gray-600">Gerencie seus arquivos de mídia</p>
        </div>
        <WordPressButton onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Nova
        </WordPressButton>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Fazer Upload</h3>
              <button
                onClick={() => !isUploading && setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={isUploading}
              >
                ×
              </button>
            </div>
            
            {isUploading ? (
              /* Upload Progress */
              <div className="space-y-4">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    Enviando arquivo...
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {uploadFileName}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
            ) : (
              /* Upload Area */
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload(file);
                    }
                  }}
                  className="w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload de arquivo"
                  title="Clique para fazer upload de um arquivo"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    Clique para fazer upload
                  </div>
                  <div className="text-sm text-gray-500">
                    Imagens, vídeos, documentos até 5MB
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{previewItem.name}</h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 max-h-[70vh] overflow-auto">
              {previewItem.type === 'image' ? (
                <div className="flex justify-center">
                  <Image
                    src={previewItem.url}
                    alt={previewItem.alt || previewItem.name}
                    width={800}
                    height={600}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              ) : previewItem.type === 'video' ? (
                <div className="flex justify-center">
                  <video
                    src={previewItem.url}
                    controls
                    className="max-w-full h-auto rounded-lg"
                  >
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Visualização não disponível
                  </p>
                  <p className="text-gray-500 mb-4">
                    Este tipo de arquivo não pode ser visualizado no navegador.
                  </p>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Baixar Arquivo
                  </a>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <p className="text-gray-600 truncate" title={previewItem.name}>
                    {previewItem.name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <p className="text-gray-600 capitalize">{previewItem.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tamanho:</span>
                  <p className="text-gray-600">{formatFileSize(previewItem.size)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data:</span>
                  <p className="text-gray-600">
                    {previewItem.uploadedAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              {previewItem.alt && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Descrição:</span>
                  <p className="text-gray-600">{previewItem.alt}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Abrir em Nova Aba
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewItem.url);
                    alert('URL copiada para a área de transferência!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Copiar URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <WordPressCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mídia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar mídia"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'image' | 'video' | 'document')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos os tipos</option>
              <option value="image">Imagens</option>
              <option value="video">Vídeos</option>
              <option value="document">Documentos</option>
            </select>
            
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Visualização em grade"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Visualização em lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </WordPressCard>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <WordPressNotice type="info">
          {selectedItems.length} item(s) selecionado(s). 
          <WordPressButton 
            variant="link" 
            size="small" 
            className="ml-2"
            onClick={handleBulkDelete}
          >
            Excluir Selecionados
          </WordPressButton>
        </WordPressNotice>
      )}

      {/* Media Items */}
      <WordPressCard>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`relative group cursor-pointer border rounded-lg overflow-hidden ${
                  selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : 'border-gray-200'
                }`}
                onClick={() => handleSelectItem(item.id)}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={item.alt || item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(item.size)}
                  </p>
                </div>
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <WordPressButton
                    variant="tertiary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(item);
                    }}
                    className="text-white hover:bg-white hover:text-black"
                  >
                    <Eye className="h-4 w-4" />
                  </WordPressButton>
                  
                  <WordPressButton
                    variant="tertiary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="text-white hover:bg-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </WordPressButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <WordPressTable>
            <WordPressTableHeader>
              <WordPressTableRow>
                <WordPressTableHeaderCell className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Selecionar todos os itens"
                  />
                </WordPressTableHeaderCell>
                <WordPressTableHeaderCell>Arquivo</WordPressTableHeaderCell>
                <WordPressTableHeaderCell>Tipo</WordPressTableHeaderCell>
                <WordPressTableHeaderCell>Tamanho</WordPressTableHeaderCell>
                <WordPressTableHeaderCell>Data</WordPressTableHeaderCell>
                <WordPressTableHeaderCell className="w-12">Ações</WordPressTableHeaderCell>
              </WordPressTableRow>
            </WordPressTableHeader>
            <WordPressTableBody>
              {filteredItems.map((item) => (
                <WordPressTableRow key={item.id} isSelected={selectedItems.includes(item.id)}>
                  <WordPressTableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Selecionar ${item.name}`}
                    />
                  </WordPressTableCell>
                  <WordPressTableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        {item.type === 'image' ? (
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.alt && (
                          <div className="text-sm text-gray-500">{item.alt}</div>
                        )}
                      </div>
                    </div>
                  </WordPressTableCell>
                  <WordPressTableCell>
                    <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  </WordPressTableCell>
                  <WordPressTableCell>
                    <span className="text-sm text-gray-600">{formatFileSize(item.size)}</span>
                  </WordPressTableCell>
                  <WordPressTableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {item.uploadedAt.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </WordPressTableCell>
                  <WordPressTableCell>
                    <div className="flex items-center space-x-2">
                      <WordPressButton
                        variant="tertiary"
                        size="small"
                        onClick={() => handlePreview(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </WordPressButton>
                      
                      <WordPressButton
                        variant="tertiary"
                        size="small"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </WordPressButton>
                    </div>
                  </WordPressTableCell>
                </WordPressTableRow>
              ))}
            </WordPressTableBody>
          </WordPressTable>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum arquivo encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece fazendo upload do seu primeiro arquivo.'
              }
            </p>
            <WordPressButton onClick={() => setShowUploadModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload
            </WordPressButton>
          </div>
        )}
      </WordPressCard>
    </div>
  );
}
