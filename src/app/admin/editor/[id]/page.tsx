'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Eye, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Editor } from '@/components/Editor';
import { ImageUploader } from '@/components/ImageUploader';
import { NewsService } from '@/lib/newsService';
import { TagService } from '@/lib/tagService';
import { slugify } from '@/utils';
import { NewsFormData, News } from '@/types';
import CategorySelector from '@/components/CategorySelector';
import TagAutocomplete from '@/components/TagAutocomplete';
import { SuccessModal } from '@/components/SuccessModal';

const newsSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  author: z.string().min(1, 'Autor é obrigatório'),
  tags: z.string().optional(),
  slug: z.string().min(1, 'Slug é obrigatório'),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  featuredPosition: z.number().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    formState: { errors, isDirty }
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
  });

  // Combine form dirty state with manual tracking
  const isFormDirty = isDirty || hasUnsavedChanges;

  const watchedTitle = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !isDirty) {
      const slug = slugify(watchedTitle);
      setValue('slug', slug);
    }
  }, [watchedTitle, setValue, isDirty]);

  // Load news and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const newsData = await NewsService.getNewsById(resolvedParams.id);

        if (!newsData) {
          alert('Notícia não encontrada');
          router.push('/admin/editor');
          return;
        }

        setNews(newsData);
        setCoverImageUrl(newsData.coverImage);
        setEditorContent(newsData.content);

        // Populate form with existing data
        setValue('title', newsData.title);
        setValue('subtitle', newsData.subtitle || '');
        setValue('content', newsData.content);
        setValue('categoryId', newsData.categoryId);
        setValue('author', newsData.author);
        setValue('tags', Array.isArray(newsData.tags) ? newsData.tags.join(', ') : newsData.tags || '');
        setValue('slug', newsData.slug);
        setValue('isPublished', newsData.isPublished);
        setValue('isFeatured', newsData.isFeatured);
        setValue('featuredPosition', newsData.featuredPosition || undefined);
        setValue('metaDescription', newsData.metaDescription || '');
        setValue('metaKeywords', newsData.metaKeywords?.join(', ') || '');

      } catch (error) {
        console.error('Error loading data:', error);
        alert('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, router, setValue]);

  const onSubmit = async (data: NewsFormValues) => {
    if (!coverImageUrl) {
      alert('Por favor, faça upload de uma imagem de capa');
      return;
    }

    setIsSaving(true);
    
    try {
      // Create tags automatically if tags field has content
      let tagIds: string[] = [];
      if (data.tags && data.tags.trim()) {
        tagIds = await TagService.createTagsFromString(data.tags);
      }
      
      const updateData = {
        ...data,
        tagIds: tagIds
      };
      
      await NewsService.updateNews(resolvedParams.id, updateData as NewsFormData, coverImageUrl);
      
      if (data.isPublished) {
        setSuccessMessage('Sua notícia foi atualizada e publicada com sucesso! Ela já está disponível no site.');
        setShowSuccessModal(true);
      } else {
        setSuccessMessage('Notícia atualizada com sucesso! Você pode continuar editando ou publicar quando estiver pronto.');
        setShowSuccessModal(true);
        // Reset unsaved changes state
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Erro ao atualizar notícia');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      await NewsService.deleteNews(resolvedParams.id);
      alert('Notícia excluída com sucesso!');
      router.push('/admin/editor');
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Erro ao excluir notícia');
    } finally {
      setIsDeleting(false);
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

  if (!news) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Notícia não encontrada</h1>
        <p className="text-gray-600 mb-6">A notícia que você está procurando não existe.</p>
        <Button onClick={() => router.push('/admin/editor')}>
          Voltar para Editor
        </Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Notícia</h1>
            <p className="text-gray-600">Atualize o conteúdo da matéria</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/noticia/${news.slug}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver no Site
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
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

      {/* News Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Criada em:</span>
              <p className="text-gray-600">
                {new Date(news.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Última atualização:</span>
              <p className="text-gray-600">
                {new Date(news.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Visualizações:</span>
              <p className="text-gray-600">{news.views}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Subtitle */}
            <Card>
              <CardHeader>
                <CardTitle>Subtítulo</CardTitle>
                <CardDescription>
                  Subtítulo ou resumo da notícia (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('subtitle')}
                  placeholder="Digite o subtítulo da notícia"
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
                {errors.content && (
                  <p className="text-red-500 text-sm mt-2">{errors.content.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem de Capa</CardTitle>
                <CardDescription>
                  Imagem principal da notícia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onImageUploaded={handleImageUpload}
                  currentImage={coverImageUrl}
                  aspectRatio="video"
                />
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
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* Author */}
                <div>
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    {...register('author')}
                    placeholder="Nome do autor"
                  />
                  {errors.author && (
                    <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <TagAutocomplete
                    value={watch('tags') || ''}
                    onChange={handleTagsChange}
                    placeholder="Digite as tags separadas por vírgula..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separe as tags por vírgula. Tags existentes aparecerão como sugestão.
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">URL (Slug)</Label>
                  <Input
                    {...register('slug')}
                    placeholder="url-da-noticia"
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                  )}
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
                    <Label htmlFor="isPublished">Publicado</Label>
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
