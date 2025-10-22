'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NewsService } from '@/lib/newsService';
import { CategoryService } from '@/lib/categoryService';
import { formatNewsDate } from '@/utils/formatDate';
import { NewsWithCategory, Category } from '@/types';

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, categoriesData] = await Promise.all([
          NewsService.searchNews(
            { 
              query: searchQuery,
              category: categoryFilter !== 'all' ? categoryFilter : undefined,
              isPublished: statusFilter === 'all' ? undefined : statusFilter === 'published'
            },
            { page: 1, limit: 50, sortBy, sortOrder }
          ),
          CategoryService.getActiveCategories()
        ]);

        setNews(newsData.data);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  const handleTogglePublish = async (newsId: string, currentStatus: boolean) => {
    try {
      await NewsService.updateNews(newsId, { isPublished: !currentStatus });
      
      // Update local state
      setNews(prev => prev.map(item => 
        item.id === newsId 
          ? { ...item, isPublished: !currentStatus }
          : item
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Erro ao alterar status de publicação');
    }
  };

  const handleToggleFeatured = async (newsId: string, currentStatus: boolean) => {
    try {
      await NewsService.updateNews(newsId, { isFeatured: !currentStatus });
      
      // Update local state
      setNews(prev => prev.map(item => 
        item.id === newsId 
          ? { ...item, isFeatured: !currentStatus }
          : item
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Erro ao alterar status de destaque');
    }
  };

  const handleDelete = async (newsId: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a notícia "${title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await NewsService.deleteNews(newsId);
      
      // Update local state
      setNews(prev => prev.filter(item => item.id !== newsId));
      alert('Notícia excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Erro ao excluir notícia');
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notícias</h1>
          <p className="text-gray-600">Gerencie todas as notícias do portal</p>
        </div>
        <Button asChild>
          <Link href="/admin/editor" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{news.length}</div>
              <div className="ml-2 text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {news.filter(item => item.isPublished).length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Publicadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-yellow-600">
                {news.filter(item => !item.isPublished).length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Rascunhos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {news.filter(item => item.isFeatured).length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Destaques</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Título, autor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="published">Publicadas</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Data de criação</SelectItem>
                  <SelectItem value="publishedAt">Data de publicação</SelectItem>
                  <SelectItem value="title">Título</SelectItem>
                  <SelectItem value="views">Visualizações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ordem</label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Decrescente</SelectItem>
                  <SelectItem value="asc">Crescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Notícias</CardTitle>
          <CardDescription>
            {filteredNews.length} notícia(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNews.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-sm text-gray-500 truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: item.category.color + '20', color: item.category.color }}
                      >
                        {item.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                          {item.isPublished ? 'Publicada' : 'Rascunho'}
                        </Badge>
                        {item.isFeatured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatNewsDate(item.publishedAt || item.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.views}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(item.id, item.isPublished)}
                          title={item.isPublished ? 'Despublicar' : 'Publicar'}
                        >
                          {item.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                          title={item.isFeatured ? 'Remover destaque' : 'Adicionar destaque'}
                        >
                          {item.isFeatured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/editor/${item.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
