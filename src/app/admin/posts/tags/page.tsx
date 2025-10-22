'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Trash2, 
  Tag as TagIcon,
  BarChart3
} from 'lucide-react';
import { TagService } from '@/lib/tagService';
import { Tag } from '@/types/tag';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load tags
  useEffect(() => {
    loadTags();
  }, []);

  // Filter tags based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(tags);
    }
  }, [searchTerm, tags]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tagsData = await TagService.getAllTags();
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
      setError('Erro ao carregar tags');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta tag?')) {
      return;
    }

    try {
      await TagService.deleteTag(id);
      setSuccess('Tag deletada com sucesso!');
      loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError('Erro ao deletar tag');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600">Gerencie as tags utilizadas nas notícias</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tags</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Únicas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(tags.map(tag => tag.name.toLowerCase())).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome da tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Tags List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tags</CardTitle>
          <CardDescription>
            {filteredTags.length} de {tags.length} tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTags.length === 0 ? (
            <div className="text-center py-8">
              <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma tag encontrada' : 'Nenhuma tag cadastrada'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                As tags são criadas automaticamente quando você escreve no campo de tags do editor de notícias.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <h3 className="font-medium">{tag.name}</h3>
                      <p className="text-sm text-gray-500">
                        Criada em {tag.createdAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}