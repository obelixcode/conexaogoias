'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsService } from '@/lib/settingsService';
import { SiteSettings, SiteSettingsFormData, DEFAULT_SETTINGS } from '@/types/settings';
import { WordPressNotice } from '@/components/admin/WordPressNotice';

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [formData, setFormData] = useState<SiteSettingsFormData>({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    contactEmail: '',
    adminEmail: '',
    phone1: '',
    phone2: '',
    address: '',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    whatsapp: '',
    twitterHandle: '',
    foundingYear: new Date().getFullYear()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [footerLogoPreview, setFooterLogoPreview] = useState<string>('');

  // Carregar configurações
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const currentSettings = await SettingsService.getSettings();
      setSettings(currentSettings);
      
      // Preencher formulário
      setFormData({
        siteName: currentSettings.siteName,
        siteDescription: currentSettings.siteDescription,
        siteUrl: currentSettings.siteUrl,
        contactEmail: currentSettings.contactEmail,
        adminEmail: currentSettings.adminEmail,
        phone1: currentSettings.phone1,
        phone2: currentSettings.phone2,
        address: currentSettings.address,
        facebook: currentSettings.socialMedia.facebook,
        twitter: currentSettings.socialMedia.twitter,
        instagram: currentSettings.socialMedia.instagram,
        youtube: currentSettings.socialMedia.youtube,
        whatsapp: currentSettings.socialMedia.whatsapp,
        twitterHandle: currentSettings.twitterHandle,
        foundingYear: currentSettings.foundingYear
      });

      if (currentSettings.faviconUrl) {
        setFaviconPreview(currentSettings.faviconUrl);
      }

      if (currentSettings.logoUrl) {
        setLogoPreview(currentSettings.logoUrl);
      }

      if (currentSettings.footerLogoUrl) {
        setFooterLogoPreview(currentSettings.footerLogoUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettingsFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleFooterLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFooterLogoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFooterLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFooterLogo = () => {
    setFooterLogoFile(null);
    setFooterLogoPreview('');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Validar dados obrigatórios
      if (!formData.siteName.trim()) {
        setMessage({ type: 'error', text: 'Nome do site é obrigatório' });
        return;
      }

      if (!formData.siteUrl.trim()) {
        setMessage({ type: 'error', text: 'URL do site é obrigatória' });
        return;
      }

      if (!SettingsService.isValidUrl(formData.siteUrl)) {
        setMessage({ type: 'error', text: 'URL do site inválida' });
        return;
      }

      if (!SettingsService.isValidEmail(formData.contactEmail)) {
        setMessage({ type: 'error', text: 'E-mail de contato inválido' });
        return;
      }

      if (!SettingsService.isValidEmail(formData.adminEmail)) {
        setMessage({ type: 'error', text: 'E-mail de admin inválido' });
        return;
      }

      // Preparar dados para salvar
      const settingsToSave: Partial<SiteSettings> = {
        siteName: formData.siteName.trim(),
        siteDescription: formData.siteDescription.trim(),
        siteUrl: formData.siteUrl.trim(),
        contactEmail: formData.contactEmail.trim(),
        adminEmail: formData.adminEmail.trim(),
        phone1: formData.phone1.trim(),
        phone2: formData.phone2.trim(),
        address: formData.address.trim(),
        socialMedia: {
          facebook: formData.facebook.trim(),
          twitter: formData.twitter.trim(),
          instagram: formData.instagram.trim(),
          youtube: formData.youtube.trim(),
          whatsapp: formData.whatsapp.trim()
        },
        twitterHandle: formData.twitterHandle.trim(),
        foundingYear: formData.foundingYear
      };

      // Upload do favicon se houver arquivo novo
      if (faviconFile) {
        const faviconUrl = await SettingsService.updateFavicon(faviconFile);
        settingsToSave.faviconUrl = faviconUrl;
      }

      // Upload da logo se houver arquivo novo
      if (logoFile) {
        const logoUrl = await SettingsService.updateLogo(logoFile);
        settingsToSave.logoUrl = logoUrl;
      }

      // Upload da logo do footer se houver arquivo novo
      if (footerLogoFile) {
        const footerLogoUrl = await SettingsService.updateFooterLogo(footerLogoFile);
        settingsToSave.footerLogoUrl = footerLogoUrl;
      }

      // Salvar configurações
      await SettingsService.updateSettings(settingsToSave);
      
      // Atualizar estado local
      const updatedSettings = await SettingsService.getSettings();
      setSettings(updatedSettings);
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setFaviconFile(null);
      setLogoFile(null);
      setFooterLogoFile(null);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Site</h1>
          <p className="text-gray-600">Gerencie as configurações gerais do portal</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Mensagens */}
      {message && (
        <WordPressNotice type={message.type}>
          {message.text}
        </WordPressNotice>
      )}

      {/* Formulário */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Configure o nome, descrição e URL do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Nome do Site *</Label>
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    placeholder="Ex: Conexão Goiás"
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">URL do Site *</Label>
                  <Input
                    id="siteUrl"
                    value={formData.siteUrl}
                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                    placeholder="https://conexaogoias.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Descrição do Site</Label>
                <Textarea
                  id="siteDescription"
                  value={formData.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  placeholder="Descrição do portal de notícias"
                  rows={3}
                />
              </div>

              {/* Favicon */}
              <div>
                <Label htmlFor="favicon">Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="favicon"
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconChange}
                      className="w-auto"
                    />
                    {isUploadingFavicon && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                  {faviconPreview && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={faviconPreview} 
                        alt="Favicon preview" 
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-sm text-gray-600">Preview</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Formatos aceitos: PNG, ICO, JPG. Tamanho máximo: 1MB
                </p>
              </div>

              {/* Logo do Header */}
              <div>
                <Label htmlFor="logo">Logo do Header</Label>
                <div className="flex items-start space-x-4">
                  <div>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Largura: 100px (altura automática)
                    </p>
                  </div>
                  {logoPreview && (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        className="w-[100px] h-auto object-contain"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB
                </p>
              </div>

              {/* Logo do Footer */}
              <div>
                <Label htmlFor="footerLogo">Logo do Footer</Label>
                <div className="flex items-start space-x-4">
                  <div>
                    <Input
                      id="footerLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleFooterLogoChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Largura: 100px (altura automática)
                    </p>
                  </div>
                  {footerLogoPreview && (
                    <div className="relative">
                      <img 
                        src={footerLogoPreview} 
                        alt="Footer Logo Preview" 
                        className="w-[100px] h-auto object-contain"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={removeFooterLogo}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Contato */}
        <TabsContent value="contato" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Configure e-mails, telefones e endereço
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">E-mail de Contato *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="contato@conexaogoias.com"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">E-mail de Admin *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                    placeholder="admin@conexaogoias.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone1">Telefone 1</Label>
                  <Input
                    id="phone1"
                    value={formData.phone1}
                    onChange={(e) => handleInputChange('phone1', e.target.value)}
                    placeholder="(62) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="phone2">Telefone 2</Label>
                  <Input
                    id="phone2"
                    value={formData.phone2}
                    onChange={(e) => handleInputChange('phone2', e.target.value)}
                    placeholder="(62) 3333-3333"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua das Flores, 123&#10;Centro - Goiânia/GO"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Redes Sociais */}
        <TabsContent value="redes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Configure os links das redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/conexaogoias"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/conexaogoias"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/conexaogoias"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.youtube}
                    onChange={(e) => handleInputChange('youtube', e.target.value)}
                    placeholder="https://youtube.com/@conexaogoias"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="https://wa.me/5562999999999"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba SEO */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de SEO</CardTitle>
              <CardDescription>
                Configure informações para otimização de busca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitterHandle">Handle do Twitter</Label>
                  <Input
                    id="twitterHandle"
                    value={formData.twitterHandle}
                    onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                    placeholder="@conexaogoias"
                  />
                </div>
                <div>
                  <Label htmlFor="foundingYear">Ano de Fundação</Label>
                  <Input
                    id="foundingYear"
                    type="number"
                    value={formData.foundingYear}
                    onChange={(e) => handleInputChange('foundingYear', parseInt(e.target.value) || new Date().getFullYear())}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
