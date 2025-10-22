// Re-export all types for easier imports
export * from './news';
export * from './category';
export * from './user';
export * from './banner';
export * from './block';
export * from './tag';
export * from './roadmap';

// Common types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface FilterOptions {
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: string[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  color?: string;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// SEO types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  section?: string;
  tags?: string[];
}