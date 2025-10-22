export type UserRole = 'admin' | 'editor' | 'super_admin';

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  avatar?: string; // Firebase Storage URL
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  editorUsers: number;
  recentLogins: AdminUser[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
}
