'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Save, 
  X,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryService } from '@/lib/categoryService';
import { slugify } from '@/utils';
import { Category, CategoryFormData } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
  description: z.string().optional(),
  order: z.number().min(0),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const predefinedColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#1f2937', // dark gray
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isActive: true,
      order: 0,
      color: '#3b82f6',
    }
  });

  const watchedName = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !editingCategory) {
      const slug = slugify(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, editingCategory]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await CategoryService.getAllCategories();
        setCategories(cats.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error loading categories:', error);
        alert('Erro ao carregar categorias');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSaving(true);
    
    try {
      if (editingCategory) {
        // Update existing category
        await CategoryService.updateCategory(editingCategory.id, data);
        
        // Update local state
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...data }
            : cat
        ));
        
        alert('Categoria atualizada com sucesso!');
      } else {
        // Create new category
        const categoryId = await CategoryService.createCategory(data);
        
        // Add to local state
        const newCategory = {
          id: categoryId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.order - b.order));
        
        alert('Categoria criada com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingCategory(null);
      reset();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar categoria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('slug', category.slug);
    setValue('color', category.color);
    setValue('description', category.description || '');
    setValue('order', category.order);
    setValue('isActive', category.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await CategoryService.deleteCategory(category.id);
      
      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== category.id));
      alert('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir categoria');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await CategoryService.updateCategory(category.id, { isActive: !category.isActive });
      
      // Update local state
      setCategories(prev => prev.map(cat => 
        cat.id === category.id 
          ? { ...cat, isActive: !cat.isActive }
          : cat
      ));
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Erro ao alterar status da categoria');
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    reset({
      isActive: true,
      order: categories.length,
      color: '#3b82f6',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    reset();
  };

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
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600">Gerencie as categorias de notícias</p>
        </div>
        <Button onClick={handleNewCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="ml-2 text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.filter(cat => cat.isActive).length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Ativas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-red-600">
                {categories.filter(cat => !cat.isActive).length}
              </div>
              <div className="ml-2 text-sm text-gray-600">Inativas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>
            {categories.length} categoria(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{category.order}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-600">{category.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-gray-600">
                        {category.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(category)}
                          title={category.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      aria-label={`Editar categoria ${category.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
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

      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Atualize as informações da categoria'
                : 'Crie uma nova categoria de notícias'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                {...register('name')}
                placeholder="Nome da categoria"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                {...register('slug')}
                placeholder="url-da-categoria"
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="color">Cor</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    {...register('color')}
                    type="color"
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    {...register('color')}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setValue('color', color)}
                      aria-label={`Selecionar cor ${color}`}
                    />
                  ))}
                </div>
              </div>
              {errors.color && (
                <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                {...register('description')}
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="order">Ordem</Label>
              <Input
                {...register('order', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="rounded"
              />
              <Label htmlFor="isActive">Categoria ativa</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
