import { RoadmapRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Calendar, User, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: RoadmapRequest;
  onClick: () => void;
  className?: string;
}

export function RequestCard({ request, onClick, className }: RequestCardProps) {
  // Strip HTML tags for preview
  const getTextPreview = (html: string, maxLength: number = 120) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4',
        getPriorityBorderColor(request.priority),
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
            {request.title}
          </CardTitle>
          <div className="flex flex-col gap-1">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Description preview */}
        {request.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {request.description}
          </p>
        )}
        
        {/* Content preview */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-3">
          {getTextPreview(request.content)}
        </p>
        
        {/* Cover image preview */}
        {request.coverImage && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={request.coverImage} 
              alt={request.title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        
        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{request.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(request.createdAt, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-blue-600">
            <Eye className="h-3 w-3" />
            <span>Ver detalhes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
