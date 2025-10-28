'use client';

import { useState, useEffect } from 'react';
import { ClientHeader } from '@/components/ClientHeader';
import { ClientFooterWrapper } from '@/components/ClientFooterWrapper';
import { CategoryService } from '@/lib/categoryService';
import { Category } from '@/types';

export function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      console.log('[PublicLayoutClient] Iniciando carregamento de categorias...');
      try {
        const cats = await CategoryService.getAllCategories();
        console.log('[PublicLayoutClient] Categorias carregadas:', cats);
        const activeCats = cats.filter(c => c.isActive);
        console.log('[PublicLayoutClient] Categorias ativas:', activeCats);
        setCategories(activeCats);
      } catch (error) {
        console.error('[PublicLayoutClient] Erro ao carregar categorias:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" suppressHydrationWarning>
      {isLoading ? (
        <div className="h-16 bg-gray-200 animate-pulse"></div>
      ) : (
        <ClientHeader categories={categories} />
      )}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <ClientFooterWrapper />
    </div>
  );
}
