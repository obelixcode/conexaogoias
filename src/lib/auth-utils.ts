import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';
import { AuthUser } from '@/types/user';

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('__session')?.value;
    
    if (!session) {
      console.log('🔍 Nenhuma sessão encontrada');
      return null;
    }
    
    console.log('🔍 Verificando sessão...');
    const decodedClaims = await adminAuth().verifySessionCookie(session, true);
    console.log('✅ Sessão válida para:', decodedClaims.email);
    
    // Buscar dados do usuário no Firestore
    const userDoc = await adminAuth().getUser(decodedClaims.uid);
    const userData = userDoc.customClaims || {};
    
    console.log('✅ Dados do usuário obtidos:', userData);
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email!,
      name: userData.name || decodedClaims.name || 'Admin',
      role: userData.role || 'admin',
      isActive: userData.isActive !== false,
      avatar: userData.avatar || null,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
