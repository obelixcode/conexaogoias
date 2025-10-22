import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
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

const BANNERS_COLLECTION = 'banners';
const BANNER_CLICKS_COLLECTION = 'bannerClicks';

export class BannerService {
  // Create banner
  static async createBanner(bannerData: BannerFormData, imageUrl: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, BANNERS_COLLECTION), {
        title: bannerData.title,
        image: imageUrl,
        link: bannerData.link,
        position: bannerData.position,
        isActive: bannerData.isActive,
        order: bannerData.order,
        clicks: 0,
        impressions: 0,
        maxClicks: bannerData.maxClicks || null,
        maxImpressions: bannerData.maxImpressions || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startsAt: bannerData.startsAt || null,
        expiresAt: bannerData.expiresAt || null,
        targetAudience: bannerData.targetAudience || ''
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create banner error:', error);
      throw new Error('Erro ao criar banner');
    }
  }

  // Update banner
  static async updateBanner(id: string, bannerData: Partial<BannerFormData>, imageUrl?: string): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        ...bannerData,
        updatedAt: serverTimestamp()
      };

      if (imageUrl) {
        updateData.image = imageUrl;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(doc(db, BANNERS_COLLECTION, id), updateData as Record<string, any>);
    } catch (error) {
      console.error('Update banner error:', error);
      throw new Error('Erro ao atualizar banner');
    }
  }

  // Delete banner
  static async deleteBanner(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, BANNERS_COLLECTION, id));
    } catch (error) {
      console.error('Delete banner error:', error);
      throw new Error('Erro ao excluir banner');
    }
  }

  // Get banner by ID
  static async getBannerById(id: string): Promise<Banner | null> {
    try {
      const bannerDoc = await getDoc(doc(db, BANNERS_COLLECTION, id));
      
      if (!bannerDoc.exists()) {
        return null;
      }
      
      const data = bannerDoc.data();
      return {
        id: bannerDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        startsAt: data.startsAt?.toDate(),
        expiresAt: data.expiresAt?.toDate()
      } as Banner;
    } catch (error) {
      console.error('Get banner by ID error:', error);
      throw new Error('Erro ao buscar banner');
    }
  }

  // Get all banners
  static async getAllBanners(): Promise<Banner[]> {
    try {
      const bannersQuery = query(
        collection(db, BANNERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const bannersSnapshot = await getDocs(bannersQuery);
      
      return bannersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          startsAt: data.startsAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as Banner;
      });
    } catch (error) {
      console.error('Get all banners error:', error);
      throw new Error('Erro ao buscar banners');
    }
  }

  // Get all active banners
  static async getActiveBanners(): Promise<Banner[]> {
    try {
      // First try to get all banners and filter client-side
      const bannersQuery = query(
        collection(db, BANNERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const bannersSnapshot = await getDocs(bannersQuery);
      
      const now = new Date();
      
      const allBanners = bannersSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Função para limpar URLs problemáticas
        const cleanUrl = (url: string) => {
          if (!url) return url;
          
          // Decodificar URL se necessário
          let cleanUrl = decodeURIComponent(url);
          
          // Remover prefixos do localhost
          cleanUrl = cleanUrl.replace(/^http:\/\/localhost:3000\/_next\/image\?url=/, '');
          cleanUrl = cleanUrl.replace(/^https:\/\/localhost:3000\/_next\/image\?url=/, '');
          
          // Remover parâmetros de query do Next.js
          cleanUrl = cleanUrl.replace(/&w=\d+&q=\d+$/, '');
          cleanUrl = cleanUrl.replace(/&w=\d+$/, '');
          cleanUrl = cleanUrl.replace(/&q=\d+$/, '');
          
          return cleanUrl;
        };
        
        const cleanedImage = cleanUrl(data.image);
        const cleanedLink = cleanUrl(data.link);
        
        return {
          id: doc.id,
          ...data,
          image: cleanedImage,
          link: cleanedLink,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          startsAt: data.startsAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as Banner;
      });
      
      const activeBanners = allBanners
        .filter(banner => {
          // Filter active banners
          if (!banner.isActive) {
            return false;
          }
          
          // Filter out expired banners
          if (banner.expiresAt && banner.expiresAt < now) {
            return false;
          }
          
          return true;
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return activeBanners;
    } catch (error) {
      console.error('Get active banners error:', error);
      throw new Error('Erro ao buscar banners ativos');
    }
  }

  // Get active banners by position
  static async getActiveBannersByPosition(position: BannerPosition): Promise<Banner[]> {
    try {
      const now = new Date();
      
      const bannersQuery = query(
        collection(db, BANNERS_COLLECTION),
        where('position', '==', position),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      
      const bannersSnapshot = await getDocs(bannersQuery);
      
      const banners = bannersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          startsAt: data.startsAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as Banner;
      });

      // Filter out expired banners
      return banners.filter(banner => 
        !banner.expiresAt || banner.expiresAt > now
      );
    } catch (error) {
      console.error('Get active banners by position error:', error);
      throw new Error('Erro ao buscar banners ativos');
    }
  }

  // Record banner click
  static async recordBannerClick(bannerId: string, position: BannerPosition, metadata?: {
    userAgent?: string;
    referrer?: string;
    ipAddress?: string;
  }): Promise<void> {
    try {
      // Record the click
      await addDoc(collection(db, BANNER_CLICKS_COLLECTION), {
        bannerId,
        position,
        clickedAt: serverTimestamp(),
        userAgent: metadata?.userAgent || '',
        referrer: metadata?.referrer || '',
        ipAddress: metadata?.ipAddress || ''
      });

      // Increment click count on banner
      await updateDoc(doc(db, BANNERS_COLLECTION, bannerId), {
        clicks: increment(1)
      });
    } catch (error) {
      console.error('Record banner click error:', error);
      // Don't throw error for click tracking failures
    }
  }

  // Record banner impression
  static async recordBannerImpression(bannerId: string): Promise<void> {
    try {
      await updateDoc(doc(db, BANNERS_COLLECTION, bannerId), {
        impressions: increment(1)
      });
    } catch (error) {
      console.error('Record banner impression error:', error);
      // Don't throw error for impression tracking failures
    }
  }

  // Update banner order
  static async updateBannerOrder(bannerIds: string[]): Promise<void> {
    try {
      const updatePromises = bannerIds.map((id, index) => 
        updateDoc(doc(db, BANNERS_COLLECTION, id), {
          order: index + 1,
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Update banner order error:', error);
      throw new Error('Erro ao atualizar ordem dos banners');
    }
  }

  // Toggle banner active status
  static async toggleBannerStatus(id: string): Promise<void> {
    try {
      const banner = await this.getBannerById(id);
      if (!banner) {
        throw new Error('Banner não encontrado');
      }

      await updateDoc(doc(db, BANNERS_COLLECTION, id), {
        isActive: !banner.isActive,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Toggle banner status error:', error);
      throw new Error('Erro ao alterar status do banner');
    }
  }

  // Get banner statistics
  static async getBannerStats(): Promise<BannerStats> {
    try {
      console.log('Fetching banner stats...');
      
      // Check if db is initialized
      if (!db) {
        throw new Error('Firebase Firestore não foi inicializado');
      }
      
      const bannersSnapshot = await getDocs(collection(db, BANNERS_COLLECTION));
      console.log('Banners fetched:', bannersSnapshot.docs.length);
      
      const clicksSnapshot = await getDocs(collection(db, BANNER_CLICKS_COLLECTION));
      console.log('Clicks fetched:', clicksSnapshot.docs.length);
      
      const banners = bannersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          startsAt: data.startsAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as Banner;
      });


      const activeBanners = banners.filter(banner => banner.isActive);
      const totalClicks = banners.reduce((sum, banner) => sum + banner.clicks, 0);
      const totalImpressions = banners.reduce((sum, banner) => sum + banner.impressions, 0);
      const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      // Group by position
      const positions: BannerPosition[] = ['sidebar-top', 'sidebar-bottom', 'header', 'content-top', 'content-bottom', 'between-news'];
      const bannersByPosition = positions.map(position => {
        const positionBanners = banners.filter(banner => banner.position === position);
        const positionClicks = positionBanners.reduce((sum, banner) => sum + banner.clicks, 0);
        
        return {
          position,
          count: positionBanners.length,
          clicks: positionClicks
        };
      });

      // Top banners by clicks
      const topBanners = banners
        .map(banner => ({
          id: banner.id,
          title: banner.title,
          clicks: banner.clicks,
          impressions: banner.impressions,
          ctr: banner.impressions > 0 ? (banner.clicks / banner.impressions) * 100 : 0
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      return {
        totalBanners: banners.length,
        activeBanners: activeBanners.length,
        totalClicks,
        totalImpressions,
        clickThroughRate,
        bannersByPosition,
        topBanners
      };
    } catch (error) {
      console.error('Get banner stats error:', error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Return default stats instead of throwing error
      return {
        totalBanners: 0,
        activeBanners: 0,
        totalClicks: 0,
        totalImpressions: 0,
        clickThroughRate: 0,
        bannersByPosition: [],
        topBanners: []
      };
    }
  }

  // Get banner clicks for analytics
  static async getBannerClicks(bannerId?: string, days: number = 30): Promise<BannerClick[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let clicksQuery = query(
        collection(db, BANNER_CLICKS_COLLECTION),
        where('clickedAt', '>=', startDate),
        orderBy('clickedAt', 'desc')
      );

      if (bannerId) {
        clicksQuery = query(
          collection(db, BANNER_CLICKS_COLLECTION),
          where('bannerId', '==', bannerId),
          where('clickedAt', '>=', startDate),
          orderBy('clickedAt', 'desc')
        );
      }

      const clicksSnapshot = await getDocs(clicksQuery);
      
      return clicksSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          bannerId: data.bannerId || '',
          position: data.position || 'sidebar-top',
          clickedAt: data.clickedAt?.toDate() || new Date(),
          userAgent: data.userAgent || '',
          referrer: data.referrer || ''
        } as BannerClick;
      });
    } catch (error) {
      console.error('Get banner clicks error:', error);
      throw new Error('Erro ao buscar cliques dos banners');
    }
  }

  // Clean up expired banners
  static async cleanupExpiredBanners(): Promise<void> {
    try {
      const now = new Date();
      
      const expiredBannersQuery = query(
        collection(db, BANNERS_COLLECTION),
        where('expiresAt', '<=', now),
        where('isActive', '==', true)
      );
      
      const expiredBannersSnapshot = await getDocs(expiredBannersQuery);
      
      const deactivatePromises = expiredBannersSnapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          isActive: false,
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(deactivatePromises);
    } catch (error) {
      console.error('Cleanup expired banners error:', error);
      throw new Error('Erro ao limpar banners expirados');
    }
  }
}
