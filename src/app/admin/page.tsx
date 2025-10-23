import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';

export default async function AdminPage() {
  const user = await getAuthUser();
  
  if (user) {
    // Usuário logado - redirecionar para dashboard
    redirect('/admin/dashboard');
  } else {
    // Usuário não logado - redirecionar para login
    redirect('/admin/login');
  }
}
