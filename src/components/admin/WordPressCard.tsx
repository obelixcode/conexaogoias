import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WordPressCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

export function WordPressCard({ 
  children, 
  className = '', 
  title, 
  description, 
  footer 
}: WordPressCardProps) {
  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg shadow-sm",
      className
    )}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}
