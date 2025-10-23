import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AdminUser, AuthUser, LoginCredentials, UserRole } from '@/types';

const USERS_COLLECTION = 'users';

export class AdminService {
  // Login admin user
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; idToken: string }> {
    try {
      console.log('🔐 Tentando fazer login com:', credentials.email);
      console.log('🔧 Configurações do Firebase:', {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅' : '❌',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      });
      
      // Verificar se o Firebase está configurado corretamente
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.error('❌ NEXT_PUBLIC_FIREBASE_API_KEY não encontrada');
        throw new Error('Configuração do Firebase não encontrada. Verifique as variáveis de ambiente.');
      }

      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.error('❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID não encontrada');
        throw new Error('Project ID do Firebase não encontrado. Verifique as variáveis de ambiente.');
      }

      if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
        console.error('❌ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN não encontrada');
        throw new Error('Auth Domain do Firebase não encontrado. Verifique as variáveis de ambiente.');
      }

      // Verificar se não são valores placeholder
      const placeholderValues = ['123456789', '1:123456789:web:abcdef123456', 'your-api-key'];
      const hasPlaceholders = Object.values({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      }).some(value => placeholderValues.some(placeholder => value?.includes(placeholder)));

      if (hasPlaceholders) {
        console.error('❌ Configurações do Firebase contêm valores placeholder');
        console.error('🔧 Substitua os valores placeholder pelas credenciais reais do Firebase Console');
        throw new Error('Configurações do Firebase contêm valores placeholder. Use as credenciais reais do Firebase Console.');
      }
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const user = userCredential.user;
      console.log('✅ Usuário autenticado no Firebase Auth:', user.uid);
      
      const idToken = await user.getIdToken();
      console.log('✅ ID Token obtido');
      
      // Get user data from Firestore
      console.log('🔍 Buscando dados do usuário no Firestore...');
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
      
      if (!userDoc.exists()) {
        console.error('❌ Usuário não encontrado no Firestore');
        throw new Error('Usuário não encontrado no sistema. Verifique se o usuário foi criado corretamente.');
      }
      
      const userData = userDoc.data() as AdminUser;
      console.log('✅ Dados do usuário encontrados:', userData);
      
      if (!userData.isActive) {
        console.error('❌ Usuário desativado');
        throw new Error('Usuário desativado. Entre em contato com o administrador.');
      }
      
      // Update last login
      await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
        lastLoginAt: new Date()
      });
      
      console.log('✅ Login realizado com sucesso');
      
      return {
        user: {
          uid: user.uid,
          email: user.email!,
          name: userData.name,
          role: userData.role,
          isActive: userData.isActive,
          avatar: userData.avatar
        },
        idToken
      };
    } catch (error: unknown) {
      console.error('❌ Erro no login:', error);
      
      // Log adicional para debug em produção
      console.error('🔍 Debug info:', {
        email: credentials.email,
        hasPassword: !!credentials.password,
        firebaseConfig: {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'presente' : 'ausente'
        },
        timestamp: new Date().toISOString()
      });
      
      // Tratamento específico de erros do Firebase
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string; stack?: string };
        
        console.error('Código do erro:', firebaseError.code);
        console.error('Mensagem do erro:', firebaseError.message);
        console.error('Stack trace:', firebaseError.stack);
        
        if (firebaseError.code === 'auth/user-not-found') {
          console.error('👤 Usuário não encontrado no Firebase Auth');
          throw new Error('Usuário não encontrado. Verifique o email ou crie o usuário no Firebase Console.');
        } else if (firebaseError.code === 'auth/wrong-password') {
          console.error('🔒 Senha incorreta');
          throw new Error('Senha incorreta. Verifique sua senha.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          console.error('📧 Email inválido');
          throw new Error('Email inválido. Verifique o formato do email.');
        } else if (firebaseError.code === 'auth/invalid-credential') {
          console.error('🔐 Credenciais inválidas - possíveis causas:');
          console.error('   1. Usuário não existe no Firebase Auth');
          console.error('   2. Senha incorreta');
          console.error('   3. Configurações do Firebase incorretas');
          console.error('   4. Domínio não autorizado no Firebase Console');
          throw new Error('Credenciais inválidas. Verifique se o usuário existe no Firebase Auth e se o domínio está autorizado.');
        } else if (firebaseError.code === 'auth/too-many-requests') {
          console.error('🚫 Muitas tentativas de login');
          throw new Error('Muitas tentativas de login. Tente novamente mais tarde.');
        } else if (firebaseError.code === 'auth/network-request-failed') {
          console.error('🌐 Erro de rede');
          throw new Error('Erro de conexão. Verifique sua internet e se o Firebase está acessível.');
        } else if (firebaseError.code === 'auth/invalid-api-key') {
          console.error('🔑 Chave da API inválida');
          throw new Error('Chave da API inválida. Verifique as configurações do Firebase.');
        } else if (firebaseError.code === 'auth/project-not-found') {
          console.error('🏗️ Projeto não encontrado');
          throw new Error('Projeto não encontrado. Verifique as configurações do Firebase.');
        } else if (firebaseError.code === 'auth/unauthorized-domain') {
          console.error('🌍 Domínio não autorizado');
          throw new Error('Domínio não autorizado. Adicione o domínio em Authentication > Settings > Authorized domains no Firebase Console.');
        } else {
          console.error('❓ Erro desconhecido:', firebaseError.code);
          throw new Error(firebaseError.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
      } else {
        console.error('❓ Erro desconhecido:', error);
        throw new Error('Erro ao fazer login. Verifique suas credenciais.');
      }
    }
  }

  // Logout admin user
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      
      // Delete session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Erro ao fazer logout');
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        unsubscribe();
        
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
          
          if (!userDoc.exists()) {
            resolve(null);
            return;
          }
          
          const userData = userDoc.data() as AdminUser;
          
          if (!userData.isActive) {
            resolve(null);
            return;
          }
          
          resolve({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name,
            role: userData.role,
            isActive: userData.isActive,
            avatar: userData.avatar
          });
        } catch (error) {
          console.error('Get current user error:', error);
          resolve(null);
        }
      });
    });
  }

  // Create admin user (only for super admin)
  static async createAdminUser(userData: Omit<AdminUser, 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // This would typically require Firebase Admin SDK on the server
      // For now, we'll create a placeholder that would be handled by server-side functions
      throw new Error('Criação de usuários deve ser feita via Firebase Console ou server-side function');
    } catch (error) {
      console.error('Create admin user error:', error);
      throw new Error('Erro ao criar usuário administrador');
    }
  }

  // Update admin user
  static async updateAdminUser(uid: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      await updateDoc(doc(db, USERS_COLLECTION, uid), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update admin user error:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }

  // Get admin user by ID
  static async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return userDoc.data() as AdminUser;
    } catch (error) {
      console.error('Get admin user error:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  // Check if user has permission
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      'editor': 1,
      'admin': 2,
      'super_admin': 3
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  // Auth state listener
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
        
        if (!userDoc.exists()) {
          callback(null);
          return;
        }
        
        const userData = userDoc.data() as AdminUser;
        
        if (!userData.isActive) {
          callback(null);
          return;
        }
        
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name,
          role: userData.role,
          isActive: userData.isActive,
          avatar: userData.avatar
        });
      } catch (error) {
        console.error('Auth state change error:', error);
        callback(null);
      }
    });
  }
}
