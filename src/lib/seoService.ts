import { News, Category } from '@/types';
import { SiteSettings } from '@/types/settings';

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  structuredData: Record<string, unknown>;
}

export class SEOService {
  // Gerar dados SEO para uma notícia
  static generateNewsSEO(news: News, category?: Category, settings?: SiteSettings): SEOData {
    const siteName = settings?.siteName ? `${settings.siteName} - Portal de Notícias` : 'Conexão Goiás - Portal de Notícias';
    const baseUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://conexaogoias.com';
    const newsUrl = `${baseUrl}/noticia/${news.slug}`;
    
    // Título otimizado
    const title = `${news.title} | ${siteName}`;
    
    // Descrição otimizada
    const description = (news as unknown as Record<string, unknown>).excerpt as string || 
      news.content?.replace(/<[^>]*>/g, '').substring(0, 160) + '...' ||
      `Leia a notícia completa sobre ${news.title} no ${siteName}`;
    
    // Keywords baseadas no título, categoria e tags
    const keywords = [
      news.title.toLowerCase(),
      category?.name.toLowerCase() || '',
      ...(news.tags || []),
      'notícias',
      'jornal',
      'Goiás',
      'Brasil'
    ].filter(Boolean);
    
    // Open Graph
    const ogTitle = news.title;
    const ogDescription = description;
    const ogImage = (news as unknown as Record<string, unknown>).featuredImage as string || `${baseUrl}/og-default.jpg`;
    const ogUrl = newsUrl;
    
    // Twitter Card
    const twitterCard: 'summary' | 'summary_large_image' = (news as unknown as Record<string, unknown>).featuredImage ? 'summary_large_image' : 'summary';
    const twitterTitle = news.title;
    const twitterDescription = description;
    const twitterImage = (news as unknown as Record<string, unknown>).featuredImage as string || `${baseUrl}/twitter-default.jpg`;
    
    // Structured Data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: news.title,
      description: description,
      image: (news as unknown as Record<string, unknown>).featuredImage ? [(news as unknown as Record<string, unknown>).featuredImage as string] : [],
      datePublished: news.publishedAt || news.createdAt,
      dateModified: news.updatedAt || news.createdAt,
      author: {
        '@type': 'Person',
        name: news.author
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': newsUrl
      },
      articleSection: category?.name || 'Notícias',
      keywords: keywords.join(', ')
    };
    
    return {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonicalUrl: newsUrl,
      structuredData
    };
  }
  
  // Gerar dados SEO para a homepage
  static generateHomepageSEO(settings?: SiteSettings): SEOData {
    const siteName = settings?.siteName ? `${settings.siteName} - Portal de Notícias` : 'Conexão Goiás - Portal de Notícias';
    const baseUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://conexaogoias.com';
    
    const title = `${siteName} - Notícias de Goiás e do Brasil`;
    const description = 'Portal de notícias com as principais informações de Goiás e do Brasil. Acompanhe política, economia, esportes, cultura e muito mais.';
    const keywords = [
      'notícias',
      'jornal',
      'Goiás',
      'Brasil',
      'política',
      'economia',
      'esportes',
      'cultura',
      'portal de notícias'
    ];
    
    const ogTitle = title;
    const ogDescription = description;
    const ogImage = `${baseUrl}/og-homepage.jpg`;
    const ogUrl = baseUrl;
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: baseUrl,
      description: description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/busca?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
    
    return {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterCard: 'summary_large_image',
      twitterTitle: ogTitle,
      twitterDescription: ogDescription,
      twitterImage: ogImage,
      canonicalUrl: baseUrl,
      structuredData
    };
  }
  
  // Gerar dados SEO para uma categoria
  static generateCategorySEO(category: Category, newsCount: number, settings?: SiteSettings): SEOData {
    const siteName = settings?.siteName ? `${settings.siteName} - Portal de Notícias` : 'Conexão Goiás - Portal de Notícias';
    const baseUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://conexaogoias.com';
    const categoryUrl = `${baseUrl}/categoria/${category.slug}`;
    
    const title = `${category.name} | ${siteName}`;
    const description = category.description || 
      `Acompanhe as últimas notícias sobre ${category.name}. ${newsCount} artigos disponíveis.`;
    const keywords = [
      category.name.toLowerCase(),
      'notícias',
      'jornal',
      'Goiás',
      'Brasil',
      category.slug
    ];
    
    const ogTitle = title;
    const ogDescription = description;
    const ogImage = `${baseUrl}/og-category-${category.slug}.jpg`;
    const ogUrl = categoryUrl;
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      description: description,
      url: categoryUrl,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: newsCount
      }
    };
    
    return {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterCard: 'summary_large_image',
      twitterTitle: ogTitle,
      twitterDescription: ogDescription,
      twitterImage: ogImage,
      canonicalUrl: categoryUrl,
      structuredData
    };
  }
  
  // Gerar sitemap XML
  static generateSitemap(news: News[], categories: Category[], settings?: SiteSettings): string {
    const baseUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://conexaogoias.com';
    const currentDate = new Date().toISOString();
    
    const newsUrls = news
      .filter(n => (n as unknown as Record<string, unknown>).status === 'published')
      .map(n => ({
        url: `${baseUrl}/noticia/${(n as unknown as Record<string, unknown>).slug as string}`,
        lastmod: (n as unknown as Record<string, unknown>).updatedAt || (n as unknown as Record<string, unknown>).publishedAt || (n as unknown as Record<string, unknown>).createdAt,
        changefreq: 'daily',
        priority: '0.8'
      }));
    
    const categoryUrls = categories.map(c => ({
      url: `${baseUrl}/categoria/${c.slug}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.6'
    }));
    
    const staticUrls = [
      {
        url: baseUrl,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      }
    ];
    
    const allUrls = [...staticUrls, ...categoryUrls, ...newsUrls];
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    allUrls.forEach(urlData => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${urlData.url}</loc>\n`;
      sitemap += `    <lastmod>${urlData.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${urlData.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${urlData.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    return sitemap;
  }
  
  // Gerar robots.txt
  static generateRobotsTxt(settings?: SiteSettings): string {
    const baseUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://conexaogoias.com';
    
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-news.xml
Sitemap: ${baseUrl}/sitemap-categories.xml`;
  }
}
