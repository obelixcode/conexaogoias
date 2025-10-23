'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Editor } from '@/components/Editor';
import { ImageUploader } from '@/components/ImageUploader';
import { NewsService } from '@/lib/newsService';
import { CategoryService } from '@/lib/categoryService';
import { TagService } from '@/lib/tagService';
import { slugify } from '@/utils';
import { NewsFormData, Category } from '@/types';
import { useSettingsContext } from '@/contexts/SettingsContext';
import CategorySelector from '@/components/CategorySelector';
import TagAutocomplete from '@/components/TagAutocomplete';
import { SuccessModal } from '@/components/SuccessModal';

export default function EditorPage() {
  const { settings } = useSettingsContext();
  const router = useRouter();
  const [, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty }
  } = useForm({
    defaultValues: {
      title: '',
      subtitle: '',
      content: '',
      categoryId: '',
      author: `Redação ${settings.siteName}`,
      tags: '',
      slug: '',
      publishedAt: '',
      isPublished: false,
      isFeatured: false,
      featuredPosition: undefined,
      metaDescription: '',
      metaKeywords: ''
    }
  });

  // Combine form dirty state with manual tracking
  const isFormDirty = isDirty || hasUnsavedChanges;

  const watchedTitle = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle) {
      const slug = slugify(watchedTitle);
      setValue('slug', slug);
    }
  }, [watchedTitle, setValue]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await CategoryService.getActiveCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const onSubmit = async (data: Record<string, unknown>) => {
    // Validações obrigatórias
    const title = String(data.title || '').trim();
    const subtitle = String(data.subtitle || '').trim();
    const content = String(data.content || '').trim();
    const categoryId = String(data.categoryId || '');
    const tags = String(data.tags || '').trim();
    const publishedAt = data.publishedAt ? String(data.publishedAt) : '';
    const isPublished = Boolean(data.isPublished);

    if (!title) {
      alert('Título é obrigatório');
      return;
    }
    if (!subtitle) {
      alert('Resumo é obrigatório');
      return;
    }
    if (!content || content.length < 50) {
      alert('Conteúdo é obrigatório e deve ter pelo menos 50 caracteres');
      return;
    }
    if (!categoryId) {
      alert('Categoria é obrigatória');
      return;
    }
    if (!tags) {
      alert('Tags são obrigatórias');
      return;
    }
    if (!coverImageUrl) {
      alert('Por favor, faça upload de uma imagem de capa');
      return;
    }

    if (!publishedAt && isPublished) {
      alert('Por favor, selecione uma data de publicação');
      return;
    }

    setIsSaving(true);
    
    try {
      // Create tags automatically
      const tagIds = await TagService.createTagsFromString(tags);
      
      const newsData = {
        ...data,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        tagIds: tagIds
      };
      
      const newsId = await NewsService.createNews(newsData as unknown as NewsFormData, coverImageUrl);
      
      if (isPublished) {
        setSuccessMessage('Sua notícia foi publicada com sucesso! Ela já está disponível no site.');
        setShowSuccessModal(true);
      } else {
        setSuccessMessage('Rascunho salvo com sucesso! Você pode continuar editando ou publicar quando estiver pronto.');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Erro ao salvar notícia');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setCoverImageUrl(url);
    setHasUnsavedChanges(true);
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setValue('content', content);
    setHasUnsavedChanges(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    setValue('categoryId', categoryId);
    setHasUnsavedChanges(true);
  };

  const handleTagsChange = (tags: string) => {
    setValue('tags', tags);
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Notícia</h1>
            <p className="text-gray-600">Crie uma nova matéria para o portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!isFormDirty}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || !isFormDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Título</CardTitle>
                <CardDescription>
                  Título principal da notícia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  {...register('title')}
                  placeholder="Digite o título da notícia"
                />
              </CardContent>
            </Card>

            {/* Subtitle */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo *</CardTitle>
                <CardDescription>
                  Resumo da notícia (obrigatório)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('subtitle')}
                  placeholder="Digite o resumo da notícia"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
                <CardDescription>
                  Corpo principal da notícia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Editor
                  content={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Comece a escrever o conteúdo da notícia..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem de Capa *</CardTitle>
                <CardDescription>
                  Imagem principal da notícia (obrigatória)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onImageUploaded={handleImageUpload}
                  currentImage={coverImageUrl}
                  aspectRatio="video"
                />
                {!coverImageUrl && (
                  <p className="text-red-500 text-sm mt-2">
                    Imagem de capa é obrigatória
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Publication Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>
                  Opções de publicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category */}
                <div>
                  <Label htmlFor="categoryId">Categoria *</Label>
                  <CategorySelector
                    value={watch('categoryId')}
                    onChange={handleCategoryChange}
                    placeholder="Selecione uma categoria"
                  />
                </div>

                {/* Author */}
                <div>
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    {...register('author')}
                    placeholder="Nome do autor"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags *</Label>
                  <TagAutocomplete
                    value={watch('tags')}
                    onChange={handleTagsChange}
                    placeholder="Digite as tags separadas por vírgula..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separe as tags por vírgula. Tags existentes aparecerão como sugestão.
                  </p>
                </div>

                {/* Data de Publicação */}
                <div>
                  <Label htmlFor="publishedAt">Data de Publicação</Label>
                  <Input
                    type="datetime-local"
                    {...register('publishedAt')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para usar a data atual
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">URL (Slug)</Label>
                  <Input
                    {...register('slug')}
                    placeholder="url-da-noticia"
                  />
                </div>

                {/* Publication Status */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      {...register('isPublished')}
                      className="rounded"
                    />
                    <Label htmlFor="isPublished">Publicar imediatamente</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      {...register('isFeatured')}
                      className="rounded"
                    />
                    <Label htmlFor="isFeatured">Destaque na homepage</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>
                  Configurações para busca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    {...register('metaDescription')}
                    placeholder="Descrição para buscadores"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    {...register('metaKeywords')}
                    placeholder="palavra1, palavra2, palavra3"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separe as palavras-chave por vírgula
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso!"
        message={successMessage}
        redirectTo="/admin/posts"
      />
    </div>
  );
}
