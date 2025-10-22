import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/newsService';
import { SettingsService } from '@/lib/settingsService';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidar a cada hora

export async function GET() {
  try {
    const [settings, recentNews] = await Promise.all([
      SettingsService.getSettings(),
      NewsService.getRecentNews(50)
    ]);

    const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const siteName = settings.siteName || 'Conexão Goiás';

    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <description>${settings.siteDescription || 'Últimas notícias do Conexão Goiás'}</description>
    <link>${siteUrl}</link>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    
    ${recentNews.map(news => `
    <item>
      <title><![CDATA[${news.title}]]></title>
      <description><![CDATA[${news.subtitle || news.content.substring(0, 200)}...]]></description>
      <link>${siteUrl}/noticia/${news.slug}</link>
      <guid isPermaLink="true">${siteUrl}/noticia/${news.slug}</guid>
      <pubDate>${new Date(news.createdAt).toUTCString()}</pubDate>
      <category>${news.category?.name || 'Geral'}</category>
    </item>
    `).join('')}
  </channel>
</rss>`;

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar RSS:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
