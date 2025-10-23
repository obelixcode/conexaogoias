import { headers } from 'next/headers';
import { getBasicAuthUser } from '@/lib/basic-auth';
import AdminLayoutClient from './layout-client';

interface AdminLayoutProps {
  children: React.ReactNode;
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

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}