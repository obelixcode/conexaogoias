import { db, storage } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'site';

export class SettingsService {
  // Buscar configurações do site
  static async getSettings(): Promise<SiteSettings> {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        return {
          ...DEFAULT_SETTINGS,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as SiteSettings;
      }
      
      // Se não existir, retorna configurações padrão
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Atualizar configurações do site
  static async updateSettings(settings: Partial<SiteSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      
      const updateData = {
        ...settings,
        updatedAt: new Date()
      };

      // Verificar se o documento existe
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        // Atualizar documento existente
        await updateDoc(settingsRef, updateData);
      } else {
        // Criar novo documento
        await setDoc(settingsRef, {
          ...DEFAULT_SETTINGS,
          ...updateData,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw new Error('Falha ao salvar configurações');
    }
  }

  // Upload do favicon
  static async uploadFavicon(file: File): Promise<string> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      // Validar tamanho (máximo 1MB)
      if (file.size > 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 1MB');
      }

      // Criar referência no storage
      const timestamp = Date.now();
      const fileName = `favicon-${timestamp}.${file.name.split('.').pop()}`;
      const faviconRef = ref(storage, `favicons/${fileName}`);

      // Upload do arquivo
      await uploadBytes(faviconRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(faviconRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload do favicon:', error);
      throw new Error('Falha ao fazer upload do favicon');
    }
  }

  // Deletar favicon antigo
  static async deleteFavicon(faviconUrl: string): Promise<void> {
    try {
      if (!faviconUrl) return;

      // Extrair o path do storage da URL
      const url = new URL(faviconUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      
      if (pathMatch) {
        const filePath = decodeURIComponent(pathMatch[1]);
        const faviconRef = ref(storage, filePath);
        await deleteObject(faviconRef);
      }
    } catch (error) {
      console.error('Erro ao deletar favicon antigo:', error);
      // Não lançar erro, pois não é crítico
    }
  }

  // Upload da logo
  static async uploadLogo(file: File): Promise<string> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 2MB');
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `logo_${timestamp}.${file.name.split('.').pop()}`;
      const logoRef = ref(storage, `logos/${fileName}`);

      // Upload do arquivo
      await uploadBytes(logoRef, file);

      // Obter URL de download
      const logoUrl = await getDownloadURL(logoRef);

      return logoUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      throw error;
    }
  }

  // Deletar logo antiga
  static async deleteLogo(logoUrl: string): Promise<void> {
    try {
      if (!logoUrl) return;

      // Extrair o path do storage da URL
      const url = new URL(logoUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      
      if (pathMatch) {
        const filePath = decodeURIComponent(pathMatch[1]);
        const logoRef = ref(storage, filePath);
        await deleteObject(logoRef);
      }
    } catch (error) {
      console.error('Erro ao deletar logo antiga:', error);
      // Não lançar erro, pois não é crítico
    }
  }

  // Atualizar apenas o favicon
  static async updateFavicon(file: File): Promise<string> {
    try {
      // Buscar configurações atuais
      const currentSettings = await this.getSettings();
      
      // Deletar favicon antigo se existir
      if (currentSettings.faviconUrl) {
        await this.deleteFavicon(currentSettings.faviconUrl);
      }

      // Upload do novo favicon
      const newFaviconUrl = await this.uploadFavicon(file);

      // Atualizar configurações com nova URL
      await this.updateSettings({
        faviconUrl: newFaviconUrl
      });

      return newFaviconUrl;
    } catch (error) {
      console.error('Erro ao atualizar favicon:', error);
      throw error;
    }
  }

  // Atualizar apenas a logo
  static async updateLogo(file: File): Promise<string> {
    try {
      // Buscar configurações atuais
      const currentSettings = await this.getSettings();
      
      // Deletar logo antiga se existir
      if (currentSettings.logoUrl) {
        await this.deleteLogo(currentSettings.logoUrl);
      }

      // Upload da nova logo
      const newLogoUrl = await this.uploadLogo(file);

      // Atualizar configurações com nova URL
      await this.updateSettings({
        logoUrl: newLogoUrl
      });

      return newLogoUrl;
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
      throw error;
    }
  }

  // Atualizar apenas a logo do footer
  static async updateFooterLogo(file: File): Promise<string> {
    try {
      // Buscar configurações atuais
      const currentSettings = await this.getSettings();
      
      // Deletar logo antiga se existir
      if (currentSettings.footerLogoUrl) {
        await this.deleteLogo(currentSettings.footerLogoUrl);
      }

      // Upload da nova logo
      const newFooterLogoUrl = await this.uploadLogo(file);

      // Atualizar configurações com nova URL
      await this.updateSettings({
        footerLogoUrl: newFooterLogoUrl
      });

      return newFooterLogoUrl;
    } catch (error) {
      console.error('Erro ao atualizar logo do footer:', error);
      throw error;
    }
  }

  // Validar URL
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validar e-mail
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar telefone brasileiro
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }
}
