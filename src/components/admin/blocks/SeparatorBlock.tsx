'use client';

import { SeparatorBlock as SeparatorBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { Minus, MoreHorizontal, Circle } from 'lucide-react';

interface SeparatorBlockProps {
  block: SeparatorBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: SeparatorBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function SeparatorBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: SeparatorBlockProps) {
  const handleStyleChange = (style: 'default' | 'wide' | 'dots') => {
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        style
      }
    });
  };

  const renderSeparator = () => {
    switch (block.attributes.style) {
      case 'wide':
        return (
          <div className="w-full h-px bg-gray-300 relative">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
          </div>
        );
      case 'dots':
        return (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Circle className="h-2 w-2 text-gray-400" />
            <Circle className="h-2 w-2 text-gray-400" />
            <Circle className="h-2 w-2 text-gray-400" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center py-4">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="px-4 text-gray-400">
              <Minus className="h-4 w-4" />
            </div>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        );
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
        {renderSeparator()}

        {/* Style Controls */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border p-1 z-10">
            <div className="flex items-center space-x-1">
              <WordPressButton
                variant={block.attributes.style === 'default' ? 'primary' : 'tertiary'}
                size="small"
                onClick={() => handleStyleChange('default')}
                className="p-1"
                title="Padrão"
              >
                <Minus className="h-4 w-4" />
              </WordPressButton>
              
              <WordPressButton
                variant={block.attributes.style === 'wide' ? 'primary' : 'tertiary'}
                size="small"
                onClick={() => handleStyleChange('wide')}
                className="p-1"
                title="Largo"
              >
                <MoreHorizontal className="h-4 w-4" />
              </WordPressButton>
              
              <WordPressButton
                variant={block.attributes.style === 'dots' ? 'primary' : 'tertiary'}
                size="small"
                onClick={() => handleStyleChange('dots')}
                className="p-1"
                title="Pontos"
              >
                <Circle className="h-4 w-4" />
              </WordPressButton>
            </div>
          </div>
        )}
      </div>
    </BaseBlock>
  );
}
