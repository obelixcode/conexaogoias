'use client';

import { useState, useRef, useEffect } from 'react';
import { QuoteBlock as QuoteBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';
import { Quote } from 'lucide-react';

interface QuoteBlockProps {
  block: QuoteBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: QuoteBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function QuoteBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: QuoteBlockProps) {
  const [content, setContent] = useState(block.attributes.content);
  const [citation, setCitation] = useState(block.attributes.citation || '');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isEditingCitation, setIsEditingCitation] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const citationRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingContent && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isEditingContent]);

  useEffect(() => {
    if (isEditingCitation && citationRef.current) {
      citationRef.current.focus();
    }
  }, [isEditingCitation]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleCitationChange = (newCitation: string) => {
    setCitation(newCitation);
  };

  const handleContentBlur = () => {
    setIsEditingContent(false);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        content: content.trim() || 'Digite a citação...'
      }
    });
  };

  const handleCitationBlur = () => {
    setIsEditingCitation(false);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        citation: citation.trim()
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'content' | 'citation') => {
    if (e.key === 'Escape') {
      if (type === 'content') {
        setContent(block.attributes.content);
        setIsEditingContent(false);
      } else {
        setCitation(block.attributes.citation || '');
        setIsEditingCitation(false);
      }
    }
  };

  const handleContentClick = () => {
    if (!isEditingContent) {
      setIsEditingContent(true);
    }
  };

  const handleCitationClick = () => {
    if (!isEditingCitation) {
      setIsEditingCitation(true);
    }
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
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
        <blockquote className={cn(
          "border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg",
          getAlignmentClass(block.attributes.align)
        )}>
          <div className="flex items-start space-x-3">
            <Quote className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
            
            <div className="flex-1 min-w-0">
              {isEditingContent ? (
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onBlur={handleContentBlur}
                  onKeyDown={(e) => handleKeyDown(e, 'content')}
                  className="w-full resize-none border-none outline-none bg-transparent min-h-[60px] text-lg italic"
                  placeholder="Digite a citação..."
                />
              ) : (
                <p
                  className="text-lg italic text-gray-900 cursor-text"
                  onClick={handleContentClick}
                >
                  {block.attributes.content || 'Digite a citação...'}
                </p>
              )}
              
              {block.attributes.citation && (
                <div className="mt-2">
                  {isEditingCitation ? (
                    <input
                      ref={citationRef}
                      type="text"
                      value={citation}
                      onChange={(e) => handleCitationChange(e.target.value)}
                      onBlur={handleCitationBlur}
                      onKeyDown={(e) => handleKeyDown(e, 'citation')}
                      className="w-full border-none outline-none bg-transparent text-sm text-gray-600"
                      placeholder="Digite a fonte..."
                    />
                  ) : (
                    <cite
                      className="text-sm text-gray-600 cursor-text not-italic"
                      onClick={handleCitationClick}
                    >
                      — {block.attributes.citation}
                    </cite>
                  )}
                </div>
              )}
            </div>
          </div>
        </blockquote>

        {/* Citation Toggle */}
        {isSelected && !block.attributes.citation && (
          <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border p-2 z-10">
            <button
              onClick={() => setIsEditingCitation(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Adicionar fonte
            </button>
          </div>
        )}
      </div>
    </BaseBlock>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
