import { headers } from 'next/headers';
import { getBasicAuthUser, BasicUser } from '@/lib/basic-auth';
import { AuthUser } from '@/types/user';
import AdminLayoutClient from './layout-client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Função para converter BasicUser para AuthUser de forma segura
function convertBasicUserToAuthUser(basicUser: BasicUser | null): AuthUser | null {
  if (!basicUser) return null;
  
  return {
    uid: basicUser.uid,
    email: basicUser.email,
    name: basicUser.name,
    role: basicUser.role, // Agora são compatíveis
    isActive: basicUser.isActive,
    avatar: undefined // BasicUser não tem avatar
  };
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  
  // Skip auth check for login page
  if (pathname === '/admin/login') {
    return <AdminLayoutClient user={null}>{children}</AdminLayoutClient>;
  }
  
  // Get user data for layout using basic auth
  // The middleware already handles redirects
  let user = null;
  try {
    user = await getBasicAuthUser();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    // Don't redirect here, let middleware handle it
  }

  // Converter BasicUser para AuthUser
  const authUser = convertBasicUserToAuthUser(user);
  
  return <AdminLayoutClient user={authUser}>{children}</AdminLayoutClient>;
}