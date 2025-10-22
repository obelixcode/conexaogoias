'use client';

import { Header } from './Header';
import { Category } from '@/types';

interface ClientHeaderProps {
  categories: Category[];
}

export function ClientHeader({ categories }: ClientHeaderProps) {
  return <Header categories={categories} />;
}
