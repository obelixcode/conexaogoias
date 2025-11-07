'use client';

import Image from 'next/image';
import { CategoryHighlight, HighlightPost } from '@/types/category';
import { isFirebaseStorageUrl } from '@/utils';

interface CategoryHighlightsProps {
  highlights: CategoryHighlight[];
}

export function CategoryHighlights({ highlights }: CategoryHighlightsProps) {
  if (highlights.length === 0) {
    return null;
  }

  // Criar array de posts organizados por categoria para o grid
  const gridPosts: Array<{
    category: CategoryHighlight;
    post: HighlightPost;
    categoryIndex: number;
  }> = [];

  highlights.forEach((category, categoryIndex) => {
    category.posts.forEach((post) => {
      gridPosts.push({
        category,
        post,
        categoryIndex
      });
    });
  });

  return (
    <div className="w-full">
      {/* Título da seção */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">DESTAQUE DE HOJE</h2>
      </div>

      {/* Grid de posts - Responsivo: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((category) => (
          <div key={category.id} className="space-y-4">
            {/* Cabeçalho da categoria */}
            <div className="text-center mb-4">
              <div 
                className="h-1 w-full mb-2"
                style={{ backgroundColor: category.color }}
              />
              <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
            </div>

            {/* Mobile: Mostrar todos os posts de uma categoria */}
            <div className="lg:hidden">
              {category.posts.map((post) => (
                <a
                  key={`${category.id}-${post.id}`}
                  href={`/noticia/${post.slug}`}
                  className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 mb-4"
                >
                  {/* Imagem do post */}
                  <div className="relative h-32 w-full">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      unoptimized={isFirebaseStorageUrl(post.coverImage)}
                    />
                  </div>

                  {/* Conteúdo do post */}
                  <div className="p-3">
                    {/* Tag da categoria */}
                    <div className="mb-2">
                      <span 
                        className="inline-block px-2 py-1 text-xs font-bold text-white rounded uppercase"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    </div>
                    
                    {/* Título do post */}
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {post.title}
                    </h4>
                  </div>
                </a>
              ))}
            </div>

            {/* Desktop: Mostrar posts em grid 4x4 */}
            <div className="hidden lg:block">
              {Array.from({ length: 4 }).map((_, postIndex) => {
                const post = category.posts[postIndex];
                
                if (!post) {
                  return <div key={postIndex} className="h-32" />; // Espaço vazio
                }

                return (
                  <a
                    key={`${category.id}-${post.id}`}
                    href={`/noticia/${post.slug}`}
                    className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 mb-4"
                  >
                    {/* Imagem do post */}
                    <div className="relative h-32 w-full">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        unoptimized={isFirebaseStorageUrl(post.coverImage)}
                      />
                    </div>

                    {/* Conteúdo do post */}
                    <div className="p-3">
                      {/* Tag da categoria */}
                      <div className="mb-2">
                        <span 
                          className="inline-block px-2 py-1 text-xs font-bold text-white rounded uppercase"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      </div>
                      
                      {/* Título do post */}
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {post.title}
                      </h4>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
