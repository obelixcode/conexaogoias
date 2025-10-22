'use client';

import { useEffect } from 'react';
import { Eye } from 'lucide-react';
import { useViews } from '@/hooks/useViews';

interface ViewsCounterProps {
  newsId: string;
  className?: string;
}

export function ViewsCounter({ newsId, className = '' }: ViewsCounterProps) {
  const { views, uniqueViews, isLoading, incrementView } = useViews(newsId);

  useEffect(() => {
    // Incrementar visualização quando o componente for montado
    incrementView();
  }, [incrementView]);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-1 text-gray-500 ${className}`}>
        <Eye className="h-4 w-4" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 text-gray-500 ${className}`}>
      <Eye className="h-4 w-4" />
      <span className="text-sm">
        {views.toLocaleString('pt-BR')} visualizações
      </span>
    </div>
  );
}
