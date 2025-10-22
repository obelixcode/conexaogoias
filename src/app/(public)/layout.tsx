import { Suspense } from 'react';
import { ClientHeader } from '@/components/ClientHeader';
import { ClientFooterWrapper } from '@/components/ClientFooterWrapper';
import { SidebarSkeleton } from '@/components/LoadingSkeleton';

// Configurações de cache para o layout
export const revalidate = 0;
export const dynamic = 'force-dynamic';
function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClientHeader categories={[]} />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <ClientFooterWrapper />
    </div>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm sticky top-0 z-50">
          <div className="bg-blue-900 text-white text-sm py-1">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span>Carregando...</span>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                <span className="text-blue-900">CARREGANDO...</span>
                <span className="text-gray-500 text-lg">.com</span>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <SidebarSkeleton />
            </div>
          </div>
        </main>
        <div className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="text-2xl font-bold mb-4">
              <span className="text-white">CARREGANDO...</span>
              <span className="text-gray-400 text-lg">.com</span>
            </div>
            <p className="text-gray-300">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </Suspense>
  );
}
