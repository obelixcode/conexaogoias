'use client';

import { ReactNode, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordPressNoticeProps {
  children: ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function WordPressNotice({ 
  children, 
  type = 'info', 
  dismissible = false,
  onDismiss,
  className = '' 
}: WordPressNoticeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "border rounded-md p-4",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex">
        <div className="shrink-0">
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          <p className={cn("text-sm font-medium", config.textColor)}>
            {children}
          </p>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  config.textColor,
                  "hover:bg-opacity-20"
                )}
                onClick={handleDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
