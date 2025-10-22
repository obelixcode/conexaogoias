export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'list'
  | 'quote'
  | 'code'
  | 'video'
  | 'gallery'
  | 'html'
  | 'spacer'
  | 'separator'
  | 'button'
  | 'columns'
  | 'group';

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: string;
  attributes: Record<string, unknown>;
  innerBlocks?: BaseBlock[];
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  attributes: {
    content: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  attributes: {
    content: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    align?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: string;
    textColor?: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  attributes: {
    url: string;
    alt: string;
    caption?: string;
    align?: 'left' | 'center' | 'right' | 'wide' | 'full';
    width?: number;
    height?: number;
    linkTo?: 'none' | 'media' | 'attachment' | 'custom';
    linkUrl?: string;
  };
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  attributes: {
    content: string;
    ordered: boolean;
    start?: number;
    reversed?: boolean;
  };
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  attributes: {
    content: string;
    citation?: string;
    align?: 'left' | 'center' | 'right';
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  attributes: {
    content: string;
    language?: string;
  };
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  attributes: {
    url: string;
    caption?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
  };
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  attributes: {
    images: Array<{
      id: string;
      url: string;
      alt: string;
      caption?: string;
    }>;
    columns?: number;
    linkTo?: 'none' | 'media' | 'attachment';
    size?: 'thumbnail' | 'medium' | 'large' | 'full';
  };
}

export interface HtmlBlock extends BaseBlock {
  type: 'html';
  attributes: {
    content: string;
  };
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  attributes: {
    height: number;
  };
}

export interface SeparatorBlock extends BaseBlock {
  type: 'separator';
  attributes: {
    style?: 'default' | 'wide' | 'dots';
  };
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  attributes: {
    text: string;
    url: string;
    linkTarget?: '_blank' | '_self';
    rel?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
  };
}

export interface ColumnsBlock extends BaseBlock {
  type: 'columns';
  attributes: {
    columns: number;
    verticalAlignment?: 'top' | 'center' | 'bottom';
  };
  innerBlocks: BaseBlock[];
}

export interface GroupBlock extends BaseBlock {
  type: 'group';
  attributes: {
    backgroundColor?: string;
    textColor?: string;
    padding?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    margin?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  innerBlocks: BaseBlock[];
}

export type Block = 
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | VideoBlock
  | GalleryBlock
  | HtmlBlock
  | SpacerBlock
  | SeparatorBlock
  | ButtonBlock
  | ColumnsBlock
  | GroupBlock;

export interface BlockEditorState {
  blocks: Block[];
  selectedBlockId: string | null;
  isFullscreen: boolean;
  isPreview: boolean;
}

export interface BlockToolbarProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export interface BlockInspectorProps {
  block: Block;
  onUpdate: (block: Block) => void;
}
