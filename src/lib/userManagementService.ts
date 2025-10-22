import { 
  createUserWithEmailAndPassword,
  updatePassword,
  updateEmail,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { AdminUser, UserRole } from '@/types/user';

const USERS_COLLECTION = 'users';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export class UserManagementService {
  // List all users from Firestore
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'))
      );
      
      const users: AdminUser[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || null,
          avatar: data.avatar || null
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Erro ao buscar usuários');
    }
  }

  // Create a new user
  static async createUser(userData: CreateUserData): Promise<string> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const user = userCredential.user;
      
      // Create user document in Firestore
      const userDoc: Omit<AdminUser, 'uid'> = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: undefined,
        avatar: undefined
      };
      
      await setDoc(doc(db, USERS_COLLECTION, user.uid), userDoc);
      
      return user.uid;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Erro ao criar usuário');
    }
  }

  // Update user data
  static async updateUser(uid: string, userData: UpdateUserData): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }
      
      // Prepare update data
      const updateData: Partial<AdminUser> = {
        ...userData,
        updatedAt: new Date()
      };
      
      // Update Firestore document
      await updateDoc(userRef, updateData);
      
      // If email or password needs to be updated, handle Firebase Auth
      if (userData.email || userData.password) {
        // Note: In a real app, you'd need to re-authenticate the user
        // or use Firebase Admin SDK for this operation
        console.warn('Email/password updates require Firebase Admin SDK or user re-authentication');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }

  // Delete user
  static async deleteUser(uid: string): Promise<void> {
    try {
      // Delete from Firestore first
      await deleteDoc(doc(db, USERS_COLLECTION, uid));
      
      // Note: Deleting from Firebase Auth requires Firebase Admin SDK
      // or the user to be signed in
      console.warn('User deleted from Firestore. Firebase Auth deletion requires Admin SDK');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Erro ao excluir usuário');
    }
  }

  // Get user by ID
  static async getUserById(uid: string): Promise<AdminUser | null> {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || null,
        avatar: data.avatar || null
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  // Toggle user status
  static async toggleUserStatus(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }
      
      const currentStatus = userDoc.data().isActive;
      
      await updateDoc(userRef, {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw new Error('Erro ao alterar status do usuário');
    }
  }

  // Search users
  static async searchUsers(searchTerm: string): Promise<AdminUser[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
      
      const users: AdminUser[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const user: AdminUser = {
          uid: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || null,
          avatar: data.avatar || null
        };
        
        // Filter by search term
        if (
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          users.push(user);
        }
      });
      
      return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Erro ao buscar usuários');
    }
  }
}
