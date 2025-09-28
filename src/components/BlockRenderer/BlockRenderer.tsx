import React from 'react';
import type { PageBlock } from '../../types';
import TextBlockRenderer from './TextBlockRenderer';
import ImageBlockRenderer from './ImageBlockRenderer';
import VideoBlockRenderer from './VideoBlockRenderer';
import GalleryBlockRenderer from './GalleryBlockRenderer';
import CTABlockRenderer from './CTABlockRenderer';
import SpacerBlockRenderer from './SpacerBlockRenderer';
import HTMLBlockRenderer from './HTMLBlockRenderer';
import styles from './BlockRenderer.module.css';

interface BlockRendererProps {
  block: PageBlock;
  className?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, className }) => {
  if (!block.is_visible) {
    return null;
  }

  const blockClassName = `${styles.block} ${styles[`block--${block.block_type}`]} ${className || ''}`;
  const blockStyles = block.styles || {};

  const renderBlockContent = () => {
    switch (block.block_type) {
      case 'text':
        return <TextBlockRenderer block={block} />;
      case 'image':
        return <ImageBlockRenderer block={block} />;
      case 'video':
        return <VideoBlockRenderer block={block} />;
      case 'gallery':
        return <GalleryBlockRenderer block={block} />;
      case 'cta':
        return <CTABlockRenderer block={block} />;
      case 'spacer':
        return <SpacerBlockRenderer block={block} />;
      case 'html':
        return <HTMLBlockRenderer block={block} />;
      default:
        console.warn(`Unknown block type: ${block.block_type}`);
        return null;
    }
  };

  return (
    <div
      className={blockClassName}
      style={blockStyles}
      data-block-id={block.id}
      data-block-type={block.block_type}
    >
      {block.title && (
        <div className={styles.blockTitle}>
          <h2>{block.title}</h2>
        </div>
      )}
      <div className={styles.blockContent}>
        {renderBlockContent()}
      </div>
    </div>
  );
};

export default BlockRenderer;