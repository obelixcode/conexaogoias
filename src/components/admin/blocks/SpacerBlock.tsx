'use client';

import { useState } from 'react';
import { SpacerBlock as SpacerBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { Minus, Plus } from 'lucide-react';

interface SpacerBlockProps {
  block: SpacerBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: SpacerBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function SpacerBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: SpacerBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [height, setHeight] = useState(block.attributes.height);

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        height: newHeight
      }
    });
  };

  const handleIncrement = () => {
    handleHeightChange(Math.min(height + 10, 200));
  };

  const handleDecrement = () => {
    handleHeightChange(Math.max(height - 10, 10));
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setHeight(block.attributes.height);
      setIsEditing(false);
    }
  };

  return (
    <BaseBlock
      block={block}
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onDuplicate={onDuplicate}
    >
      <div className="relative">
        <div
          className="spacer-block"
          style={{ height: `${height}px` }}
          onDoubleClick={handleDoubleClick}
        >
          {/* Spacer Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-sm font-medium">
                Espaçador
              </div>
              <div className="text-xs">
                {height}px
              </div>
            </div>
          </div>

          {/* Height Controls */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border p-1 z-10">
              <div className="flex items-center space-x-1">
                <WordPressButton
                  variant="tertiary"
                  size="small"
                  onClick={handleDecrement}
                  className="p-1"
                >
                  <Minus className="h-4 w-4" />
                </WordPressButton>
                
                {isEditing ? (
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 10)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-16 text-center text-sm border border-gray-300 rounded px-1"
                    min="10"
                    max="200"
                    autoFocus
                    aria-label="Altura do espaçador"
                  />
                ) : (
                  <span
                    className="text-sm text-gray-600 cursor-pointer px-2"
                    onClick={() => setIsEditing(true)}
                  >
                    {height}px
                  </span>
                )}
                
                <WordPressButton
                  variant="tertiary"
                  size="small"
                  onClick={handleIncrement}
                  className="p-1"
                >
                  <Plus className="h-4 w-4" />
                </WordPressButton>
              </div>
            </div>
          )}

          {/* Resize Handles */}
          {isSelected && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-blue-500 rounded-t cursor-ns-resize" />
          )}
        </div>
      </div>
    </BaseBlock>
  );
}
