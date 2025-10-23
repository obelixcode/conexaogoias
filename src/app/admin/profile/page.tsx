'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User, 
  Shield, 
  Save, 
  ArrowLeft, 
  Upload, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { WordPressCard } from '@/components/admin/WordPressCard';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { WordPressNotice } from '@/components/admin/WordPressNotice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminService } from '@/lib/adminService';
import { AdminUser } from '@/types/user';
import { StorageService } from '@/lib/storageService';
import { useUser } from '@/contexts/UserContext';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [userData, setUserData] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Load full user data
        const fullUserData = await AdminService.getAdminUser(user.uid);
        if (fullUserData) {
          setUserData(fullUserData);
          setFormData({
            name: fullUserData.name,
            email: fullUserData.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setAvatarPreview(fullUserData.avatar || '');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setMessage({ type: 'error', text: 'Erro ao carregar dados do usuário' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;

    try {
      setIsUploadingAvatar(true);
      const fileName = `avatar-${user.uid}-${Date.now()}.${avatarFile.name.split('.').pop()}`;
      const path = `avatars/${fileName}`;
      
      const url = await StorageService.uploadImage(avatarFile, path);
      
      // Update user avatar in Firestore
      await AdminService.updateAdminUser(user.uid, { avatar: url });
      
      setMessage({ type: 'success', text: 'Foto de perfil atualizada com sucesso!' });
      setAvatarFile(null);
      
      // Refresh user data globally
      await refreshUser();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Erro ao fazer upload da foto de perfil' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      setMessage(null);

      // Validate form
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: 'Nome é obrigatório' });
        return;
      }

      if (!formData.email.trim()) {
        setMessage({ type: 'error', text: 'Email é obrigatório' });
        return;
      }

      // Update basic info
      await AdminService.updateAdminUser(user.uid, {
        name: formData.name.trim(),
        email: formData.email.trim()
      });

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Nova senha e confirmação não coincidem' });
          return;
        }

        if (formData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'Nova senha deve ter pelo menos 6 caracteres' });
          return;
        }

        // Note: Password update would require Firebase Auth update
        // This is a simplified version - in production, you'd need to re-authenticate
        setMessage({ type: 'success', text: 'Perfil atualizado! (Nota: Alteração de senha requer re-autenticação)' });
      } else {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      }

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Refresh user data globally
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
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

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        </div>
        <WordPressNotice type="error">
          Usuário não encontrado. Faça login novamente.
        </WordPressNotice>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <WordPressButton
            variant="tertiary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </WordPressButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <WordPressNotice type={message.type}>
          {message.text}
        </WordPressNotice>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <WordPressCard title="Foto de Perfil" description="Atualize sua foto de perfil">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <Image 
                      src={avatarPreview} 
                      alt="Avatar" 
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {avatarFile ? 'Arquivo Selecionado' : 'Escolher Foto'}
                </label>
                
                {avatarFile && (
                  <WordPressButton
                    onClick={uploadAvatar}
                    disabled={isUploadingAvatar}
                    className="w-full mt-2"
                  >
                    {isUploadingAvatar ? 'Enviando...' : 'Salvar Foto'}
                  </WordPressButton>
                )}
              </div>
            </div>
          </WordPressCard>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <WordPressCard title="Informações Pessoais" description="Atualize suas informações básicas">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Role Info (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Função</Label>
                  <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 capitalize">{user.role}</span>
                  </div>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-700">
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder="Digite a nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirme a nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <WordPressButton
                  variant="secondary"
                  onClick={() => {
                    setFormData({
                      name: userData?.name || '',
                      email: userData?.email || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setMessage(null);
                  }}
                >
                  Cancelar
                </WordPressButton>
                
                <WordPressButton
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </WordPressButton>
              </div>
            </div>
          </WordPressCard>
        </div>
      </div>
    </div>
  );
}
