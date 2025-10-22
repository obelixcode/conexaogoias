import { RoadmapPriority } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: RoadmapPriority;
  className?: string;
}

const priorityConfig = {
  high: {
    label: 'Alta',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴'
  },
  medium: {
    label: 'Média',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡'
  },
  low: {
    label: 'Baixa',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢'
  }
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

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
