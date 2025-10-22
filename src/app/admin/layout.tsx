'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WordPressTopBar } from '@/components/admin/WordPressTopBar';
import { WordPressSidebar } from '@/components/admin/WordPressSidebar';
import { AdminService } from '@/lib/adminService';
import { useUser } from '@/contexts/UserContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useUser();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading && !user) {
      router.push('/admin/login');
    }
  }, [isLoginPage, isLoading, user, router]);

  const handleLogout = async () => {
    try {
      await AdminService.logout();
      document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    // Save preference to localStorage
    localStorage.setItem('wp-admin-sidebar-collapsed', JSON.stringify(newState));
  };

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('wp-admin-sidebar-collapsed');
    if (savedState !== null) {
      try {
        const parsedState = JSON.parse(savedState);
        setIsSidebarCollapsed(parsedState);
      } catch (error) {
        console.error('Error parsing sidebar state from localStorage:', error);
        // Reset to default state if parsing fails
        setIsSidebarCollapsed(false);
        localStorage.removeItem('wp-admin-sidebar-collapsed');
      }
    } else {
      // No saved state, use default
      setIsSidebarCollapsed(false);
    }
  }, []);

  // For login page, just render children without admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar - Fixed */}
      <WordPressTopBar user={user} onLogout={handleLogout} />
      
      <div className="flex pt-16">
        {/* Sidebar - Fixed below top bar */}
        <div className={`fixed inset-y-0 left-0 z-40 mt-16 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <WordPressSidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggleCollapse={toggleSidebar} 
          />
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <main className="p-6 bg-gray-50 min-h-screen" key={pathname}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}