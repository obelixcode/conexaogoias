'use client';

import { useState, useEffect, useRef } from 'react';
import { TagService } from '@/lib/tagService';
import { Tag } from '@/types/tag';

interface TagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TagAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Digite as tags separadas por vírgula...",
  className = ""
}: TagAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get current tag being typed
  useEffect(() => {
    const tags = value.split(',').map(tag => tag.trim());
    const lastTag = tags[tags.length - 1] || '';
    setCurrentTag(lastTag);
  }, [value]);

  // Search for suggestions
  useEffect(() => {
    if (currentTag.length > 0) {
      searchSuggestions(currentTag);
    } else {
      setSuggestions([]);
    }
  }, [currentTag]);

  const searchSuggestions = async (query: string) => {
    try {
      const results = await TagService.searchTags(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Error searching tags:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (tag: Tag) => {
    const tags = value.split(',').map(t => t.trim());
    tags[tags.length - 1] = tag.name;
    const newValue = tags.join(', ');
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const handleFocus = () => {
    if (currentTag.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((tag) => (
            <div
              key={tag.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
              onClick={() => handleSuggestionClick(tag)}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm">{tag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
