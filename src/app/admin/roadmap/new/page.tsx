'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { RoadmapService } from '@/lib/roadmapService';
import { RoadmapFormData, RoadmapPriority } from '@/types';
import { useUser } from '@/contexts/UserContext';
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

export default function NewRoadmapPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapSchema),
    defaultValues: {
      priority: 'medium',
    }
  });

  const onSubmit = async (data: RoadmapFormValues) => {
    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    setIsSaving(true);
    
    try {
      const formData: RoadmapFormData = {
        title: data.title,
        description: data.description,
        content: data.content,
        priority: data.priority,
        coverImage: coverImageUrl,
      };

      await RoadmapService.createRequest(
        formData,
        user.uid,
        user.name || user.email || 'Usuário'
      );
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating roadmap request:', error);
      alert('Erro ao criar solicitação');
    } finally {
      setIsSaving(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Nova Solicitação</h1>
            <p className="text-gray-600">Crie uma nova solicitação de melhoria</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || !isDirty}
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
        message="Sua solicitação foi criada com sucesso! Ela já está disponível no roadmap."
        redirectTo="/admin/roadmap"
      />
    </div>
  );
}
