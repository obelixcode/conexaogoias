'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressBadge } from '@/components/admin/WordPressBadge';
import { WordPressTable, WordPressTableHeader, WordPressTableBody, WordPressTableRow, WordPressTableCell, WordPressTableHeaderCell } from '@/components/admin/WordPressTable';
import { WordPressNotice } from '@/components/admin/WordPressNotice';
import { NewsService } from '@/lib/newsService';
import { News } from '@/types/news';
import { formatDate } from '@/utils/formatDate';

export default function PostsPage() {
  const [posts, setPosts] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await NewsService.getAllNews();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    
    try {
      await NewsService.deleteNews(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleToggleStatus = async (post: News) => {
    try {
      const updateData = {
        isPublished: !post.isPublished,
        publishedAt: !post.isPublished ? new Date().toISOString() : undefined
      };
      
      await NewsService.updateNews(post.id, updateData);
      setPosts(posts.map(p => p.id === post.id ? { 
        ...p, 
        isPublished: !p.isPublished,
        publishedAt: !p.isPublished ? new Date() : undefined
      } : p));
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' ? post.isPublished : !post.isPublished);
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return <WordPressBadge variant="success">Publicado</WordPressBadge>;
    } else {
      return <WordPressBadge variant="warning">Rascunho</WordPressBadge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
          <p className="text-gray-600">Gerencie todas as notícias do portal</p>
        </div>
        <WordPressButton asChild>
          <a href="/admin/editor" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </a>
        </WordPressButton>
      </div>

      {/* Filters */}
      <WordPressCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notícias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por status"
            >
              <option value="all">Todos os status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </div>
        </div>
      </WordPressCard>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <WordPressNotice type="info">
          {selectedPosts.length} notícia(s) selecionada(s). 
          <WordPressButton variant="link" size="small" className="ml-2">
            Ações em lote
          </WordPressButton>
        </WordPressNotice>
      )}

      {/* Posts Table */}
      <WordPressCard>
        <WordPressTable>
          <WordPressTableHeader>
            <WordPressTableRow>
              <WordPressTableHeaderCell className="w-12">
              <input
                type="checkbox"
                checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label="Selecionar todas as notícias"
              />
              </WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Título</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Autor</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Categoria</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Status</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Data</WordPressTableHeaderCell>
              <WordPressTableHeaderCell className="w-12">Ações</WordPressTableHeaderCell>
            </WordPressTableRow>
          </WordPressTableHeader>
          <WordPressTableBody>
            {filteredPosts.map((post) => (
              <WordPressTableRow key={post.id} isSelected={selectedPosts.includes(post.id)}>
                <WordPressTableCell>
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => handleSelectPost(post.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Selecionar notícia: ${post.title}`}
                  />
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{post.title}</div>
                      {post.subtitle && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {post.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{post.author}</span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <WordPressBadge variant="info">{post.categoryId}</WordPressBadge>
                </WordPressTableCell>
                <WordPressTableCell>
                  {getStatusBadge(post.isPublished)}
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {post.publishedAt 
                        ? formatDate(post.publishedAt)
                        : formatDate(post.createdAt)
                      }
                    </span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => handleToggleStatus(post)}
                    >
                      {post.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </WordPressButton>
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => window.location.href = `/admin/editor/${post.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </WordPressButton>
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </WordPressButton>
                  </div>
                </WordPressTableCell>
              </WordPressTableRow>
            ))}
          </WordPressTableBody>
        </WordPressTable>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira notícia.'
              }
            </p>
            <WordPressButton asChild>
              <a href="/admin/editor" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Nova Notícia
              </a>
            </WordPressButton>
          </div>
        )}
      </WordPressCard>
    </div>
  );
}
