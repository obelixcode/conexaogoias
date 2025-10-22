import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/aconexaogoias.firebasestorage.app/o/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'conexaogoias.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ohoje.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      }
    ],
  },
  // Configurações para melhorar a navegação
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Configurações de cache para desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  // Excluir páginas do admin do static export
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;