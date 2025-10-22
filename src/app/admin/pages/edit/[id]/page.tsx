'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  FileText, 
  Settings,
  Globe,
  Lock,
  EyeOff
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { pageService, UpdatePageData } from '@/lib/services/PageService';

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'private';
  type: 'footer' | 'general';
  footerType?: 'privacy' | 'terms' | 'about' | 'contact' | 'custom';
  metaDescription?: string;
  seoTitle?: string;
}

const FOOTER_PAGE_TYPES = [
  { value: 'privacy', label: 'Política de Privacidade' },
  { value: 'terms', label: 'Termos de Uso' },
  { value: 'about', label: 'Sobre Nós' },
  { value: 'contact', label: 'Contato' },
  { value: 'custom', label: 'Página Personalizada' }
];

// Interface local para compatibilidade
interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'private';
  type: 'footer' | 'general';
  footerType?: 'privacy' | 'terms' | 'about' | 'contact' | 'custom';
  metaDescription?: string;
  seoTitle?: string;
}

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const [pageData, setPageData] = useState<PageData>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    type: 'footer',
    footerType: 'custom',
    metaDescription: '',
    seoTitle: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados da página
  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        
        const page = await pageService.getPageById(pageId);
        if (!page) {
          console.log('Page not found in Firestore, using mock data for development');
          // Dados mock para desenvolvimento quando não há dados no Firestore
          const mockPage = {
            id: pageId,
            title: 'Página de Exemplo',
            slug: 'pagina-exemplo',
            content: '<p>Este é um exemplo de conteúdo da página. Você pode editar este texto usando o editor de texto rico.</p><p>Use as ferramentas da barra superior para formatar o texto, adicionar links, imagens e muito mais.</p>',
            status: 'draft' as const,
            type: 'footer' as const,
            footerType: 'custom' as const,
            metaDescription: 'Descrição de exemplo para SEO',
            seoTitle: 'Título de exemplo para SEO'
          };
          
          setPageData({
            id: mockPage.id,
            title: mockPage.title,
            slug: mockPage.slug,
            content: mockPage.content,
            status: mockPage.status,
            type: mockPage.type,
            footerType: mockPage.footerType,
            metaDescription: mockPage.metaDescription,
            seoTitle: mockPage.seoTitle
          });
          return;
        }
        
        setPageData({
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status,
          type: page.type,
          footerType: page.footerType,
          metaDescription: page.metaDescription,
          seoTitle: page.seoTitle
        });
      } catch (error) {
        console.error('Error loading page:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!pageData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!pageData.slug.trim()) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(pageData.slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    if (!pageData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }

    if (pageData.type === 'footer' && !pageData.footerType) {
      newErrors.footerType = 'Tipo de página do rodapé é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Verificar se o slug já existe (excluindo a página atual)
      const isSlugAvailable = await pageService.isSlugAvailable(pageData.slug, pageId);
      if (!isSlugAvailable) {
        setErrors(prev => ({ ...prev, slug: 'Este slug já está sendo usado' }));
        setSaving(false);
        return;
      }

      const updateData: UpdatePageData = {
        id: pageId,
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content,
        status,
        type: pageData.type,
        footerType: pageData.footerType,
        metaDescription: pageData.metaDescription,
        seoTitle: pageData.seoTitle
      };
      
      await pageService.updatePage(updateData);
      
      // Redirecionar para a lista de páginas
      router.push('/admin/pages');
    } catch (error) {
      console.error('Erro ao salvar página:', error);
      setErrors(prev => ({ ...prev, general: 'Erro ao salvar página. Tente novamente.' }));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Globe className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <EyeOff className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'private':
        return 'Privado';
      default:
        return 'Rascunho';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <WordPressButton
              variant="secondary"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </WordPressButton>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carregando...</h1>
            </div>
          </div>
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

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <WordPressButton
              variant="secondary"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </WordPressButton>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Página não encontrada</h1>
            </div>
          </div>
        </div>
        <WordPressCard>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Página não encontrada</h3>
            <p className="text-gray-500 mb-4">
              A página que você está tentando editar não existe ou foi removida.
            </p>
            <WordPressButton onClick={() => router.push('/admin/pages')}>
              Voltar para Lista de Páginas
            </WordPressButton>
          </div>
        </WordPressCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <WordPressButton
            variant="secondary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </WordPressButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Página
            </h1>
            <p className="text-gray-600">
              {pageData.type === 'footer' ? 'Editar página do rodapé' : 'Editar página geral'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <WordPressButton
            variant="secondary"
            onClick={handlePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Editar' : 'Visualizar'}
          </WordPressButton>
          
          <WordPressButton
            variant="secondary"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Rascunho'}
          </WordPressButton>
          
          <WordPressButton
            onClick={() => handleSave('published')}
            disabled={saving}
          >
            <Globe className="h-4 w-4 mr-2" />
            {saving ? 'Publicando...' : 'Publicar'}
          </WordPressButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <WordPressCard>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Página *
                </label>
                <input
                  type="text"
                  value={pageData.title}
                  onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o título da página"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={pageData.slug}
                    onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="url-da-pagina"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={pageData.status}
                    onChange={(e) => {
                      const value = e.target.value as 'published' | 'draft' | 'private';
                      setPageData(prev => ({ ...prev, status: value }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Status da página"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="private">Privado</option>
                  </select>
                </div>
              </div>

              {pageData.type === 'footer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Página do Rodapé *
                  </label>
                  <select
                    value={pageData.footerType || ''}
                    onChange={(e) => {
                      const value = e.target.value as 'privacy' | 'terms' | 'about' | 'contact' | 'custom' | '';
                      setPageData(prev => ({ ...prev, footerType: value || undefined }));
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.footerType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-label="Tipo de página do rodapé"
                  >
                    <option value="">Selecione o tipo</option>
                    {FOOTER_PAGE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.footerType && (
                    <p className="mt-1 text-sm text-red-600">{errors.footerType}</p>
                  )}
                </div>
              )}
            </div>
          </WordPressCard>

          {/* Editor de Conteúdo */}
          <WordPressCard>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo da Página *
              </label>
              {previewMode ? (
                <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-white">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: pageData.content || '<p class="text-gray-500">Nenhum conteúdo para visualizar</p>' }}
                  />
                </div>
              ) : (
                <RichTextEditor
                  content={pageData.content}
                  onChange={(content) => setPageData(prev => ({ ...prev, content }))}
                  placeholder="Digite o conteúdo da página aqui..."
                />
              )}
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
              {errors.general && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}
            </div>
          </WordPressCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <WordPressCard>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status atual:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(pageData.status)}
                    <span className="text-sm font-medium">
                      {getStatusLabel(pageData.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm font-medium">
                    {pageData.type === 'footer' ? 'Página do Rodapé' : 'Página Geral'}
                  </span>
                </div>

                {pageData.footerType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categoria:</span>
                    <span className="text-sm font-medium">
                      {FOOTER_PAGE_TYPES.find(t => t.value === pageData.footerType)?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </WordPressCard>

          {/* SEO */}
          <WordPressCard>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                SEO
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título SEO
                  </label>
                  <input
                    type="text"
                    value={pageData.seoTitle}
                    onChange={(e) => setPageData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título para SEO (opcional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Descrição
                  </label>
                  <textarea
                    value={pageData.metaDescription}
                    onChange={(e) => setPageData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição para SEO (opcional)"
                  />
                </div>
              </div>
            </div>
          </WordPressCard>

          {/* Ações Rápidas */}
          <WordPressCard>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
              
              <div className="space-y-2">
                <WordPressButton
                  variant="secondary"
                  size="small"
                  className="w-full justify-start"
                  onClick={() => setPageData(prev => ({ ...prev, status: 'draft' }))}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Salvar como Rascunho
                </WordPressButton>
                
                <WordPressButton
                  variant="secondary"
                  size="small"
                  className="w-full justify-start"
                  onClick={() => setPageData(prev => ({ ...prev, status: 'private' }))}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Tornar Privado
                </WordPressButton>
                
                <WordPressButton
                  size="small"
                  className="w-full justify-start"
                  onClick={() => setPageData(prev => ({ ...prev, status: 'published' }))}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Publicar Agora
                </WordPressButton>
              </div>
            </div>
          </WordPressCard>
        </div>
      </div>
    </div>
  );
}
