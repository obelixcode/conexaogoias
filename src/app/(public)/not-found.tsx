'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, Newspaper, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/categoria/politica', label: 'Política', icon: TrendingUp },
    { href: '/categoria/esportes', label: 'Esportes', icon: Globe },
    { href: '/categoria/tecnologia', label: 'Tecnologia', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Conexão Goiás</span>
            </Link>
            <Button variant="outline" asChild>
              <Link href="/">Voltar ao Site</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-12">
            <div className="relative">
              <div className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 leading-none">
                404
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Oops! Página não encontrada
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A página que você está procurando não existe, foi movida ou você não tem permissão para acessá-la.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex rounded-lg shadow-lg overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar notícias, categorias..."
                  className="flex-1 px-6 py-4 text-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Button 
                  type="submit" 
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-none"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Navegação rápida
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <link.icon className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={handleGoBack}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="px-8 py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Link href="/">
                <Home className="h-5 w-5 mr-2" />
                Ir para Home
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-gray-500 mb-2">
              Ainda não encontrou o que procura?
            </p>
            <p className="text-sm text-gray-400">
              Entre em contato conosco ou explore nossas{' '}
              <Link href="/categoria" className="text-blue-600 hover:text-blue-700 underline">
                categorias
              </Link>{' '}
              de notícias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}