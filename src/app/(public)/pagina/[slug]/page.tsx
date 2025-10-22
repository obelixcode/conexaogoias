import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageService, Page } from '@/lib/services/PageService';

// Configurações de cache e revalidação
export const revalidate = 3600; // Revalidar a cada hora (páginas mudam menos)
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const pages = await pageService.getPages({ status: 'published' });
    return pages.map((page) => ({
      slug: page.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for pages:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const pages = await pageService.getPages({ status: 'published' });
    const page = pages.find(p => p.slug === slug);
    
    if (!page) {
      return {
        title: 'Página não encontrada',
        description: 'A página solicitada não foi encontrada.'
      };
    }

    return {
      title: page.seoTitle || page.title,
      description: page.metaDescription || `Página: ${page.title}`,
      openGraph: {
        title: page.seoTitle || page.title,
        description: page.metaDescription || `Página: ${page.title}`,
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Página não encontrada',
      description: 'A página solicitada não foi encontrada.'
    };
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    const pages = await pageService.getPages({ status: 'published' });
    const page = pages.find((p: Page) => p.slug === slug);
    
    if (!page) {
      notFound();
    }

    // Incrementar visualizações
    if (page.id) {
      await pageService.incrementViews(page.id);
    }

    return (
      <div className="max-w-4xl mx-auto">
        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {page.title}
          </h1>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    notFound();
  }
}
