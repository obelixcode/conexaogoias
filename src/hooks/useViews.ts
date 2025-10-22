'use client';

import { useState, useEffect, useCallback } from 'react';
import { ViewsService } from '@/lib/viewsService';

interface UseViewsReturn {
  views: number;
  uniqueViews: number;
  isLoading: boolean;
  error: string | null;
  incrementView: () => Promise<void>;
}

export function useViews(newsId: string): UseViewsReturn {
  const [views, setViews] = useState(0);
  const [uniqueViews, setUniqueViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    // Gerar ID único para a sessão
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  const loadViews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const viewData = await ViewsService.getNewsViews(newsId);
      
      if (viewData) {
        setViews(viewData.views);
        setUniqueViews(viewData.uniqueViews);
      }
    } catch (err) {
      console.error('Error loading views:', err);
      setError('Erro ao carregar visualizações');
    } finally {
      setIsLoading(false);
    }
  }, [newsId]);

  const incrementView = useCallback(async () => {
    try {
      setError(null);
      
      // Verificar se já visualizou nesta sessão para evitar múltiplas contagens
      const hasViewed = sessionStorage.getItem(`viewed_${newsId}_${sessionId}`);
      if (hasViewed) {
        console.log('View already counted for this session');
        return;
      }
      
      await ViewsService.incrementView(newsId, sessionId);
      
      // Atualizar contadores localmente
      setViews(prev => prev + 1);
      setUniqueViews(prev => prev + 1);
      
      // Marcar como visualizado nesta sessão
      sessionStorage.setItem(`viewed_${newsId}_${sessionId}`, 'true');
      
      console.log('View incremented successfully');
    } catch (err) {
      console.error('Error incrementing view:', err);
      setError('Erro ao registrar visualização');
    }
  }, [newsId, sessionId]);

  useEffect(() => {
    loadViews();
  }, [loadViews]);

  return {
    views,
    uniqueViews,
    isLoading,
    error,
    incrementView
  };
}
