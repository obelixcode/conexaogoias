'use client';

import { Header } from './Header';
import { Category } from '@/types';

interface ClientHeaderProps {
  categories: Category[];
}

export function ClientHeader({ categories }: ClientHeaderProps) {
  // Adicionar categoria "Últimas" como primeira categoria do sistema
  const systemCategory: Category = {
    id: 'ultimas',
    name: 'Últimas',
    slug: 'ultimas',
    color: '#3B82F6', // Cor azul padrão
    description: 'Últimas notícias publicadas',
    order: 0, // Sempre primeira
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Combinar categoria do sistema + categorias do Firestore
  const allCategories = [systemCategory, ...categories];

  return <Header categories={allCategories} />;
}
