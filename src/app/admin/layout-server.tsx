import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import AdminLayoutClient from './layout-client';

interface AdminLayoutServerProps {
  children: React.ReactNode;
}

export default async function AdminLayoutServer({ children }: AdminLayoutServerProps) {
  const user = await getAuthUser();
  
  if (!user) {
    redirect('/admin/login');
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
