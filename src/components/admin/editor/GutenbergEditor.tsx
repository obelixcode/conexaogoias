'use client';

import { useState, useCallback } from 'react';
import { 
  Block, 
  BlockType, 
  ParagraphBlock as ParagraphBlockType,
  HeadingBlock as HeadingBlockType,
  ImageBlock as ImageBlockType,
  ListBlock as ListBlockType,
  QuoteBlock as QuoteBlockType,
  CodeBlock as CodeBlockType,
  ButtonBlock as ButtonBlockType,
  SpacerBlock as SpacerBlockType,
  SeparatorBlock as SeparatorBlockType
} from '@/types/block';
import { ParagraphBlock } from '../blocks/ParagraphBlock';
import { HeadingBlock } from '../blocks/HeadingBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { ListBlock } from '../blocks/ListBlock';
import { QuoteBlock } from '../blocks/QuoteBlock';
import { CodeBlock } from '../blocks/CodeBlock';
import { ButtonBlock } from '../blocks/ButtonBlock';
import { SpacerBlock } from '../blocks/SpacerBlock';
import { SeparatorBlock } from '../blocks/SeparatorBlock';
import { WordPressButton } from '../WordPressButton';
import { 
  Plus, 
  Type, 
  Image, 
  List, 
  Quote, 
  Code, 
  MousePointer,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';

interface GutenbergEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  className?: string;
}

export function GutenbergEditor({ 
  blocks, 
  onBlocksChange, 
  className = '' 
}: GutenbergEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showBlockInserter, setShowBlockInserter] = useState(false);

  const generateBlockId = () => {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createBlock = (type: BlockType): Block => {
    const id = generateBlockId();
    
    switch (type) {
      case 'paragraph':
        return {
          id,
          type: 'paragraph',
          content: '',
          attributes: {
            content: 'Digite aqui...',
            align: 'left'
          }
        };
      case 'heading':
        return {
          id,
          type: 'heading',
          content: '',
          attributes: {
            content: 'Digite o título...',
            level: 2,
            align: 'left'
          }
        };
      case 'image':
        return {
          id,
          type: 'image',
          content: '',
          attributes: {
            url: '',
            alt: '',
            caption: '',
            align: 'left'
          }
        };
      case 'list':
        return {
          id,
          type: 'list',
          content: '',
          attributes: {
            content: 'Item 1\nItem 2\nItem 3',
            ordered: false
          }
        };
      case 'quote':
        return {
          id,
          type: 'quote',
          content: '',
          attributes: {
            content: 'Digite a citação...',
            citation: '',
            align: 'left'
          }
        };
      case 'code':
        return {
          id,
          type: 'code',
          content: '',
          attributes: {
            content: '// Digite seu código aqui...',
            language: ''
          }
        };
      case 'button':
        return {
          id,
          type: 'button',
          content: '',
          attributes: {
            text: 'Botão',
            url: '#',
            linkTarget: '_self',
            backgroundColor: '#0073aa',
            textColor: '#ffffff',
            borderRadius: 4,
            align: 'left'
          }
        };
      case 'spacer':
        return {
          id,
          type: 'spacer',
          content: '',
          attributes: {
            height: 50
          }
        };
      case 'separator':
        return {
          id,
          type: 'separator',
          content: '',
          attributes: {
            style: 'default'
          }
        };
      default:
        return {
          id,
          type: 'paragraph',
          content: '',
          attributes: {
            content: 'Digite aqui...',
            align: 'left'
          }
        };
    }
  };

  const addBlock = (type: BlockType, index?: number) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks];
    
    if (index !== undefined) {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    
    onBlocksChange(newBlocks);
    setSelectedBlockId(newBlock.id);
    setShowBlockInserter(false);
  };

  const updateBlock = (updatedBlock: Block) => {
    const newBlocks = blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    onBlocksChange(newBlocks);
  };

  const deleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onBlocksChange(newBlocks);
    setSelectedBlockId(null);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(currentIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    
    onBlocksChange(newBlocks);
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const duplicatedBlock = {
      ...blockToDuplicate,
      id: generateBlockId()
    };

    const currentIndex = blocks.findIndex(block => block.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(currentIndex + 1, 0, duplicatedBlock);
    
    onBlocksChange(newBlocks);
    setSelectedBlockId(duplicatedBlock.id);
  };

  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      key: block.id,
      block,
      isSelected: selectedBlockId === block.id,
      onSelect: () => setSelectedBlockId(block.id),
      onUpdate: updateBlock,
      onDelete: () => deleteBlock(block.id),
      onMoveUp: () => moveBlock(block.id, 'up'),
      onMoveDown: () => moveBlock(block.id, 'down'),
      onDuplicate: () => duplicateBlock(block.id)
    };

    switch (block.type) {
      case 'paragraph':
        return <ParagraphBlock {...commonProps} block={block as ParagraphBlockType} />;
      case 'heading':
        return <HeadingBlock {...commonProps} block={block as HeadingBlockType} />;
      case 'image':
        return <ImageBlock {...commonProps} block={block as ImageBlockType} />;
      case 'list':
        return <ListBlock {...commonProps} block={block as ListBlockType} />;
      case 'quote':
        return <QuoteBlock {...commonProps} block={block as QuoteBlockType} />;
      case 'code':
        return <CodeBlock {...commonProps} block={block as CodeBlockType} />;
      case 'button':
        return <ButtonBlock {...commonProps} block={block as ButtonBlockType} />;
      case 'spacer':
        return <SpacerBlock {...commonProps} block={block as SpacerBlockType} />;
      case 'separator':
        return <SeparatorBlock {...commonProps} block={block as SeparatorBlockType} />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  const blockTypes = [
    { type: 'paragraph' as BlockType, label: 'Parágrafo', icon: Type },
    { type: 'heading' as BlockType, label: 'Título', icon: Type },
    { type: 'image' as BlockType, label: 'Imagem', icon: Image },
    { type: 'list' as BlockType, label: 'Lista', icon: List },
    { type: 'quote' as BlockType, label: 'Citação', icon: Quote },
    { type: 'code' as BlockType, label: 'Código', icon: Code },
    { type: 'button' as BlockType, label: 'Botão', icon: MousePointer },
    { type: 'spacer' as BlockType, label: 'Espaçador', icon: AlignLeft },
    { type: 'separator' as BlockType, label: 'Separador', icon: AlignCenter }
  ];

  return (
    <div className={`gutenberg-editor ${className}`}>
      {/* Block Inserter */}
      {showBlockInserter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Escolher Bloco</h3>
              <button
                onClick={() => setShowBlockInserter(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {blockTypes.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[500px] p-6 bg-white">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Type className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Comece a escrever
            </h3>
            <p className="text-gray-500 mb-4">
              Clique no botão abaixo para adicionar seu primeiro bloco
            </p>
            <WordPressButton onClick={() => addBlock('paragraph')}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Bloco
            </WordPressButton>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="relative">
                {renderBlock(block, index)}
                
                {/* Add Block Button */}
                <div className="flex justify-center my-4">
                  <button
                    onClick={() => setShowBlockInserter(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Adicionar bloco</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
