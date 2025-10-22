'use client';

import Link from 'next/link';
import { 
  Plus, 
  ExternalLink, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AuthUser } from '@/types/user';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface WordPressTopBarProps {
  user: AuthUser;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export function WordPressTopBar({ user, onLogout }: WordPressTopBarProps) {
  const { settings } = useSettingsContext();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left side - Logo and Site Name */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-semibold text-gray-900">{settings.siteName}</div>
            <div className="text-xs text-gray-500">{settings.siteDescription}</div>
          </div>
        </Link>
      </div>

      {/* Center - Quick Actions */}
      <div className="hidden md:flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/editor" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/media/upload" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Mídia
          </Link>
        </Button>
      </div>

      {/* Right side - User Menu and Actions */}
      <div className="flex items-center space-x-3">
        {/* Visit Site */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank" className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Site
          </Link>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrador' : 'Editor'}</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/configuracoes" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
