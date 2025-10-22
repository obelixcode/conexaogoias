export interface News {
  id: string;
  title: string;
  subtitle: string;
  content: string; // HTML content from Tiptap
  coverImage: string; // Firebase Storage URL
  categoryId: string;
  author: string;
  tags: string[]; // Array of tags for related news
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
  isFeatured: boolean;
  featuredPosition?: number; // 1-5 for top 5 featured
  views: number;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface NewsFormData {
  title: string;
  subtitle: string;
  content: string;
  coverImage?: File;
  categoryId: string;
  author: string;
  tags: string;
  slug: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredPosition?: number;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface FeaturedNews {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  publishedAt: Date;
  views: number;
  position: number;
}

export interface NewsWithCategory extends News {
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

export interface NewsStats {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  featuredNews?: number;
  totalViews: number;
  newsByCategory: Array<{
    categoryName: string;
    count: number;
  }>;
  recentNews: News[];
}

export interface RelatedNews {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  categoryName: string;
  publishedAt: Date;
  similarity: number; // For debugging/ranking
}

export interface FeaturedNewsConfig {
  newsIds: string[];
  updatedAt: Date;
  updatedBy: string;
}
