'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminService } from '@/lib/adminService';
import { LoginCredentials } from '@/types';
import { getCurrentYear } from '@/utils/dateUtils';

export default function AdminLoginPage() {
  // Usar configurações padrão para evitar problemas de hidratação
  const siteName = 'Conexão Goiás';
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const currentYear = getCurrentYear();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Tentar autenticação básica primeiro
      const basicResponse = await fetch('/api/auth/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (basicResponse.ok) {
        const basicData = await basicResponse.json();
        console.log('✅ Login via sistema básico bem-sucedido');
        console.log('🔄 Redirecionando para dashboard...');
        
        // Pequeno delay para garantir que a sessão seja processada
        setTimeout(() => {
          router.replace('/admin/dashboard');
        }, 100);
        return;
      }

      // Se falhar, tentar Firebase Auth como fallback
      console.log('🔄 Tentando Firebase Auth como fallback...');
      const { user, idToken } = await AdminService.login(credentials);
      
      // Criar session cookie via API com dados do usuário
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idToken,
          userData: {
            uid: user.uid,
            email: user.email,
            name: user.name || 'Administrador'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão');
      }
      
      // Pequeno delay para garantir que a sessão seja processada
      setTimeout(() => {
        router.replace('/admin/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciais inválidas. Verifique se o usuário existe no sistema.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <a href="/" className="inline-block">
            <div className="text-4xl font-bold">
              <span className="text-blue-900">{siteName.toUpperCase()}</span>
              <span className="text-gray-500 text-lg">.com</span>
            </div>
          </a>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o painel de administração
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={credentials.email}
                    onChange={handleInputChange('email')}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={credentials.password}
                    onChange={handleInputChange('password')}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Voltar ao site
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© {currentYear} {siteName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}