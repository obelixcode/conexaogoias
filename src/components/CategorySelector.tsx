'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronDown, Check } from 'lucide-react';
import { CategoryService } from '@/lib/categoryService';
import { Category } from '@/types/category';

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CategorySelector({ 
  value, 
  onChange, 
  placeholder = "Selecione uma categoria",
  className = ""
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  // Set selected category when value changes
  useEffect(() => {
    if (value && categories.length > 0) {
      const category = categories.find(cat => cat.id === value);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [value, categories]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    onChange(category.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus search input when opening
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        className="w-full justify-between h-10"
      >
        <span className="truncate">
          {selectedCategory ? (
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full category-color"
                style={{ '--category-color': selectedCategory.color } as React.CSSProperties}
              />
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg bg-white border border-gray-200">
          <CardContent className="p-0 bg-white">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories List */}
            <div className="max-h-60 overflow-y-auto bg-white">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Carregando categorias...
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria disponível'}
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full category-color"
                        style={{ '--category-color': category.color } as React.CSSProperties}
                      />
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-gray-500">{category.description}</div>
                        )}
                      </div>
                    </div>
                    {selectedCategory?.id === category.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
