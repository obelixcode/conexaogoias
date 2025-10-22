export type BannerPosition = 
  | 'sidebar-top' 
  | 'sidebar-bottom' 
  | 'header' 
  | 'content-top' 
  | 'content-bottom' 
  | 'between-news';

export interface Banner {
  id: string;
  title: string;
  image: string; // Firebase Storage URL
  link: string; // Destination URL
  position: BannerPosition;
  isActive: boolean;
  order: number; // For ordering within same position
  clicks: number;
  impressions: number;
  maxClicks?: number; // Optional maximum clicks limit
  maxImpressions?: number; // Optional maximum impressions limit
  createdAt: Date;
  updatedAt: Date;
  startsAt?: Date; // Optional start date
  expiresAt?: Date; // Optional expiration date
  targetAudience?: string; // Optional targeting
}

export interface BannerFormData {
  title: string;
  image?: File;
  link: string;
  position: BannerPosition;
  isActive: boolean;
  order: number;
  maxClicks?: number;
  maxImpressions?: number;
  startsAt?: Date;
  expiresAt?: Date;
  targetAudience?: string;
}

export interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  totalClicks: number;
  totalImpressions: number;
  clickThroughRate: number;
  bannersByPosition: Array<{
    position: BannerPosition;
    count: number;
    clicks: number;
  }>;
  topBanners: Array<{
    id: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
}

export interface BannerClick {
  bannerId: string;
  position: BannerPosition;
  clickedAt: Date;
  userAgent?: string;
  referrer?: string;
  ipAddress?: string;
}
