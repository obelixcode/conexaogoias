'use client';

import { useState, useRef, useEffect } from 'react';
import { ParagraphBlock as ParagraphBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';

interface ParagraphBlockProps {
  block: ParagraphBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: ParagraphBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function ParagraphBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: ParagraphBlockProps) {
  const [content, setContent] = useState(block.attributes.content);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        content: content.trim() || 'Digite aqui...'
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setContent(block.attributes.content);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      default:
        return 'text-left';
    }
  };

  const getFontSizeClass = (fontSize?: string) => {
    switch (fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      case 'xlarge':
        return 'text-xl';
      default:
        return 'text-base';
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
      <div
        className={cn(
          "min-h-[1.5em] cursor-text",
          getAlignmentClass(block.attributes.align),
          getFontSizeClass(block.attributes.fontSize),
          block.attributes.textColor && `text-[${block.attributes.textColor}]`,
          block.attributes.backgroundColor && `bg-[${block.attributes.backgroundColor}]`
        )}
        onClick={handleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full resize-none border-none outline-none bg-transparent min-h-[1.5em]"
            aria-label="Editar parágrafo"
            placeholder="Digite aqui..."
          />
        ) : (
          <p className="m-0">
            {block.attributes.content || 'Digite aqui...'}
          </p>
        )}
      </div>
    </BaseBlock>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
