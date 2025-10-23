'use client';

import { useState, useEffect } from 'react';
import { 
  File, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  FileText
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressTable, WordPressTableHeader, WordPressTableBody, WordPressTableRow, WordPressTableCell, WordPressTableHeaderCell } from '@/components/admin/WordPressTable';
import { pageService, Page, PageFilters } from '@/lib/services/PageService';

// Interface removida - agora usando a do PageService

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'footer' | 'general'>('all');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  useEffect(() => {
    loadPages();
  }, [statusFilter, typeFilter, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPages = async () => {
    try {
      setLoading(true);
      const filters: PageFilters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: searchTerm || undefined
      };
      
      const pagesData = await pageService.getPages(filters);
      setPages(pagesData);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página?')) return;
    
    try {
      await pageService.deletePage(pageId);
      setPages(prevPages => prevPages.filter(page => page.id !== pageId));
      setSelectedPages(prevSelected => prevSelected.filter(id => id !== pageId));
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  // Filtros agora são aplicados no loadPages, então usamos pages diretamente
  const filteredPages = pages;

  const handleSelectAll = () => {
    if (selectedPages.length === filteredPages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(filteredPages.map(page => page.id).filter((id): id is string => id !== undefined));
    }
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
      draft: { label: 'Rascunho', className: 'bg-yellow-100 text-yellow-800' },
      private: { label: 'Privado', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Páginas</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Páginas</h1>
          <p className="text-gray-600">Gerencie as páginas do site</p>
        </div>
        <div className="flex space-x-2">
          <WordPressButton onClick={() => window.location.href = '/admin/pages/new?type=footer'}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Página do Rodapé
          </WordPressButton>
          <WordPressButton variant="secondary" onClick={() => window.location.href = '/admin/pages/new?type=general'}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Página Geral
          </WordPressButton>
        </div>
      </div>

      {/* Filters and Search */}
      <WordPressCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar páginas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar páginas"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                const value = e.target.value as 'all' | 'footer' | 'general';
                setTypeFilter(value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos os tipos</option>
              <option value="footer">Páginas do Rodapé</option>
              <option value="general">Páginas Gerais</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value as 'all' | 'published' | 'draft' | 'private';
                setStatusFilter(value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por status"
            >
              <option value="all">Todos os status</option>
              <option value="published">Publicadas</option>
              <option value="draft">Rascunhos</option>
              <option value="private">Privadas</option>
            </select>
          </div>
        </div>
      </WordPressCard>

      {/* Bulk Actions */}
      {selectedPages.length > 0 && (
        <WordPressCard>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedPages.length} página(s) selecionada(s)
            </span>
            <div className="flex space-x-2">
              <WordPressButton 
                variant="secondary" 
                size="small"
                onClick={() => {/* TODO: Implementar ações em lote */}}
              >
                Ações em Lote
              </WordPressButton>
            </div>
          </div>
        </WordPressCard>
      )}

      {/* Pages Table */}
      <WordPressCard>
        <WordPressTable>
          <WordPressTableHeader>
            <WordPressTableRow>
              <WordPressTableHeaderCell className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Selecionar todas as páginas"
                />
              </WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Título</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Tipo</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Status</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Autor</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Visualizações</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Data</WordPressTableHeaderCell>
              <WordPressTableHeaderCell className="w-12">Ações</WordPressTableHeaderCell>
            </WordPressTableRow>
          </WordPressTableHeader>
          <WordPressTableBody>
            {filteredPages.map((page) => (
              <WordPressTableRow key={page.id} isSelected={page.id ? selectedPages.includes(page.id) : false}>
                <WordPressTableCell>
                  <input
                    type="checkbox"
                    checked={page.id ? selectedPages.includes(page.id) : false}
                    onChange={() => page.id && handleSelectPage(page.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Selecionar página ${page.title}`}
                  />
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{page.title}</div>
                      <div className="text-sm text-gray-500">/{page.slug}</div>
                    </div>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.type === 'footer' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {page.type === 'footer' ? 'Rodapé' : 'Geral'}
                    </span>
                    {page.footerType && (
                      <span className="text-xs text-gray-500">
                        {page.footerType === 'privacy' && 'Política de Privacidade'}
                        {page.footerType === 'terms' && 'Termos de Uso'}
                        {page.footerType === 'about' && 'Sobre Nós'}
                        {page.footerType === 'contact' && 'Contato'}
                        {page.footerType === 'custom' && 'Personalizada'}
                      </span>
                    )}
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  {getStatusBadge(page.status)}
                </WordPressTableCell>
                <WordPressTableCell>
                  <span className="text-sm text-gray-600">{page.author}</span>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{page.views}</span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {page.updatedAt.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => {/* TODO: Implementar visualização */}}
                    >
                      <Eye className="h-4 w-4" />
                    </WordPressButton>
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => page.id && (window.location.href = `/admin/pages/edit/${page.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </WordPressButton>
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => page.id && handleDelete(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </WordPressButton>
                  </div>
                </WordPressTableCell>
              </WordPressTableRow>
            ))}
          </WordPressTableBody>
        </WordPressTable>

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma página encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira página.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <div className="flex space-x-2">
                <WordPressButton onClick={() => window.location.href = '/admin/pages/new?type=footer'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Página do Rodapé
                </WordPressButton>
                <WordPressButton variant="secondary" onClick={() => window.location.href = '/admin/pages/new?type=general'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Página Geral
                </WordPressButton>
              </div>
            )}
          </div>
        )}
      </WordPressCard>
    </div>
  );
}
