'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { Save, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { RoadmapService } from '@/lib/roadmapService';
import { RoadmapFormData, RoadmapPriority, RoadmapRequest } from '@/types';
import { SuccessModal } from '@/components/SuccessModal';

// Importar Editor dinamicamente sem SSR para evitar erros de hidratação
const Editor = dynamic(() => import('@/components/Editor').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg min-h-[300px] p-4 flex items-center justify-center">
      <div className="text-gray-500 text-sm">Carregando editor...</div>
    </div>
  ),
});

const roadmapSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  priority: z.enum(['high', 'medium', 'low']),
  coverImage: z.string().optional(),
});

type RoadmapFormValues = z.infer<typeof roadmapSchema>;

interface EditRoadmapPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditRoadmapPage({ params }: EditRoadmapPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<RoadmapRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapSchema),
  });

  // Load request data
  useEffect(() => {
    const loadData = async () => {
      try {
        const requestData = await RoadmapService.getRequestById(resolvedParams.id);

        if (!requestData) {
          alert('Solicitação não encontrada');
          router.push('/admin/roadmap');
          return;
        }

        setRequest(requestData);
        setCoverImageUrl(requestData.coverImage || '');
        setEditorContent(requestData.content);

        // Populate form with existing data
        setValue('title', requestData.title);
        setValue('description', requestData.description || '');
        setValue('content', requestData.content);
        setValue('priority', requestData.priority);
        setValue('coverImage', requestData.coverImage || '');

      } catch (error) {
        console.error('Error loading data:', error);
        alert('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, router, setValue]);

  const onSubmit = async (data: RoadmapFormValues) => {
    setIsSaving(true);
    
    try {
      const formData: RoadmapFormData = {
        title: data.title,
        description: data.description,
        content: data.content,
        priority: data.priority,
        coverImage: coverImageUrl,
      };

      await RoadmapService.updateRequest(resolvedParams.id, formData);
      
      setSuccessMessage('Solicitação atualizada com sucesso!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating roadmap request:', error);
      alert('Erro ao atualizar solicitação');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      await RoadmapService.deleteRequest(resolvedParams.id);
      alert('Solicitação excluída com sucesso!');
      router.push('/admin/roadmap');
    } catch (error) {
      console.error('Error deleting roadmap request:', error);
      alert('Erro ao excluir solicitação');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setCoverImageUrl(url);
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setValue('content', content);
  };

  const handlePriorityChange = (priority: RoadmapPriority) => {
    setValue('priority', priority);
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

  if (!request) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Solicitação não encontrada</h1>
        <p className="text-gray-600 mb-6">A solicitação que você está procurando não existe.</p>
        <Button onClick={() => router.push('/admin/roadmap')}>
          Voltar para RoadMap
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Solicitação</h1>
            <p className="text-gray-600">Atualize o conteúdo da solicitação</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
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
            disabled={isSaving || !isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Request Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Criada em:</span>
              <p className="text-gray-600">
                {new Date(request.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Última atualização:</span>
              <p className="text-gray-600">
                {new Date(request.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Autor:</span>
              <p className="text-gray-600">{request.authorName}</p>
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
                  Título principal da solicitação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  {...register('title')}
                  placeholder="Digite o título da solicitação"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
                <CardDescription>
                  Descrição curta da solicitação (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('description')}
                  placeholder="Digite uma descrição resumida"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
                <CardDescription>
                  Detalhes completos da solicitação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Editor
                  content={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Descreva detalhadamente a melhoria solicitada..."
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
                  Imagem ilustrativa (opcional)
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

            {/* Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Prioridade</CardTitle>
                <CardDescription>
                  Nível de prioridade da solicitação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={watch('priority')}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Alta Prioridade
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Média Prioridade
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Baixa Prioridade
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            {isDirty && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{watch('title') || 'Título da solicitação'}</h3>
                    {watch('description') && (
                      <p className="text-sm text-gray-600">{watch('description')}</p>
                    )}
                    <div className="text-xs">
                      <span className="font-medium">Prioridade:</span>{' '}
                      <span className="capitalize">
                        {watch('priority') === 'high' && 'Alta'}
                        {watch('priority') === 'medium' && 'Média'}
                        {watch('priority') === 'low' && 'Baixa'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso!"
        message={successMessage}
        redirectTo="/admin/roadmap"
      />
    </div>
  );
}
