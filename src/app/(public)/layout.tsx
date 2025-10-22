import { ClientHeader } from '@/components/ClientHeader';
import { ClientFooterWrapper } from '@/components/ClientFooterWrapper';
import { SidebarSkeleton } from '@/components/LoadingSkeleton';

// Configurações de cache para o layout
export const revalidate = 60;
function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" suppressHydrationWarning>
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
  return <PublicLayoutContent>{children}</PublicLayoutContent>;
}
