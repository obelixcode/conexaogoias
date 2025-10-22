'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  FileText
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressBadge } from '@/components/admin/WordPressBadge';
import { WordPressTable, WordPressTableHeader, WordPressTableBody, WordPressTableRow, WordPressTableCell, WordPressTableHeaderCell } from '@/components/admin/WordPressTable';
import { CategoryService } from '@/lib/categoryService';
import { Category } from '@/types/category';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const allCategories = await CategoryService.getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar slug único
      const isSlugUnique = await CategoryService.isSlugUnique(formData.slug, editingCategory?.id);
      if (!isSlugUnique) {
        alert('Já existe uma categoria com este slug. Escolha outro.');
        return;
      }

      if (editingCategory) {
        await CategoryService.updateCategory(editingCategory.id, formData);
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...formData } : cat
        ));
      } else {
        // Calcular order baseado no número de categorias existentes
        const categoryData = {
          ...formData,
          order: categories.length + 1
        };
        await CategoryService.createCategory(categoryData);
        // Recarregar categorias para obter o objeto completo
        const updatedCategories = await CategoryService.getAllCategories();
        setCategories(updatedCategories);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error instanceof Error && error.message.includes('slug')) {
        alert(error.message);
      } else {
        alert('Erro ao salvar categoria');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
      order: category.order || 0,
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await CategoryService.deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      order: 0,
      isActive: true
    });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600">Organize suas notícias por categorias</p>
        </div>
        <WordPressButton onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </WordPressButton>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <WordPressCard title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Política, Esportes, Tecnologia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  disabled={!!editingCategory}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    editingCategory ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="ex-politica-esportes-tecnologia"
                />
                {editingCategory && (
                  <p className="text-xs text-gray-500 mt-1">
                    O slug não pode ser alterado após a criação
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição opcional da categoria"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                    aria-label="Selecionar cor da categoria"
                  />
                  <span className="text-sm text-gray-500">
                    {formData.color}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
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
                Categoria ativa
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <WordPressButton type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </WordPressButton>
              <WordPressButton type="submit">
                {editingCategory ? 'Atualizar' : 'Criar'} Categoria
              </WordPressButton>
            </div>
          </form>
        </WordPressCard>
      )}

      {/* Search */}
      <WordPressCard>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar categorias"
              />
        </div>
      </WordPressCard>

      {/* Categories Table */}
      <WordPressCard>
        <WordPressTable>
          <WordPressTableHeader>
            <WordPressTableRow>
              <WordPressTableHeaderCell>Nome</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Slug</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Descrição</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Cor</WordPressTableHeaderCell>
              <WordPressTableHeaderCell>Notícias</WordPressTableHeaderCell>
              <WordPressTableHeaderCell className="w-12">Ações</WordPressTableHeaderCell>
            </WordPressTableRow>
          </WordPressTableHeader>
          <WordPressTableBody>
            {filteredCategories.map((category) => (
              <WordPressTableRow key={category.id}>
                <WordPressTableCell>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </code>
                </WordPressTableCell>
                <WordPressTableCell>
                  <span className="text-sm text-gray-600">
                    {category.description || 'Sem descrição'}
                  </span>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-600">{category.color}</span>
                  </div>
                </WordPressTableCell>
                <WordPressTableCell>
                  <WordPressBadge variant="info">
                    <FileText className="h-3 w-3 mr-1" />
                    0
                  </WordPressBadge>
                </WordPressTableCell>
                <WordPressTableCell>
                  <div className="flex items-center space-x-2">
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </WordPressButton>
                    <WordPressButton
                      variant="tertiary"
                      size="small"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </WordPressButton>
                  </div>
                </WordPressTableCell>
              </WordPressTableRow>
            ))}
          </WordPressTableBody>
        </WordPressTable>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Tente ajustar o termo de busca.'
                : 'Comece criando sua primeira categoria.'
              }
            </p>
            {!searchTerm && (
              <WordPressButton onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </WordPressButton>
            )}
          </div>
        )}
      </WordPressCard>
    </div>
  );
}
