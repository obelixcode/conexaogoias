'use client';

import { useState } from 'react';
import { 
  X, 
  Home, 
  FileText, 
  FolderOpen, 
  Image, 
  Settings,
  User,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { getCurrentYear } from '@/utils/dateUtils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { settings } = useSettingsContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const currentYear = getCurrentYear();

  const menuItems = [
    {
      id: 'home',
      label: 'Início',
      href: '/',
      icon: Home
    },
    {
      id: 'news',
      label: 'Notícias',
      icon: FileText,
      children: [
        { label: 'Todas as Notícias', href: '/noticias' },
        { label: 'Política', href: '/categoria/politica' },
        { label: 'Economia', href: '/categoria/economia' },
        { label: 'Esportes', href: '/categoria/esportes' },
        { label: 'Cultura', href: '/categoria/cultura' }
      ]
    },
    {
      id: 'categories',
      label: 'Categorias',
      href: '/categorias',
      icon: FolderOpen
    },
    {
      id: 'gallery',
      label: 'Galeria',
      href: '/galeria',
      icon: Image
    },
    {
      id: 'about',
      label: 'Sobre',
      href: '/sobre',
      icon: Settings
    },
    {
      id: 'contact',
      label: 'Contato',
      href: '/contato',
      icon: User
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={onClose}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${
                            expandedItems.includes(item.id) ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
                      
                      {expandedItems.includes(item.id) && item.children && (
                        <div className="ml-8 mt-2 space-y-1">
                          {item.children.map((child, index) => (
                            <a
                              key={index}
                              href={child.href}
                              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={onClose}
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                © {currentYear} {settings.siteName}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {settings.siteDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
