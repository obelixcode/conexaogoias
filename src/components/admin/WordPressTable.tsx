import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WordPressTableProps {
  children: ReactNode;
  className?: string;
}

interface WordPressTableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface WordPressTableBodyProps {
  children: ReactNode;
  className?: string;
}

interface WordPressTableRowProps {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
}

interface WordPressTableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

export function WordPressTable({ children, className = '' }: WordPressTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn(
        "w-full border-collapse bg-white border border-gray-200 rounded-lg",
        className
      )}>
        {children}
      </table>
    </div>
  );
}

export function WordPressTableHeader({ children, className = '' }: WordPressTableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      {children}
    </thead>
  );
}

export function WordPressTableBody({ children, className = '' }: WordPressTableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
}

export function WordPressTableRow({ 
  children, 
  className = '', 
  isSelected = false 
}: WordPressTableRowProps) {
  return (
    <tr className={cn(
      "hover:bg-gray-50 transition-colors",
      isSelected && "bg-blue-50",
      className
    )}>
      {children}
    </tr>
  );
}

export function WordPressTableCell({ 
  children, 
  className = '', 
  colSpan 
}: WordPressTableCellProps) {
  return (
    <td 
      className={cn(
        "px-6 py-4 text-sm text-gray-900",
        className
      )}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

export function WordPressTableHeaderCell({ 
  children, 
  className = '' 
}: { children: ReactNode; className?: string }) {
  return (
    <th className={cn(
      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      className
    )}>
      {children}
    </th>
  );
}
