import { RoadmapStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RoadmapStatus;
  className?: string;
}

const statusConfig = {
  open: {
    label: 'Aberto',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '📋'
  },
  in_progress: {
    label: 'Em Andamento',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '⚡'
  },
  completed: {
    label: 'Concluído',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border',
        config.className,
        className
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
