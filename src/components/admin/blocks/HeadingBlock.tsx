'use client';

import { useState, useRef, useEffect } from 'react';
import { HeadingBlock as HeadingBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';

interface HeadingBlockProps {
  block: HeadingBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: HeadingBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function HeadingBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: HeadingBlockProps) {
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
        content: content.trim() || 'Digite o título...'
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

  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1:
        return 'text-4xl font-bold';
      case 2:
        return 'text-3xl font-bold';
      case 3:
        return 'text-2xl font-semibold';
      case 4:
        return 'text-xl font-semibold';
      case 5:
        return 'text-lg font-medium';
      case 6:
        return 'text-base font-medium';
      default:
        return 'text-2xl font-semibold';
    }
  };

  const HeadingTag = `h${block.attributes.level}` as keyof React.JSX.IntrinsicElements;

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
          getHeadingClass(block.attributes.level),
          block.attributes.textColor && `text-[${block.attributes.textColor}]`
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
            aria-label="Editar título"
            placeholder="Digite o título..."
          />
        ) : (
          <HeadingTag className="m-0">
            {block.attributes.content || 'Digite o título...'}
          </HeadingTag>
        )}
      </div>
    </BaseBlock>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
