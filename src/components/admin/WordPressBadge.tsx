import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WordPressBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  className?: string;
}

export function WordPressBadge({ 
  children, 
  variant = 'default', 
  size = 'small',
  className = '' 
}: WordPressBadgeProps) {
  const baseClasses = "inline-flex items-center font-medium rounded-full";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };
  
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-1 text-sm"
  };

  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
}
