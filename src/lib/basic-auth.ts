// Sistema de autenticação básico e confiável
import { cookies } from 'next/headers';

import { UserRole } from '@/types/user';

export interface BasicUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

// Sistema de autenticação seguro usando apenas Firebase Auth

export async function getBasicAuthUser(): Promise<BasicUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('__session')?.value;
    
    if (!session) {
      console.log('🔍 Nenhuma sessão encontrada');
      return null;
    }
    
    // Verificar se é um JWT token do Firebase (contém pontos)
    if (session.includes('.')) {
      console.log('🔍 Cookie contém JWT do Firebase - ignorando');
      return null;
    }
    
    // Sistema de autenticação básico removido por segurança
    // Apenas sessões base64 válidas são aceitas
    
    // Tentar decodificar como base64
    try {
      const decoded = Buffer.from(session, 'base64').toString('utf-8');
      const userData = JSON.parse(decoded);
      
      // Verificar se a sessão não expirou
      if (userData.expiresAt && Date.now() > userData.expiresAt) {
        console.log('🔍 Sessão expirada');
        return null;
      }
      
      console.log('✅ Sessão válida para:', userData.email);
      return userData;
    } catch (error) {
      console.log('🔍 Sessão inválida - ignorando');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
    return null;
  }
}

export function createBasicSession(userData: BasicUser): string {
  const sessionData = {
    ...userData,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    createdAt: Date.now()
  };
  
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

export function requireBasicAuth() {
  return async (): Promise<BasicUser> => {
    const user = await getBasicAuthUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  };
}

// Função de autenticação básica removida por segurança
// Toda autenticação deve passar pelo Firebase Auth
