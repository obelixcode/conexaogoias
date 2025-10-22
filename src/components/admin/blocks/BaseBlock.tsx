'use client';

import { useState } from 'react';
import { 
  MoveUp, 
  MoveDown, 
  Trash2, 
  Copy,
  GripVertical
} from 'lucide-react';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { Block } from '@/types/block';
import { cn } from '@/lib/utils';

interface BaseBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BaseBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  children,
  className = ''
}: BaseBlockProps) {
  const [showToolbar, setShowToolbar] = useState(false);

  const handleMouseEnter = () => {
    setShowToolbar(true);
  };

  const handleMouseLeave = () => {
    setShowToolbar(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      className={cn(
        "relative group",
        isSelected && "ring-2 ring-blue-500 ring-opacity-50",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Block Content */}
      <div className="relative">
        {children}
      </div>

      {/* Block Toolbar */}
      {(isSelected || showToolbar) && (
        <div className="absolute -top-10 left-0 bg-gray-800 text-white rounded-md shadow-lg flex items-center space-x-1 p-1 z-10">
          <div className="flex items-center space-x-1">
            <GripVertical className="h-4 w-4 text-gray-300 cursor-move" />
          </div>
          
          <div className="w-px h-6 bg-gray-600" />
          
          <div className="flex items-center space-x-1">
            <WordPressButton
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="text-white hover:bg-gray-700 p-1"
            >
              <MoveUp className="h-3 w-3" />
            </WordPressButton>
            
            <WordPressButton
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              className="text-white hover:bg-gray-700 p-1"
            >
              <MoveDown className="h-3 w-3" />
            </WordPressButton>
          </div>
          
          <div className="w-px h-6 bg-gray-600" />
          
          <div className="flex items-center space-x-1">
            <WordPressButton
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="text-white hover:bg-gray-700 p-1"
            >
              <Copy className="h-3 w-3" />
            </WordPressButton>
            
            <WordPressButton
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-white hover:bg-red-600 p-1"
            >
              <Trash2 className="h-3 w-3" />
            </WordPressButton>
          </div>
        </div>
      )}

      {/* Block Type Indicator */}
      {isSelected && (
        <div className="absolute -left-8 top-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
          {block.type}
        </div>
      )}
    </div>
  );
}
