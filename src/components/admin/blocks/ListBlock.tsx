'use client';

import { useState, useRef, useEffect } from 'react';
import { ListBlock as ListBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { List, ListOrdered } from 'lucide-react';

interface ListBlockProps {
  block: ListBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: ListBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function ListBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: ListBlockProps) {
  const [content, setContent] = useState(block.attributes.content);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
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
        content: content.trim() || 'Item 1\nItem 2\nItem 3'
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  const handleToggleOrdered = () => {
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        ordered: !block.attributes.ordered
      }
    });
  };

  const parseListItems = (content: string) => {
    return content
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());
  };

  const renderList = () => {
    const items = parseListItems(block.attributes.content);
    
    if (block.attributes.ordered) {
      return (
        <ol 
          className="list-decimal list-inside space-y-1"
          start={block.attributes.start}
          reversed={block.attributes.reversed}
        >
          {items.map((item, index) => (
            <li key={index} className="text-gray-900">
              {item}
            </li>
          ))}
        </ol>
      );
    } else {
      return (
        <ul className="list-disc list-inside space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-gray-900">
              {item}
            </li>
          ))}
        </ul>
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
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full resize-none border-none outline-none bg-transparent min-h-[100px]"
            placeholder="Digite cada item em uma nova linha..."
          />
        ) : (
          <div
            className="cursor-text min-h-[100px]"
            onClick={handleClick}
          >
            {block.attributes.content ? (
              renderList()
            ) : (
              <div className="text-gray-400 italic">
                Clique para editar a lista...
              </div>
            )}
          </div>
        )}

        {/* List Type Toggle */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border p-1 z-10">
            <WordPressButton
              variant={block.attributes.ordered ? 'primary' : 'tertiary'}
              size="small"
              onClick={handleToggleOrdered}
              className="p-1"
            >
              {block.attributes.ordered ? (
                <ListOrdered className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </WordPressButton>
          </div>
        )}
      </div>
    </BaseBlock>
  );
}
