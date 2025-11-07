'use client';

import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Palette,
  Highlighter,
  Undo,
  Redo
} from 'lucide-react';
import { StorageService } from '@/lib/storageService';
import { useSafeDOM } from '@/hooks/useSafeDOM';
import { ClientOnly } from './ClientOnly';
import { useState, useEffect } from 'react';

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

function EditorContent({ 
  content = '', 
  onChange, 
  placeholder = 'Comece a escrever...',
  className = '' 
}: EditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { safeCreateElement, safeAppendChild, safeRemoveElement } = useSafeDOM();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false, // Disable default link extension
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Cleanup do editor quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        try {
          // Limpar event listeners antes de destruir
          editor.off('update');
          editor.off('selectionUpdate');
          editor.off('transaction');
          
          // Destruir o editor
          editor.destroy();
        } catch (error) {
          console.warn('Error destroying editor:', error);
        }
      }
    };
  }, [editor]);

  const addImage = async () => {
    if (typeof window === 'undefined' || !document?.body) return;
    
    const input = safeCreateElement('input', {
      type: 'file',
      accept: 'image/*',
      style: 'display: none'
    });
    
    if (!input) return;
    
    try {
      // Adicionar ao DOM temporariamente
      if (safeAppendChild(document.body, input)) {
        input.onchange = async (e) => {
          try {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            // Validate file
            const validation = StorageService.validateImageFile(file);
            if (!validation.isValid) {
              alert(validation.error);
              return;
            }

            setIsUploading(true);
            
            try {
              const imageUrl = await StorageService.uploadContentImage(file, (progress) => {
                console.log('Upload progress:', progress);
              });
              
              editor?.chain().focus().setImage({ src: imageUrl }).run();
            } catch (error) {
              console.error('Error uploading image:', error);
              alert('Erro ao fazer upload da imagem');
            } finally {
              setIsUploading(false);
            }
          } catch (error) {
            console.warn('Error handling file upload:', error);
          } finally {
            // Cleanup seguro
            setTimeout(() => {
              safeRemoveElement(input);
            }, 100);
          }
        };
        
        input.click();
      }
    } catch (error) {
      console.warn('Error creating file input:', error);
      safeRemoveElement(input);
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        {/* Links and media */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="sm"
            onClick={setLink}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
          >
            <Unlink className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
            disabled={isUploading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setColor('#ef4444').run()}
          >
            <div className="w-4 h-4 bg-red-500 rounded" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setColor('#f97316').run()}
          >
            <div className="w-4 h-4 bg-orange-500 rounded" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setColor('#eab308').run()}
          >
            <div className="w-4 h-4 bg-yellow-500 rounded" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setColor('#22c55e').run()}
          >
            <div className="w-4 h-4 bg-green-500 rounded" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setColor('#3b82f6').run()}
          >
            <div className="w-4 h-4 bg-blue-500 rounded" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setColor('#8b5cf6').run()}
          >
            <div className="w-4 h-4 bg-purple-500 rounded" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </div>

        {/* Highlight */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('highlight') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor content */}
      <TiptapEditorContent editor={editor} />
      
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-sm text-gray-600">Fazendo upload da imagem...</div>
        </div>
      )}
    </div>
  );
}

export function Editor(props: EditorProps) {
  return (
    <ClientOnly 
      fallback={
        <div className="border border-gray-300 rounded-lg min-h-[300px] p-4 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Carregando editor...</div>
        </div>
      }
    >
      <EditorContent {...props} />
    </ClientOnly>
  );
}
