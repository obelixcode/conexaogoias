'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há cookie de sessão
    const adminSession = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin-session='));

    if (adminSession) {
      try {
        const sessionData = JSON.parse(adminSession.split('=')[1]);
        setUser(sessionData);
      } catch (error) {
        console.error('Erro ao parsear sessão:', error);
        // Remove cookie inválido
        document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Se estiver logado, redireciona para dashboard
        router.push('/admin/dashboard');
      } else {
        // Se não estiver logado, redireciona para login
        router.push('/admin/login');
      }
    }
  }, [user, loading, router]);

  // Mostra loading enquanto verifica autenticação
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
