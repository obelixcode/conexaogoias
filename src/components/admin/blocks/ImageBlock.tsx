'use client';

import { useState } from 'react';
import { ImageBlock as ImageBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';
import { ImageUploader } from '@/components/ImageUploader';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { Edit, Link, Unlink, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ImageBlockProps {
  block: ImageBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: ImageBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function ImageBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: ImageBlockProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [caption, setCaption] = useState(block.attributes.caption || '');

  const handleImageUpload = (url: string) => {
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        url
      }
    });
  };

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
  };

  const handleCaptionBlur = () => {
    setIsEditingCaption(false);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        caption: caption.trim()
      }
    });
  };

  const handleAlignmentChange = (align: 'left' | 'center' | 'right' | 'wide' | 'full') => {
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        align
      }
    });
  };

  const handleLinkChange = (linkTo: 'none' | 'media' | 'attachment' | 'custom', linkUrl?: string) => {
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        linkTo,
        linkUrl: linkUrl || ''
      }
    });
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'mx-auto';
      case 'right':
        return 'ml-auto';
      case 'wide':
        return 'w-full max-w-4xl mx-auto';
      case 'full':
        return 'w-full';
      default:
        return 'mr-auto';
    }
  };

  const renderImage = () => {
    if (!block.attributes.url) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageUploader
            onImageUploaded={handleImageUpload}
            className="w-full h-48 flex items-center justify-center"
          />
        </div>
      );
    }

    const imageElement = (
      <img
        src={block.attributes.url}
        alt={block.attributes.alt}
        className={cn(
          "max-w-full h-auto rounded-lg",
          getAlignmentClass(block.attributes.align)
        )}
        style={{
          width: block.attributes.width ? `${block.attributes.width}px` : 'auto',
          height: block.attributes.height ? `${block.attributes.height}px` : 'auto'
        }}
      />
    );

    if (block.attributes.linkTo === 'custom' && block.attributes.linkUrl) {
      return (
        <a
          href={block.attributes.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {imageElement}
        </a>
      );
    }

    return imageElement;
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
        {renderImage()}
        
        {/* Caption */}
        {(block.attributes.caption || isEditingCaption) && (
          <div className="mt-2 text-center text-sm text-gray-600">
            {isEditingCaption ? (
              <input
                type="text"
                value={caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                onBlur={handleCaptionBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCaptionBlur();
                  }
                }}
                className="w-full text-center border-none outline-none bg-transparent"
                placeholder="Digite a legenda..."
                autoFocus
              />
            ) : (
              <span
                className="cursor-text"
                onClick={() => setIsEditingCaption(true)}
              >
                {block.attributes.caption}
              </span>
            )}
          </div>
        )}

        {/* Settings Panel */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border p-2 z-10">
            <div className="flex items-center space-x-1">
              <WordPressButton
                variant="tertiary"
                size="small"
                onClick={() => setShowSettings(!showSettings)}
                className="p-1"
              >
                <Edit className="h-4 w-4" />
              </WordPressButton>
              
              <WordPressButton
                variant="tertiary"
                size="small"
                onClick={() => setIsEditingCaption(true)}
                className="p-1"
              >
                <Edit className="h-4 w-4" />
              </WordPressButton>
            </div>
          </div>
        )}

        {/* Alignment Controls */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg border p-1 z-10">
            <div className="flex items-center space-x-1">
              <WordPressButton
                variant={block.attributes.align === 'left' ? 'primary' : 'tertiary'}
                size="small"
                onClick={() => handleAlignmentChange('left')}
                className="p-1"
              >
                <AlignLeft className="h-4 w-4" />
              </WordPressButton>
              
              <WordPressButton
                variant={block.attributes.align === 'center' ? 'primary' : 'tertiary'}
                size="small"
                onClick={() => handleAlignmentChange('center')}
                className="p-1"
              >
                <AlignCenter className="h-4 w-4" />
              </WordPressButton>
              
              <WordPressButton
                variant={block.attributes.align === 'right' ? 'primary' : 'tertiary'}
                size="small"
                onClick={() => handleAlignmentChange('right')}
                className="p-1"
              >
                <AlignRight className="h-4 w-4" />
              </WordPressButton>
            </div>
          </div>
        )}
      </div>
    </BaseBlock>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
