import { Suspense } from 'react';
import { Metadata } from 'next';
import { SettingsService } from '@/lib/settingsService';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Share2, Eye, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsService } from '@/lib/newsService';
import { RelatedNews } from '@/components/RelatedNews';
import { formatNewsDate, formatLongDate, generateMetaDescription } from '@/utils';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { ViewsCounter } from '@/components/ViewsCounter';

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getNewsData(slug: string) {
  try {
    const news = await NewsService.getNewsBySlug(slug);

    if (!news) {
      return null;
    }

    // Get related news with the actual news ID
    const relatedNews = await NewsService.getRelatedNews(news.id, 3);

    return {
      news,
      relatedNews
    };
  } catch (error) {
    console.error('Error fetching news data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const [data, settings] = await Promise.all([
    getNewsData(resolvedParams.slug),
    SettingsService.getSettings()
  ]);
  
  if (!data) {
    return {
      title: `Notícia não encontrada - ${settings.siteName}`,
    };
  }

  const { news } = data;
  const description = news.metaDescription || generateMetaDescription(news.content);

  return {
    title: `${news.title} - ${settings.siteName}`,
    description,
    keywords: news.metaKeywords?.join(', ') || news.tags.join(', '),
    authors: [{ name: news.author }],
    openGraph: {
      title: news.title,
      description: news.subtitle || description,
      type: 'article',
      publishedTime: news.publishedAt?.toISOString(),
      modifiedTime: news.updatedAt.toISOString(),
      authors: [news.author],
      section: news.category.name,
      tags: news.tags,
      images: [
        {
          url: news.coverImage,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: news.subtitle || description,
      images: [news.coverImage],
    },
  };
}

async function NewsPageContent({ slug }: { slug: string }) {
  const data = await getNewsData(slug);
  
  if (!data) {
    notFound();
  }

  const { news, relatedNews } = data;

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
        </Link>
      </div>

      {/* Article header */}
      <header className="mb-8">
        {/* Category */}
        <div className="mb-4">
          <Link
            href={`/categoria/${news.category.slug}`}
            className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: news.category.color }}
          >
            {news.category.name}
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {news.title}
        </h1>

        {/* Subtitle */}
        {news.subtitle && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {news.subtitle}
          </p>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Por {news.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={news.publishedAt?.toISOString()}>
              {formatLongDate(news.publishedAt || news.createdAt)}
            </time>
          </div>
          <ViewsCounter newsId={news.id} />
        </div>

        {/* Social share buttons */}
        <div className="flex items-center space-x-4 mb-8">
          <span className="text-sm text-gray-600">Compartilhar:</span>
          <SocialShareButtons news={news} />
        </div>
      </header>

      {/* Cover image */}
      <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
        <Image
          src={news.coverImage}
          alt={news.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
      </div>

      {/* Article content */}
      <div 
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />

      {/* Tags */}
      {news.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {news.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related news */}
      <Suspense fallback={<div className="mt-8 h-32 bg-gray-50 rounded-lg animate-pulse" />}>
        <RelatedNews relatedNews={relatedNews} />
      </Suspense>
    </article>
  );
}

export default async function NewsPage({ params }: NewsPageProps) {
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
          <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <NewsPageContent slug={resolvedParams.slug} />
    </Suspense>
  );
}

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    // Limit to 100 most recent news for better performance
    const recentNews = await NewsService.getRecentNews(100);
    return recentNews.map((news) => ({
      slug: news.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for news:', error);
    return [];
  }
}
