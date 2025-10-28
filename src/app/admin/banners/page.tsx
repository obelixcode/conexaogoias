'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  BarChart3, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Calendar,
  MousePointer
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressBadge } from '@/components/admin/WordPressBadge';
import { WordPressTable, WordPressTableHeader, WordPressTableBody, WordPressTableRow, WordPressTableCell, WordPressTableHeaderCell } from '@/components/admin/WordPressTable';
import { ImageUploader } from '@/components/ImageUploader';
import { BannerService } from '@/lib/bannerService';
import { Banner } from '@/types/banner';
import { formatDate } from '@/utils/formatDate';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 'header' as 'sidebar-top' | 'sidebar-bottom' | 'header' | 'content-top' | 'content-bottom' | 'between-news',
    isActive: true,
    startDate: '',
    endDate: '',
    maxClicks: 0,
    maxImpressions: 0,
    order: 0
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const allBanners = await BannerService.getAllBanners();
      setBanners(allBanners);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se a imagem foi carregada
    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      alert('Por favor, faça upload de uma imagem antes de salvar o banner.');
      return;
    }
    
    // Validar se a URL é válida
    if (!formData.imageUrl.startsWith('http://') && !formData.imageUrl.startsWith('https://')) {
      alert('A URL da imagem não é válida. Por favor, faça upload de uma nova imagem.');
      return;
    }
    
    try {
      if (editingBanner) {
        await BannerService.updateBanner(editingBanner.id, {
          title: formData.title,
          link: formData.linkUrl,
          position: formData.position,
          isActive: formData.isActive,
          order: formData.order,
          maxClicks: formData.maxClicks || undefined,
          maxImpressions: formData.maxImpressions || undefined,
          startsAt: formData.startDate ? new Date(formData.startDate) : undefined,
          expiresAt: formData.endDate ? new Date(formData.endDate) : undefined,
          targetAudience: ''
        }, formData.imageUrl);
        setBanners(banners.map(banner => 
          banner.id === editingBanner.id ? { ...banner, ...formData } : banner
        ));
      } else {
        const bannerData = {
          title: formData.title,
          link: formData.linkUrl,
          position: formData.position,
          isActive: formData.isActive,
          order: banners.length + 1,
          maxClicks: formData.maxClicks || undefined,
          maxImpressions: formData.maxImpressions || undefined,
          startsAt: formData.startDate ? new Date(formData.startDate) : undefined,
          expiresAt: formData.endDate ? new Date(formData.endDate) : undefined,
          targetAudience: ''
        };
        const newBannerId = await BannerService.createBanner(bannerData, formData.imageUrl);
        const newBanner = await BannerService.getBannerById(newBannerId);
        if (newBanner) {
          setBanners([...banners, newBanner]);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Erro ao salvar o banner. Verifique se todos os campos estão preenchidos corretamente.');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.image,
      linkUrl: banner.link,
      position: banner.position,
      isActive: banner.isActive,
      startDate: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : '',
      endDate: banner.expiresAt ? new Date(banner.expiresAt).toISOString().slice(0, 16) : '',
      maxClicks: banner.maxClicks || 0,
      maxImpressions: banner.maxImpressions || 0,
      order: banner.order || 0
    });
    setShowAddForm(true);
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    
    try {
      await BannerService.deleteBanner(bannerId);
      setBanners(prevBanners => prevBanners.filter(banner => banner.id !== bannerId));
      setSelectedBanners(prevSelected => prevSelected.filter(id => id !== bannerId));
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      await BannerService.toggleBannerStatus(banner.id);
      setBanners(prevBanners => prevBanners.map(b => 
        b.id === banner.id ? { ...b, isActive: !b.isActive } : b
      ));
    } catch (error) {
      console.error('Error updating banner status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      position: 'header',
      isActive: true,
      startDate: '',
      endDate: '',
      maxClicks: 0,
      maxImpressions: 0,
      order: 0
    });
    setEditingBanner(null);
    setShowAddForm(false);
  };

  const filteredBanners = (banners || []).filter(banner => {
    if (!banner || !banner.title) return false;
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && banner.isActive) ||
      (statusFilter === 'inactive' && !banner.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedBanners.length === filteredBanners.length) {
      setSelectedBanners([]);
    } else {
      setSelectedBanners(filteredBanners.map(banner => banner.id));
    }
  };

  const handleSelectBanner = (bannerId: string) => {
    setSelectedBanners(prev => 
      prev.includes(bannerId) 
        ? prev.filter(id => id !== bannerId)
        : [...prev, bannerId]
    );
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'header':
        return 'Cabeçalho';
      case 'content-top':
        return 'Topo do Conteúdo';
      case 'content-bottom':
        return 'Rodapé do Conteúdo';
      case 'sidebar-top':
        return 'Topo da Sidebar';
      case 'sidebar-bottom':
        return 'Rodapé da Sidebar';
      case 'between-news':
        return 'Entre Notícias';
      default:
        return position;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Banners Publicitários</h1>
          <p className="text-gray-600">Gerencie os banners do portal</p>
        </div>
        <WordPressButton onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </WordPressButton>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <WordPressCard title={editingBanner ? 'Editar Banner' : 'Novo Banner'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Banner Principal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posição *
                </label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as 'sidebar-top' | 'sidebar-bottom' | 'header' | 'content-top' | 'content-bottom' | 'between-news' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Selecionar posição do banner"
                >
                  <option value="header">Cabeçalho</option>
                  <option value="content-top">Topo do Conteúdo</option>
                  <option value="content-bottom">Rodapé do Conteúdo</option>
                  <option value="sidebar-top">Topo da Sidebar</option>
                  <option value="sidebar-bottom">Rodapé da Sidebar</option>
                  <option value="between-news">Entre Notícias</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem do Banner *
                </label>
                <ImageUploader
                  onImageUploaded={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl }))}
                  currentImage={formData.imageUrl}
                  aspectRatio="banner"
                  className="w-full"
                  uploadType="banner"
                  entityId={editingBanner?.id || `banner-${Date.now()}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link de Destino
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Data de início do banner"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Data de fim do banner"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Cliques
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxClicks}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxClicks: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 = ilimitado"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Impressões
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxImpressions}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxImpressions: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 = ilimitado"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Banner ativo
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <WordPressButton type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </WordPressButton>
              <WordPressButton 
                type="submit"
                disabled={!formData.imageUrl || !formData.imageUrl.trim() || (!formData.imageUrl.startsWith('http://') && !formData.imageUrl.startsWith('https://'))}
              >
                {editingBanner ? 'Atualizar' : 'Criar'} Banner
              </WordPressButton>
            </div>
          </form>
        </WordPressCard>
      )}

      {/* Filters */}
      <WordPressCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar banners"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por status"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </WordPressCard>

      {/* Banners Table */}
      <WordPressCard>
        <WordPressTable>
          <WordPressTableHeader>
            <WordPressTableRow>
              <WordPressTableHeaderCell className="w-12">
                <input
                  type="checkbox"
                  checked={selectedBanners.length === filteredBanners.length && filteredBanners.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Selecionar todos os banners"
                />
              </WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Banner</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Posição</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Status</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Cliques</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Impressões</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Data</WordPressTableHeaderCell>
              <WordPressTableHeaderCell className="w-12">Ações</WordPressTableHeaderCell>
            </WordPressTableRow>
          </WordPressTableHeader>
          <WordPressTableBody>
            {filteredBanners.map((banner) => {
              if (!banner || !banner.id) return null;
              return (
              <WordPressTableRow key={banner.id} isSelected={selectedBanners.includes(banner.id)}>
                <WordPressTableCell>
                  <input
                    type="checkbox"
                    checked={selectedBanners.includes(banner.id)}
                    onChange={() => handleSelectBanner(banner.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Selecionar banner ${banner.title}`}
                  />
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden relative">
                      {banner.image ? (
                        <Image
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">Sem imagem</div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{banner.title}</div>
                      {banner.link && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {banner.link}
                        </div>
                      )}
                    </div>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <WordPressBadge variant="info">
                    {getPositionLabel(banner.position)}
                  </WordPressBadge>
                </WordPressTableCell>
                <WordPressTableCell>
                  <WordPressBadge variant={banner.isActive ? 'success' : 'warning'}>
                    {banner.isActive ? 'Ativo' : 'Inativo'}
                  </WordPressBadge>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-1">
                    <MousePointer className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{banner.clicks || 0}</span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{banner.impressions || 0}</span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDate(banner.createdAt)}
                    </span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => handleToggleStatus(banner)}
                    >
                      {banner.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </WordPressButton>
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => handleEdit(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </WordPressButton>
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </WordPressButton>
                  </div>
                </WordPressTableCell>
              </WordPressTableRow>
              );
            })}
          </WordPressTableBody>
        </WordPressTable>

        {filteredBanners.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum banner encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando seu primeiro banner.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <WordPressButton onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Banner
              </WordPressButton>
            )}
          </div>
        )}
      </WordPressCard>
    </div>
  );
}
