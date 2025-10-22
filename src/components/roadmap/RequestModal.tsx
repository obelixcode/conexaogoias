'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoadmapRequest, RoadmapStatusChange, RoadmapStatus } from '@/types';
import { RoadmapService } from '@/lib/roadmapService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { 
  Calendar, 
  User, 
  Clock, 
  ChevronRight, 
  CheckCircle, 
  PlayCircle, 
  Circle,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUser } from '@/contexts/UserContext';

interface RequestModalProps {
  request: RoadmapRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const statusOptions = [
  { value: 'open' as RoadmapStatus, label: 'Aberto', icon: Circle, color: 'text-blue-600' },
  { value: 'in_progress' as RoadmapStatus, label: 'Em Andamento', icon: PlayCircle, color: 'text-orange-600' },
  { value: 'completed' as RoadmapStatus, label: 'Concluído', icon: CheckCircle, color: 'text-green-600' },
];

export function RequestModal({ request, isOpen, onClose, onStatusChange }: RequestModalProps) {
  const { user } = useUser();
  const [timeline, setTimeline] = useState<RoadmapStatusChange[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadTimeline = useCallback(async () => {
    if (!request) return;
    
    setIsLoadingTimeline(true);
    try {
      const timelineData = await RoadmapService.getStatusTimeline(request.id);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setIsLoadingTimeline(false);
    }
  }, [request]);

  useEffect(() => {
    if (request && isOpen) {
      loadTimeline();
    }
  }, [request, isOpen, loadTimeline]);

  const handleStatusChange = async (newStatus: RoadmapStatus) => {
    if (!request || !user) return;

    setIsUpdatingStatus(true);
    try {
      await RoadmapService.updateStatus(
        request.id, 
        newStatus, 
        user.uid, 
        user.name || user.email || 'Usuário'
      );
      
      onStatusChange?.();
      await loadTimeline(); // Reload timeline
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!request) return null;

  const getStatusIcon = (status: RoadmapStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.icon : Circle;
  };

  const getStatusColor = (status: RoadmapStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'text-gray-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {request.title}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-4">
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {request.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Descrição</h3>
              <p className="text-gray-700">{request.description}</p>
            </div>
          )}

          {/* Cover Image */}
          {request.coverImage && (
            <div>
              <img 
                src={request.coverImage} 
                alt={request.title}
                className="w-full max-h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Conteúdo</h3>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: request.content }}
            />
          </div>

          {/* Status Change Actions */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Alterar Status</h3>
            <div className="flex gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isCurrentStatus = request.status === option.value;
                const isDisabled = isCurrentStatus || isUpdatingStatus;
                
                return (
                  <Button
                    key={option.value}
                    variant={isCurrentStatus ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(option.value)}
                    disabled={isDisabled}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Histórico de Status</h3>
            {isLoadingTimeline ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando histórico...</p>
              </div>
            ) : timeline.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum histórico disponível</p>
            ) : (
              <div className="space-y-4">
                {timeline.map((change, index) => {
                  const Icon = getStatusIcon(change.newStatus);
                  const isLast = index === timeline.length - 1;
                  
                  return (
                    <div key={change.id} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full bg-gray-100 ${getStatusColor(change.newStatus)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!isLast && (
                          <div className="w-px h-8 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      
                      {/* Timeline content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{change.userName}</span>
                          <span className="text-sm text-gray-500">
                            {change.oldStatus === change.newStatus 
                              ? 'criou a solicitação'
                              : `alterou de ${statusOptions.find(s => s.value === change.oldStatus)?.label} para ${statusOptions.find(s => s.value === change.newStatus)?.label}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(change.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>
                              {formatDistanceToNow(change.timestamp, { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                        </div>
                        {change.comment && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            &ldquo;{change.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Request Info */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Criado por:</span>
                <span className="font-medium">{request.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Criado em:</span>
                <span className="font-medium">
                  {format(request.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Última atualização:</span>
                <span className="font-medium">
                  {format(request.updatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
