import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ptBR });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Agora às ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Ontem às ${format(dateObj, 'HH:mm')}`;
  }
  
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: ptBR 
  });
}

export function formatNewsDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Agora, ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Ontem, ${format(dateObj, 'HH:mm')}`;
  }
  
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatLongDate(date: Date | string): string {
  return formatDate(date, 'dd \'de\' MMMM \'de\' yyyy');
}

export function formatShortDate(date: Date | string): string {
  return formatDate(date, 'dd/MM/yy');
}

export function formatTime(date: Date | string): string {
  return formatDate(date, 'HH:mm');
}

export function isRecent(date: Date | string, hours: number = 24): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  return diffInHours <= hours;
}
