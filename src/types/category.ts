export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string; // Hex color for category header
  description?: string;
  order: number; // For ordering in navigation
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithCount extends Category {
  newsCount: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  color: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  categoriesWithNews: number;
  topCategories: Array<{
    categoryName: string;
    newsCount: number;
    views: number;
  }>;
}

export interface CategoryHighlight {
  id: string;
  name: string;
  slug: string;
  color: string;
  posts: HighlightPost[];
  latestPostDate: Date;
}

export interface HighlightPost {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  publishedAt: Date;
  views: number;
}
