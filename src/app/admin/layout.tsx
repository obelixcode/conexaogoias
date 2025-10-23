import { headers } from 'next/headers';
import { getAuthUser } from '@/lib/auth-utils';
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
  
  const user = await getAuthUser();
  
  if (!user) {
    // Let the middleware handle the redirect
    return <AdminLayoutClient user={null}>{children}</AdminLayoutClient>;
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}