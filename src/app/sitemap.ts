import { MetadataRoute } from 'next';
import { NewsService } from '@/lib/newsService';
import { CategoryService } from '@/lib/categoryService';
import { SettingsService } from '@/lib/settingsService';

export const revalidate = 3600; // Revalidar a cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    // Get settings and data
    const [settings, recentNews, categories] = await Promise.all([
      SettingsService.getSettings(),
      NewsService.getRecentNews(1000), // Get more news for sitemap
      CategoryService.getActiveCategories()
    ]);

    const siteUrl = settings.siteUrl || baseUrl;

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1,
      },
      {
        url: `${siteUrl}/sobre-nos`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${siteUrl}/contato`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${siteUrl}/politica-privacidade`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${siteUrl}/termos-uso`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
    ];

    // News pages
    const newsPages: MetadataRoute.Sitemap = recentNews.map(news => ({
      url: `${siteUrl}/noticia/${news.slug}`,
      lastModified: news.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: news.isFeatured ? 0.9 : 0.7,
    }));

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
      url: `${siteUrl}/categoria/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...newsPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return basic sitemap if there's an error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1,
      },
    ];
  }
}
