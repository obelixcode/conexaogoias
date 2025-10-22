'use client';

import { useState, useRef, useEffect } from 'react';
import { ButtonBlock as ButtonBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { Link, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ButtonBlockProps {
  block: ButtonBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: ButtonBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function ButtonBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: ButtonBlockProps) {
  const [text, setText] = useState(block.attributes.text);
  const [url, setUrl] = useState(block.attributes.url);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const textRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingText && textRef.current) {
      textRef.current.focus();
      textRef.current.select();
    }
  }, [isEditingText]);

  useEffect(() => {
    if (isEditingUrl && urlRef.current) {
      urlRef.current.focus();
      urlRef.current.select();
    }
  }, [isEditingUrl]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleTextBlur = () => {
    setIsEditingText(false);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        text: text.trim() || 'Botão'
      }
    });
  };

  const handleUrlBlur = () => {
    setIsEditingUrl(false);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        url: url.trim() || '#'
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'text' | 'url') => {
    if (e.key === 'Enter') {
      if (type === 'text') {
        handleTextBlur();
      } else {
        handleUrlBlur();
      }
    }
    if (e.key === 'Escape') {
      if (type === 'text') {
        setText(block.attributes.text);
        setIsEditingText(false);
      } else {
        setUrl(block.attributes.url);
        setIsEditingUrl(false);
      }
    }
  };

  const handleTextClick = () => {
    if (!isEditingText) {
      setIsEditingText(true);
    }
  };

  const handleUrlClick = () => {
    if (!isEditingUrl) {
      setIsEditingUrl(true);
    }
  };

  const handleAlignmentChange = (align: 'left' | 'center' | 'right') => {
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        align
      }
    });
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  };

  const getButtonStyle = () => {
    return {
      backgroundColor: block.attributes.backgroundColor || '#0073aa',
      color: block.attributes.textColor || '#ffffff',
      borderRadius: `${block.attributes.borderRadius || 4}px`,
      fontSize: block.attributes.fontSize || '16px',
      padding: '12px 24px',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block'
    };
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
        <div className={cn("flex", getAlignmentClass(block.attributes.align))}>
          {isEditingText ? (
            <input
              ref={textRef}
              type="text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={(e) => handleKeyDown(e, 'text')}
              className="border-none outline-none bg-transparent text-center min-w-[120px]"
              placeholder="Texto do botão"
            />
          ) : (
            <button
              style={getButtonStyle()}
              onClick={handleTextClick}
              className="hover:opacity-90 transition-opacity"
            >
              {block.attributes.text || 'Botão'}
            </button>
          )}
        </div>

        {/* URL Display */}
        {block.attributes.url && block.attributes.url !== '#' && (
          <div className="mt-2 text-center">
            {isEditingUrl ? (
              <input
                ref={urlRef}
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={handleUrlBlur}
                onKeyDown={(e) => handleKeyDown(e, 'url')}
                className="text-sm text-gray-600 border-none outline-none bg-transparent text-center min-w-[200px]"
                placeholder="https://exemplo.com"
              />
            ) : (
              <span
                className="text-sm text-gray-600 cursor-text"
                onClick={handleUrlClick}
              >
                {block.attributes.url}
              </span>
            )}
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

        {/* URL Controls */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border p-2 z-10">
            <div className="flex items-center space-x-1">
              <WordPressButton
                variant="tertiary"
                size="small"
                onClick={() => setIsEditingUrl(true)}
                className="p-1"
              >
                <Link className="h-4 w-4" />
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
