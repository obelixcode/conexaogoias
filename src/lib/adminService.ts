import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AdminUser, AuthUser, LoginCredentials, UserRole } from '@/types';

const USERS_COLLECTION = 'users';

export class AdminService {
  // Login admin user
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; idToken: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado no sistema');
      }
      
      const userData = userDoc.data() as AdminUser;
      
      if (!userData.isActive) {
        throw new Error('Usuário desativado');
      }
      
      // Update last login
      await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
        lastLoginAt: new Date()
      });
      
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
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Erro ao fazer login. Verifique suas credenciais.');
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
