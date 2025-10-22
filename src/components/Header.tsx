'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from '@/types';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { getCurrentDateFormatted } from '@/utils/dateUtils';

interface HeaderProps {
  categories: Category[];
}

export function Header({ categories }: HeaderProps) {
  const { settings } = useSettingsContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentDate = getCurrentDateFormatted();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search page or handle search
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-blue-900 text-white text-sm py-1">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName}
                className="w-[100px] h-auto object-contain"
              />
            ) : (
              <div className="text-3xl font-bold">
                <span className="text-blue-900">{settings.siteName.toUpperCase()}</span>
                <span className="text-gray-500 text-lg">.com</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {categories && categories.length > 0 ? categories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: category.color }}
              >
                {category.name.toUpperCase()}
              </Link>
            )) : null}
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {categories && categories.length > 0 ? categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="block py-2 font-medium transition-colors hover:opacity-80"
                  style={{ color: category.color }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name.toUpperCase()}
                </Link>
              )) : null}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
