'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapRequest, RoadmapStatus, RoadmapStats } from '@/types';
import { RoadmapService } from '@/lib/roadmapService';
import { RequestCard } from '@/components/roadmap/RequestCard';
import { RequestModal } from '@/components/roadmap/RequestModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Target, 
  PlayCircle, 
  CheckCircle, 
  Circle,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { Skeleton } from '@/components/LoadingSkeleton';
import { useUser } from '@/contexts/UserContext';

export default function RoadmapPage() {
  const router = useRouter();
  const { user } = useUser();
  const [requests, setRequests] = useState<RoadmapRequest[]>([]);
  const [stats, setStats] = useState<RoadmapStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RoadmapRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Carregando dados do roadmap...');
      console.log('👤 Usuário atual:', user);
      
      const [requestsData, statsData] = await Promise.all([
        RoadmapService.getAllRequests(),
        RoadmapService.getStats()
      ]);
      
      console.log('✅ Dados carregados com sucesso:', { requests: requestsData.length, stats: statsData });
      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error loading roadmap data:', error);
      alert('Erro ao carregar dados do roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestClick = (request: RoadmapRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusChange = () => {
    // Reload data when status changes
    loadData();
  };

  const getRequestsByStatus = (status: RoadmapStatus) => {
    return requests.filter(request => request.status === status);
  };

  const getStatusIcon = (status: RoadmapStatus) => {
    switch (status) {
      case 'open': return Circle;
      case 'in_progress': return PlayCircle;
      case 'completed': return CheckCircle;
      default: return Circle;
    }
  };

  const getStatusColor = (status: RoadmapStatus) => {
    switch (status) {
      case 'open': return 'text-blue-600';
      case 'in_progress': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RoadMap</h1>
            <p className="text-gray-600">Gerencie as solicitações de melhorias</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-32 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RoadMap</h1>
          <p className="text-gray-600">Gerencie as solicitações de melhorias</p>
        </div>
        
        <Button onClick={() => window.location.href = '/admin/roadmap/new'}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertas</CardTitle>
              <Circle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <PlayCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.in_progress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Priority Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estatísticas por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Alta</Badge>
                <span className="text-sm text-gray-600">{stats.byPriority.high} solicitações</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Média</Badge>
                <span className="text-sm text-gray-600">{stats.byPriority.medium} solicitações</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">Baixa</Badge>
                <span className="text-sm text-gray-600">{stats.byPriority.low} solicitações</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Tabs */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open" className="flex items-center gap-2">
            <Circle className="h-4 w-4" />
            Aberto ({stats?.open || 0})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Em Andamento ({stats?.in_progress || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Concluído ({stats?.completed || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getRequestsByStatus('open').length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação aberta</h3>
                <p className="text-gray-600 mb-4">Todas as solicitações estão sendo trabalhadas ou foram concluídas.</p>
                <Button onClick={() => window.location.href = '/admin/roadmap/new'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Solicitação
                </Button>
              </div>
            ) : (
              getRequestsByStatus('open').map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleRequestClick(request)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getRequestsByStatus('in_progress').length === 0 ? (
              <div className="col-span-full text-center py-12">
                <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação em andamento</h3>
                <p className="text-gray-600">Não há solicitações sendo trabalhadas no momento.</p>
              </div>
            ) : (
              getRequestsByStatus('in_progress').map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleRequestClick(request)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getRequestsByStatus('completed').length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação concluída</h3>
                <p className="text-gray-600">As solicitações concluídas aparecerão aqui.</p>
              </div>
            ) : (
              getRequestsByStatus('completed').map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleRequestClick(request)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Modal */}
      <RequestModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
