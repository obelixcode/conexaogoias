'use client';

import { useState, useRef, useEffect } from 'react';
import { CodeBlock as CodeBlockType } from '@/types/block';
import { BaseBlock } from './BaseBlock';
import { WordPressButton } from '@/components/admin/WordPressButton';
import { Code, Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  block: CodeBlockType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: CodeBlockType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function CodeBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate
}: CodeBlockProps) {
  const [content, setContent] = useState(block.attributes.content);
  const [language, setLanguage] = useState(block.attributes.language || '');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({
      ...block,
      attributes: {
        ...block.attributes,
        content: content.trim() || '// Digite seu código aqui...',
        language: language.trim()
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setContent(block.attributes.content);
      setLanguage(block.attributes.language || '');
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.attributes.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getLanguageLabel = (lang?: string) => {
    if (!lang) return 'Texto';
    
    const languageMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'bash': 'Bash',
      'sql': 'SQL'
    };
    
    return languageMap[lang.toLowerCase()] || lang;
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
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                {getLanguageLabel(block.attributes.language)}
              </span>
            </div>
            
            {isSelected && (
              <WordPressButton
                variant="tertiary"
                size="small"
                onClick={handleCopy}
                className="text-gray-300 hover:text-white p-1"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </WordPressButton>
            )}
          </div>

          {/* Code Content */}
          <div className="relative">
            {isEditing ? (
              <div className="p-4">
                <div className="mb-2">
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    placeholder="Linguagem (opcional)"
                    className="text-sm bg-gray-800 text-gray-300 border border-gray-600 rounded px-2 py-1 w-32"
                  />
                </div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="w-full h-64 resize-none border-none outline-none bg-transparent text-gray-100 font-mono text-sm leading-relaxed"
                  placeholder="// Digite seu código aqui..."
                />
              </div>
            ) : (
              <pre
                className="p-4 text-gray-100 font-mono text-sm leading-relaxed cursor-text overflow-x-auto"
                onClick={handleClick}
              >
                <code className={block.attributes.language ? `language-${block.attributes.language}` : ''}>
                  {block.attributes.content || '// Digite seu código aqui...'}
                </code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  );
}
