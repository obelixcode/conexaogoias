import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WordPressButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'link';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function WordPressButton({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className = '',
  asChild = false,
  ...buttonProps 
}: WordPressButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    tertiary: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    link: "bg-transparent text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500"
  };
  
  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
