// Re-export all utilities
export * from './formatDate';

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function extractTextFromHtml(html: string, maxLength?: number): string {
  const text = stripHtml(html);
  return maxLength ? truncateText(text, maxLength) : text;
}

// URL utilities
export function getAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getNewsUrl(slug: string): string {
  return `/noticia/${slug}`;
}

export function getCategoryUrl(slug: string): string {
  return `/categoria/${slug}`;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Array utilities
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Number utilities
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num);
}

export function formatViews(views: number): string {
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

export function getCategoryColorClass(hexColor: string): string {
  if (!hexColor) return 'category-link';
  
  // Normalize hex color
  const normalizedColor = hexColor.toUpperCase();
  
  // Map specific known colors to CSS classes
  const colorMap: { [key: string]: string } = {
    '#EF4444': 'category-link-red',      // Red
    '#F59E0B': 'category-link-yellow',   // Yellow/Orange
    '#10B981': 'category-link-green',    // Green
    '#3B82F6': 'category-link-blue',     // Blue
    '#8B5CF6': 'category-link-purple',   // Purple
    '#F97316': 'category-link-yellow',   // Orange
    '#84CC16': 'category-link-green',    // Lime
    '#06B6D4': 'category-link-blue',     // Cyan
    '#EC4899': 'category-link-purple',   // Pink
    '#6B7280': 'category-link',          // Gray
  };
  
  // Check exact match first
  if (colorMap[normalizedColor]) {
    return colorMap[normalizedColor];
  }
  
  // Fallback to RGB analysis
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'category-link';
  
  const { r, g, b } = rgb;
  
  // Yellow/Orange variations (high red and green, low blue)
  if (r > 200 && g > 100 && b < 100) return 'category-link-yellow';
  
  // Red variations (high red, low green and blue)
  if (r > g && r > b && r > 150 && g < 100 && b < 100) return 'category-link-red';
  
  // Blue variations (high blue, low red and green)
  if (b > r && b > g && b > 150 && r < 100 && g < 100) return 'category-link-blue';
  
  // Green variations (high green, low red and blue)
  if (g > r && g > b && g > 150 && r < 100 && b < 100) return 'category-link-green';
  
  // Purple variations (high red and blue, low green)
  if (r > 100 && b > 100 && g < 100) return 'category-link-purple';
  
  // Default fallback
  return 'category-link';
}

export function getCategoryBadgeClass(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'category-badge';
  
  // Map common colors to CSS classes
  const { r, g, b } = rgb;
  
  // Red variations
  if (r > g && r > b && r > 150) return 'category-badge-red';
  
  // Blue variations
  if (b > r && b > g && b > 150) return 'category-badge-blue';
  
  // Green variations
  if (g > r && g > b && g > 150) return 'category-badge-green';
  
  // Yellow variations
  if (r > 200 && g > 200 && b < 100) return 'category-badge-yellow';
  
  // Purple variations
  if (r > 100 && b > 100 && g < 100) return 'category-badge-purple';
  
  // Default fallback
  return 'category-badge';
}

// SEO utilities
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const text = stripHtml(content);
  return truncateText(text, maxLength);
}

export function generateKeywords(title: string, content: string): string[] {
  const text = `${title} ${stripHtml(content)}`.toLowerCase();
  const words = text
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Return top 10 most frequent words
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ocorreu um erro inesperado';
}

// Local storage utilities
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors
  }
}

// Session storage utilities
export function getFromSessionStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToSessionStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore sessionStorage errors
  }
}
