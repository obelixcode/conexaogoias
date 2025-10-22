'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  FileImage, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Code,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Digite seu conteúdo aqui...",
  className = ""
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Garantir que o componente está montado antes de manipular o DOM
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Sincronizar conteúdo quando ele mudar externamente
  useEffect(() => {
    if (isMounted && editorRef.current && document.contains(editorRef.current)) {
      try {
        // Só atualizar se o conteúdo for diferente do que está no editor
        if (editorRef.current.innerHTML !== content) {
          editorRef.current.innerHTML = content;
        }
      } catch (error) {
        console.warn('Error syncing content:', error);
      }
    }
  }, [content, isMounted]);

  const updateContent = useCallback(() => {
    if (!isMounted || !editorRef.current) return;
    
    try {
      // Verificar se o elemento ainda está no DOM
      if (document.contains(editorRef.current)) {
        onChange(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.warn('Error updating content:', error);
    }
  }, [isMounted, onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    if (!isMounted || !editorRef.current) return;
    
    try {
      // Verificar se o elemento ainda está no DOM
      if (document.contains(editorRef.current)) {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        updateContent();
      }
    } catch (error) {
      console.warn('Error executing command:', error);
    }
  }, [isMounted, updateContent]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    if (!isMounted || !editorRef.current) return;
    
    try {
      const text = e.clipboardData.getData('text/plain');
      if (document.contains(editorRef.current)) {
        document.execCommand('insertText', false, text);
        updateContent();
      }
    } catch (error) {
      console.warn('Error pasting content:', error);
    }
  }, [isMounted, updateContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+B para negrito
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    // Ctrl+I para itálico
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
    // Ctrl+U para sublinhado
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      execCommand('underline');
    }
  }, [execCommand]);

  const insertLink = useCallback(() => {
    if (!isMounted) return;
    
    try {
      const url = prompt('Digite a URL do link:');
      if (url) {
        execCommand('createLink', url);
      }
    } catch (error) {
      console.warn('Error inserting link:', error);
    }
  }, [isMounted, execCommand]);

  const insertImage = useCallback(() => {
    if (!isMounted) return;
    
    try {
      const url = prompt('Digite a URL da imagem:');
      if (url) {
        execCommand('insertImage', url);
      }
    } catch (error) {
      console.warn('Error inserting image:', error);
    }
  }, [isMounted, execCommand]);

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Formatação de texto */}
        <div className="flex border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => execCommand('bold')}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('italic')}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('underline')}
            title="Sublinhado (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alinhamento */}
        <div className="flex border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => execCommand('justifyLeft')}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('justifyCenter')}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('justifyRight')}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('justifyFull')}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Listas */}
        <div className="flex border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => execCommand('insertUnorderedList')}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('insertOrderedList')}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Elementos especiais */}
        <div className="flex border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => execCommand('formatBlock', 'blockquote')}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('formatBlock', 'pre')}
            title="Código"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Links e imagens */}
        <div className="flex border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={insertLink}
            title="Inserir link"
          >
            <Link className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={insertImage}
            title="Inserir imagem"
          >
            <FileImage className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Desfazer/Refazer */}
        <div className="flex">
          <ToolbarButton
            onClick={() => execCommand('undo')}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('redo')}
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={() => {
          if (!isMounted) return;
          try {
            updateContent();
          } catch (error) {
            console.warn('Error on input:', error);
          }
        }}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[300px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
        data-placeholder={content === '' ? placeholder : ''}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={isMounted ? { __html: content } : undefined}
      />

      {/* Placeholder styles are handled via CSS classes */}
    </div>
  );
}
