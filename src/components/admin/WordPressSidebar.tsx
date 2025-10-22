'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NewsService } from '@/lib/newsService';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Tag, 
  Image, 
  File, 
  Menu, 
  Users, 
  Settings, 
  ChevronRight,
  ChevronDown,
  Plus,
  BarChart3,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
  badge?: string;
}

interface WordPressSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function WordPressSidebar({ isCollapsed, onToggleCollapse }: WordPressSidebarProps) {
  const { settings } = useSettingsContext();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [newsCount, setNewsCount] = useState<number>(0);

  // Debug: Log pathname changes
  useEffect(() => {
    console.log('Pathname changed to:', pathname);
  }, [pathname]);


  // Buscar quantidade de notícias
  useEffect(() => {
    const loadNewsCount = async () => {
      try {
        const response = await NewsService.getAllNews();
        const total = Array.isArray(response) ? response.length : 0;
        setNewsCount(total);
      } catch (error) {
        console.error('Error loading news count:', error);
        setNewsCount(0);
      }
    };

    loadNewsCount();
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'posts',
      label: 'Notícias',
      icon: FileText,
      children: [
        {
          id: 'all-posts',
          label: 'Todas as Notícias',
          href: '/admin/posts',
          icon: FileText,
          badge: newsCount.toString()
        },
        {
          id: 'new-post',
          label: 'Adicionar Nova',
          href: '/admin/editor',
          icon: Plus,
        },
        {
          id: 'categories',
          label: 'Categorias',
          href: '/admin/posts/categories',
          icon: FolderOpen,
        },
        {
          id: 'tags',
          label: 'Tags',
          href: '/admin/posts/tags',
          icon: Tag,
        },
      ]
    },
    {
      id: 'media',
      label: 'Mídia',
      icon: Image,
      children: [
        {
          id: 'library',
          label: 'Biblioteca',
          href: '/admin/media/library',
          icon: Image,
        },
        {
          id: 'add-media',
          label: 'Adicionar Nova',
          href: '/admin/media/upload',
          icon: Plus,
        },
      ]
    },
    {
      id: 'pages',
      label: 'Páginas',
      href: '/admin/pages',
      icon: File,
    },
    {
      id: 'banners',
      label: 'Banners',
      href: '/admin/banners',
      icon: BarChart3,
    },
    {
      id: 'roadmap',
      label: 'RoadMap',
      href: '/admin/roadmap',
      icon: Target,
    },
    {
      id: 'users',
      label: 'Usuários',
      href: '/admin/users',
      icon: Users,
    },
    {
      id: 'settings',
      label: 'Configurações',
      href: '/admin/configuracoes',
      icon: Settings,
    },
  ];

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleNavigation = useCallback((href: string) => {
    if (href && href !== '#') {
      console.log('Navigating to:', href);
      // Use window.location for more reliable navigation
      window.location.href = href;
    }
  }, []);

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.children) {
      return item.children.some(child => child.href && pathname === child.href);
    }
    return false;
  };

  const isParentActive = (item: MenuItem): boolean => {
    if (item.children) {
      return item.children.some(child => child.href && pathname === child.href);
    }
    return false;
  };

  return (
    <div className={cn(
      "bg-gray-800 text-white transition-all duration-300 ease-in-out h-full flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-semibold">{settings.siteName}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4">
        <div className="px-2 space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Parent Item */}
              {item.href ? (
                <button
                  type="button"
                  onClick={() => handleNavigation(item.href!)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-left",
                    isItemActive(item)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </div>
                  
                  {!isCollapsed && item.badge && (
                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-left",
                    isParentActive(item)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                  onClick={() => {
                    if (item.children) {
                      toggleExpanded(item.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </div>
                  
                  {!isCollapsed && item.children && (
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {expandedItems.includes(item.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </button>
              )}

              {/* Children Items */}
              {!isCollapsed && item.children && expandedItems.includes(item.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleNavigation(child.href || '#')}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors text-left",
                        pathname === child.href
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      )}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <child.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </div>
                      {child.badge && (
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                          {child.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-400">
            <div>{settings.siteName} Admin</div>
            <div>Versão 1.0.0</div>
          </div>
        )}
      </div>
    </div>
  );
}
